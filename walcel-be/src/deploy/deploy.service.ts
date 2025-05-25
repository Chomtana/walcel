import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { existsSync, mkdirSync } from 'node:fs';
import { exec } from 'node:child_process';
import { getAllFiles } from './utils';
import { readFileSync } from 'fs';
import { PrismaService } from '../prisma.service';
import * as fs from 'node:fs';
import { StartDeploy } from './dto/start-deploy';
import { simpleGit } from 'simple-git';
import * as path from 'path';
import { UpdateEns } from './dto/update-ens';

@Injectable()
export class DeployService {
  private readonly logger = new Logger(DeployService.name);
  private buildPath = '/tmp/walcel/builds';
  private githubBaseDir = '/tmp/walcel/github';
  // private githubBaseDir = path.join(__dirname, '../../storage/github');
  private git = simpleGit();

  constructor(
    @InjectQueue('deploy-queue-walcel') private deployQueue: Queue,
    private prisma: PrismaService,
  ) {
    if (!existsSync(this.buildPath)) {
      mkdirSync(this.buildPath, { recursive: true });
    }
    if (!existsSync(this.githubBaseDir)) {
      mkdirSync(this.githubBaseDir, { recursive: true });
    }
  }

  async startDeploy(input: StartDeploy) {
    // insert into database
    const deployment = await this.prisma.deployment.create({
      data: {
        status: 'processing',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          connect: {
            id: input.projectId,
          },
        },
      },
    });

    await this.prisma.environment.update({
      where: {
        projectId: input.projectId,
      },
      data: {
        jsonText: input.envJson,
        updatedAt: new Date(),
      },
    });

    await this.deployQueue.add(deployment.id.toString(), deployment.id, {
      removeOnComplete: true,
    });

    return { deployId: deployment.id, status: 'processing' };
  }

  async fetchProject(deployId: number) {
    this.logger.log(`[DEPLOY] Fetching project with deployment: ${deployId}`);

    const deployment = await this.prisma.deployment.findFirst({
      where: { id: deployId },
      include: {
        project: {
          select: {
            githubUrl: true,
            githubBranch: true,
            environment: {
              select: {
                jsonText: true,
              },
            },
            buildConfig: {
              select: {
                outputDir: true,
                jsonText: true,
              },
            },
            siteId: true,
          },
        },
      },
    });
    if (!deployment) {
      throw new Error(`Deployment not found: ${deployId}`);
    }
    const outputDir = deployment.project?.buildConfig?.outputDir || 'dist';

    const projectPath = path.join(
      this.githubBaseDir,
      `${deployment.projectId}/${deployment.id}`,
    );
    let urlRepo = deployment.project ? deployment.project.githubUrl : '';
    if (!urlRepo || urlRepo === '') {
      throw new Error(
        `No GitHub URL found for project: ${deployment.projectId}`,
      );
    }
    if (!urlRepo.endsWith('.git')) {
      urlRepo += '.git';
    }
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      this.logger.log(`Cloning ${urlRepo} to ${projectPath}`);
    }
    try {
      await this.git.clone(urlRepo, projectPath, [
        `--branch=${deployment.project?.githubBranch || 'main'}`,
        '--single-branch',
      ]);
    } catch (error) {
      this.logger.error(`Failed to clone project: ${error}`);
      throw error;
    }

    this.logger.log(`[DEPLOY] Cloned project to: ${projectPath}`);

    const repoGit = simpleGit(projectPath);
    let commitHash = '';
    let commitTitle = '';
    const log = await repoGit.log({ maxCount: 1 });

    if (log.latest) {
      commitHash = log.latest.hash;
      commitTitle = log.latest.message.split('\n')[0];

      console.log(`[GIT] Latest commit hash: ${commitHash}`);
      console.log(`[GIT] Latest commit title: ${commitTitle}`);
    }

    if (deployment.project && deployment.project.environment) {
      if (
        deployment.project.environment.jsonText &&
        deployment.project.environment.jsonText !== ''
      ) {
        const jsonEnv = JSON.parse(deployment.project.environment.jsonText) as {
          key: string;
          value: string;
        }[];
        this.writeEnv(projectPath, jsonEnv);
      }
    }

    return [
      projectPath,
      `${deployment.projectId}-${deployment.id}`,
      commitHash,
      commitTitle,
      outputDir,
      deployment.project.siteId,
      deployment.projectId,
    ];
  }

  buildProject(projectPath: string) {
    return new Promise<string>((resolve, reject) => {
      this.logger.log(`[DEPLOY] Building project at: ${projectPath}`);
      const child = exec(`cd ${projectPath} && npm install && npm run build`);

      child.stdout?.on('data', function (data) {
        console.log('stdout: ' + data);
      });
      child.stderr?.on('data', function (data) {
        console.error('stderr: ' + data);
      });

      child.on('close', function (code) {
        console.log(`[DEPLOY] Build process exited with code ${code}`);
        if (code === 0) {
          resolve(projectPath);
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
      child.on('error', reject);
    });
  }

  async uploadToIPFS(
    uploadId: string,
    buildPath: string,
    outputDir: string,
    siteId?: string | null,
  ) {
    this.logger.log(`[DEPLOY] Publishing site from: ${buildPath}`);
    try {
      const distPath = `${buildPath}/${outputDir}`;

      return new Promise<string>((resolve, reject) => {
        const command = siteId
          ? `site-builder update --epochs 1 ${distPath} ${siteId}`
          : `site-builder publish ${distPath} --epochs 1`;

        const child = exec(command);

        let output = '';
        child.stdout?.on('data', (data) => {
          output += data;
          console.log('stdout: ' + data);
        });
        child.stderr?.on('data', (data) => {
          console.error('stderr: ' + data);
        });

        child.on('close', (code) => {
          if (code === 0) {
            if (siteId) {
              // For update command, return existing siteId
              resolve(siteId);
            } else {
              // For publish command, extract new site ID from output
              const siteIdMatch = output.match(
                /New site object ID: (0x[a-f0-9]+)/,
              );
              if (siteIdMatch && siteIdMatch[1]) {
                resolve(siteIdMatch[1]);
              } else {
                reject(
                  new Error(`Could not find site ID in output:\n${output}`),
                );
              }
            }
          } else {
            reject(
              new Error(
                `${siteId ? 'Update' : 'Publish'} failed with code ${code}`,
              ),
            );
          }
        });
        child.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to publish site: ${error}`);
      throw error;
    }
  }

  async updateIPFSCid(
    deployId: number,
    ipfsCid: string,
    status: string,
    error: string,
    commitHash: string,
    commitTitle: string,
    projectId: string,
  ) {
    this.logger.log(`[DEPLOY] Updating IPFS CID for ${deployId}: ${ipfsCid}`);
    // Update the project with the new siteId
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        siteId: ipfsCid,
      },
    });
    // Update the database with the IPFS CID
    return this.prisma.deployment.update({
      where: { id: deployId },
      data: {
        ipfsCid,
        status,
        error,
        commitHash,
        commitTitle,
        updatedAt: new Date(),
        deployedAt: new Date(),
      },
    });
  }

  async getDeployment(deployId: number) {
    return this.prisma.deployment.findFirstOrThrow({
      where: { id: Number(deployId) },
      select: {
        ipfsCid: true,
        status: true,
        error: true,
      },
    });
  }

  writeEnv(projectPath: string, envVars: { key: string; value: string }[]) {
    const envPath = `${projectPath}/.env`;
    this.logger.log(`[DEPLOY] Writing env to: ${envPath}`);
    const envFile = envVars
      .map(({ key, value }) => `${key}=${value}`)
      .join('\n');

    return fs.writeFileSync(envPath, envFile);
  }

  updateEns(input: UpdateEns) {
    this.logger.log(`[DEPLOY] Updating ENS for ${input.projectId}`);
    return this.prisma.project.update({
      where: { id: input.projectId },
      data: {
        ensName: input.ensDomain,
        updatedAt: new Date(),
        deployments: {
          update: {
            where: {
              id: input.deployId,
            },
            data: {
              status: 'ready',
              updatedAt: new Date(),
            },
          },
        },
      },
    });
  }
}

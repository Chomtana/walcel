import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UploadGithub } from './dto/upload-github';
import { generate } from './utils';
import { FileService } from './file.service';
import { PrismaService } from '../prisma.service';
import axios, { AxiosResponse } from 'axios';
import { DeployResponse } from '../deploy/dto/start-deploy';
import { DeployService } from 'src/deploy/deploy.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly deployServiceUrl = process.env.DEPLOY_SERVICE_URL;

  constructor(
    private readonly fileSrv: FileService,
    private readonly deployService: DeployService,
    private prisma: PrismaService,
  ) {}

  async uploadGithub(data: UploadGithub) {
    const repoUrl = data.url.trim();
    const envVarsJson = data.envJson;
    const isPublicRepo = await this.isRepoPublic(repoUrl);
    if (!isPublicRepo) {
      throw new BadRequestException('Repository is not public');
    }
    try {
      this.logger.log(`Uploading to Github: ${repoUrl}`);
      const projectInfo = await this.prisma.project.findFirst({
        where: {
          githubUrl: repoUrl,
          githubBranch: data.branch.trim(),
        },
      });

      const id = projectInfo ? projectInfo.id : generate();
      // save project info to db
      await this.prisma.project.upsert({
        where: {
          githubUrl_githubBranch: {
            githubUrl: repoUrl,
            githubBranch: data.branch.trim(),
          },
        },
        update: {
          updatedAt: new Date(),
          githubBranch: data.branch.trim(),
          environment: {
            update: {
              jsonText: envVarsJson,
              updatedAt: new Date(),
            },
          },
        },
        create: {
          id,
          githubUrl: repoUrl,
          githubBranch: data.branch.trim(),
          address: data.address.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
          environment: {
            create: {
              jsonText: envVarsJson,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          buildConfig: {
            create: {
              jsonText: '',
              outputDir: data.outputDir.trim(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      });
      // call deploy service to deploy the project
      const deployId = await this.startDeployment(id, envVarsJson);

      return { deployId, projectId: id };
    } catch (error) {
      this.logger.error(`Error uploading to Github: ${error}`);
      throw error;
    }
  }

  async startDeployment(projectId: string, envVarsJson: string) {
    try {
      this.logger.log(`Starting deployment for uploadId: ${projectId}`);
      console.log('Deploy service URL:', this.deployServiceUrl);
      const data = await this.deployService.startDeploy({
        projectId,
        envJson: envVarsJson,
      });

      this.logger.log(`Deployment started successfully for ${data.deployId}`);
      this.logger.debug(JSON.stringify(data.deployId));
      return data.deployId;
    } catch (error) {
      this.logger.error(
        `Failed to start deployment for ${projectId}`,
        (error as Error).message,
      );
      throw new Error(
        `Failed to start deployment: ${(error as Error).message}`,
      );
    }
  }

  async isRepoPublic(repoUrl: string): Promise<boolean> {
    const resp = await fetch(repoUrl, {
      method: 'GET',
    });

    return resp.status === 200;
  }

  async getGithubUpload(repoUrl: string) {
    try {
      const result = await this.prisma.project.findFirst({
        where: {
          githubUrl: repoUrl,
        },
        include: {
          deployments: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
          environment: true,
        },
      });

      if (!result) {
        this.logger.log('No records found for this GitHub URL.');
        return null;
      }

      console.log('Result:', result);

      return result;
    } catch (error) {
      this.logger.error(`Error fetching data: ${error}`);
      return null;
    }
  }

  getAllGithubUpload(address: string) {
    return this.prisma.project.findMany({
      where: {
        address: address,
      },
      include: {
        deployments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  getProject(projectId: string) {
    return this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
      include: {
        deployments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        environment: true,
        buildConfig: true,
      },
    });
  }

  getEnsDomains(address: string) {
    return this.prisma.project.findMany({
      where: {
        address: address,
        ensName: {
          not: null,
        },
      },
      select: {
        id: true,
        ensName: true,
        githubUrl: true,
        githubBranch: true,
      },
    });
  }
}

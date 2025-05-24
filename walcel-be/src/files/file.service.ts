import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'path';
import { simpleGit } from 'simple-git';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private baseDir = path.join(__dirname, '../../storage');
  private githubBaseDir = path.join(__dirname, '../../storage/github');
  private fileBaseDir = path.join(__dirname, '../../storage/files');
  private git = simpleGit();

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  saveFile(projectName: string, fileBuffer: Buffer, filename: string): string {
    const projectPath = path.join(this.fileBaseDir, projectName);
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    const filePath = path.join(projectPath, filename);
    fs.writeFileSync(filePath, fileBuffer);

    return filePath;
  }

  async saveFilesFromGithub(
    projectName: string,
    urlRepo: string,
  ): Promise<string> {
    const projectPath = path.join(this.githubBaseDir, projectName);
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      this.logger.log(`Cloning ${urlRepo} to ${projectPath}`);
    }

    await this.git.clone(urlRepo, projectPath);

    return projectPath;
  }

  getProjectFiles(projectName: string): string[] {
    const projectPath = path.join(this.baseDir, projectName);
    if (!fs.existsSync(projectPath)) {
      throw new NotFoundException('Project not found');
    }

    return fs
      .readdirSync(projectPath)
      .map((file) => path.join(projectPath, file));
  }

  getFilePath(projectName: string, filename: string): string {
    const filePath = path.join(this.baseDir, projectName, filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return filePath;
  }
}

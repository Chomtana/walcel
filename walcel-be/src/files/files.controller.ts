import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadGithub } from './dto/upload-github';

@Controller('api/files')
export class FilesController {
  constructor(private readonly appService: FilesService) {}

  @Post('upload/github')
  async uploadGithub(@Body() data: UploadGithub) {
    // verify the signature
    // const isValidate = await verifySignature(
    //   data.address,
    //   data.message,
    //   data.signature,
    // );
    // if (!isValidate) {
    //   throw new BadRequestException('Invalid signature');
    // }
    return this.appService.uploadGithub(data);
  }

  @Get('upload/github/:repoUrl')
  async getGithubUpload(@Param('repoUrl') repoUrl: string) {
    return this.appService.getGithubUpload(repoUrl);
  }

  @Get('project/address/:address')
  async getAllGithubUpload(@Param('address') address: string) {
    return this.appService.getAllGithubUpload(address);
  }

  @Get('project/:projectId')
  async getProject(@Param('projectId') projectId: string) {
    return this.appService.getProject(projectId);
  }

  @Get('project/ens/:address')
  async getEnsDomains(@Param('address') address: string) {
    return this.appService.getEnsDomains(address);
  }
}

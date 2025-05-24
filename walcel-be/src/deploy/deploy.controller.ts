import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { DeployService } from './deploy.service';
import { StartDeploy } from './dto/start-deploy';
import { UpdateEns } from './dto/update-ens';
import { Redeploy } from './dto/redeploy';
// import { verifySignature } from '../../../utils/helper';

@Controller('api/deploy')
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  // Start Deploy Process
  @Post('start')
  async startDeployment(@Body() input: StartDeploy) {
    return this.deployService.startDeploy(input);
  }

  // Check Deployment Status
  @Get('status/:deployId')
  async getStatus(@Param('deployId') deployId: number) {
    return this.deployService.getDeployment(deployId);
  }

  // Update ENS domain
  @Post('ens/update')
  async updateEns(@Body() input: UpdateEns) {
    return this.deployService.updateEns(input);
  }

  // Re-Deploy
  @Post('redeploy')
  async reDeployment(@Body() input: Redeploy) {
    // const isValidate = await verifySignature(
    //   input.address,
    //   input.message,
    //   input.signature,
    // );
    // if (!isValidate) {
    //   throw new BadRequestException('Invalid signature');
    // }
    return this.deployService.startDeploy(input);
  }
}

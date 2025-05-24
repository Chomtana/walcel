import { Module } from '@nestjs/common';
import { DeployController } from './deploy.controller';
import { DeployService } from './deploy.service';
import { BullModule } from '@nestjs/bullmq';
import { DeployProcessor } from './deploy.processor';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'deploy-queue-walcel' })],
  controllers: [DeployController],
  providers: [PrismaService, DeployService, DeployProcessor],
  exports: [DeployService],
})
export class DeployModule {}

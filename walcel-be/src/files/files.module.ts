import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileService } from './file.service';
import { PrismaService } from '../prisma.service';
import { DeployModule } from 'src/deploy/deploy.module';

@Module({
  imports: [DeployModule],
  controllers: [FilesController],
  providers: [FilesService, FileService, PrismaService],
  exports: [PrismaService],
})
export class FilesModule {}

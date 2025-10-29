import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [UploadService, ConfigService],
  controllers: [UploadController],
})
export class UploadModule {}

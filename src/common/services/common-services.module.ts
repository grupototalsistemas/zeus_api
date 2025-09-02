// src/common/services/common-services.module.ts
import { Module } from '@nestjs/common';
import { BlobStorageService } from './blob-storage.service';

@Module({
  providers: [BlobStorageService],
  exports: [BlobStorageService],
})
export class CommonServicesModule {}

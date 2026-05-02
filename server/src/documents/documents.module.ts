import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { OcrService } from './ocr.service';
import { DocumentSummaryService } from './document-summary.service';

@Module({
  imports: [ConfigModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, OcrService, DocumentSummaryService],
})
export class DocumentsModule {}

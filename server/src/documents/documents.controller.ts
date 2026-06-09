/// <reference types="multer" />
import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
];

@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: MAX_DOCUMENT_BYTES } }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('patientId') patientId?: string,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('A document file is required');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed: PDF, PNG, JPEG, WebP`,
      );
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
      throw new BadRequestException('File size exceeds 10 MB limit');
    }

    try {
      const result = await this.documentsService.processDocument(
        file.buffer,
        file.mimetype,
        file.originalname,
      );
      return { ...result, patientId: patientId ?? null };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      const detail = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(detail);
    }
  }
}

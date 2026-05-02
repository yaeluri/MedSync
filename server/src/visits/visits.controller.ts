import {
  BadRequestException,
  Controller,
  HttpException,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VisitsService, TranscribeResult } from './visits.service';

export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

@Controller('api/visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: MAX_AUDIO_BYTES } }),
  )
  async transcribe(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TranscribeResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Audio file is required');
    }
    if (file.size > MAX_AUDIO_BYTES) {
      throw new BadRequestException('File size exceeds 25 MB limit');
    }

    try {
      return await this.visitsService.transcribe(file.buffer);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      const detail = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(detail);
    }
  }
}

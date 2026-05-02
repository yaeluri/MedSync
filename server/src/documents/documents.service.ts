import { Injectable, Logger } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { DocumentSummaryService } from './document-summary.service';

export interface DocumentResult {
  filename: string;
  extractedText: string;
  summary: string;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly summaryService: DocumentSummaryService,
  ) {}

  async processDocument(
    buffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<DocumentResult> {
    this.logger.log(`Processing document: ${originalName} (${mimeType})`);

    // Step 1: Extract text via OCR
    const extractedText = await this.ocrService.extractText(buffer, mimeType);

    if (!extractedText || extractedText.trim().length === 0) {
      return {
        filename: originalName,
        extractedText: '',
        summary: 'Could not extract any text from the uploaded document.',
      };
    }

    this.logger.log(
      `Extracted ${extractedText.length} characters from ${originalName}`,
    );

    // Step 2: Summarize extracted text
    const summary = await this.summaryService.summarize(extractedText);

    return {
      filename: originalName,
      extractedText,
      summary,
    };
  }
}

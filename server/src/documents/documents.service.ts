import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OcrService } from './ocr.service';
import { DocumentSummaryService } from './document-summary.service';
import { MedicalDocument } from '../entities/medicalDocument/medicalDocumentEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { SummaryStatus } from '../entities/enums';

export interface DocumentResult {
  id: string;
  filename: string;
  extractedText: string;
  summary: string;
  patientId: string | null;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly summaryService: DocumentSummaryService,
    @InjectRepository(MedicalDocument)
    private readonly medicalDocuments: Repository<MedicalDocument>,
    @InjectRepository(DocumentSummary)
    private readonly documentSummaries: Repository<DocumentSummary>,
  ) {}

  async processDocument(
    buffer: Buffer,
    mimeType: string,
    originalName: string,
    patientId?: string,
    uploadedByUserId?: string,
  ): Promise<DocumentResult> {
    this.logger.log(`Processing document: ${originalName} (${mimeType})`);

    // Step 1: Extract text via OCR
    const extractedText = await this.ocrService.extractText(buffer, mimeType);
    const hasText = extractedText && extractedText.trim().length > 0;

    if (hasText) {
      this.logger.log(
        `Extracted ${extractedText.length} characters from ${originalName}`,
      );
    }

    // Step 2: Summarize extracted text
    const summary = hasText
      ? await this.summaryService.summarize(extractedText)
      : 'Could not extract any text from the uploaded document.';

    // Step 3: Persist to database (if we have a patient to attach it to)
    if (patientId && uploadedByUserId) {
      const doc = this.medicalDocuments.create({
        patientId,
        uploadedByUserId,
        summaryStatus: hasText ? SummaryStatus.SUCCESS : SummaryStatus.FAILED,
        fileName: originalName,
        fileUrl: '',
        fileFormat: mimeType,
        processingCount: 1,
        fileData: buffer,
      });
      const savedDoc = await this.medicalDocuments.save(doc);

      await this.documentSummaries.save(
        this.documentSummaries.create({
          documentId: savedDoc.id,
          summaryText: summary,
          extractedText: extractedText ?? '',
        }),
      );

      return {
        id: savedDoc.id,
        filename: originalName,
        extractedText: extractedText ?? '',
        summary,
        patientId,
      };
    }

    return {
      id: '',
      filename: originalName,
      extractedText: extractedText ?? '',
      summary,
      patientId: patientId ?? null,
    };
  }

  async getFileData(
    id: string,
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
    const doc = await this.medicalDocuments.findOne({ where: { id } });
    if (!doc || !doc.fileData) return null;
    return {
      buffer: doc.fileData,
      mimeType: doc.fileFormat || 'application/octet-stream',
      fileName: doc.fileName,
    };
  }
}

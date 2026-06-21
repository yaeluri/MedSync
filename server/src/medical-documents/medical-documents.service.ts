import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalDocument } from '../entities/medicalDocument/medicalDocumentEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { DocumentType, SummaryStatus } from '../entities/enums';

export interface MedicalDocumentInput {
  patientId: string;
  uploadedByUserId: string;
  summaryStatus?: SummaryStatus;
  documentType?: DocumentType;
  fileName: string;
  fileUrl: string;
  fileFormat?: string;
}

export interface DocumentSummaryInput {
  summaryText: string;
  extractedText: string;
}

@Injectable()
export class MedicalDocumentsService {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly repo: Repository<MedicalDocument>,
    @InjectRepository(DocumentSummary)
    private readonly summaries: Repository<DocumentSummary>,
  ) {}

  findAll(patientId?: string): Promise<MedicalDocument[]> {
    return this.repo.find({
      where: patientId ? { patientId } : undefined,
      relations: ['summary'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MedicalDocument> {
    const doc = await this.repo.findOne({
      where: { id },
      relations: ['summary', 'patient', 'patient.user', 'uploadedBy'],
    });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async create(input: MedicalDocumentInput): Promise<MedicalDocument> {
    if (!input?.patientId || !input?.uploadedByUserId || !input?.fileName || !input?.fileUrl) {
      throw new BadRequestException(
        'patientId, uploadedByUserId, fileName and fileUrl are required',
      );
    }
    const doc = this.repo.create({
      patientId: input.patientId,
      uploadedByUserId: input.uploadedByUserId,
      summaryStatus: input.summaryStatus ?? SummaryStatus.SUCCESS,
      documentType: input.documentType,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileFormat: input.fileFormat,
      processingCount: 0,
    });
    return this.repo.save(doc);
  }

  async update(
    id: string,
    input: Partial<MedicalDocumentInput>,
  ): Promise<MedicalDocument> {
    const doc = await this.findOne(id);
    Object.assign(doc, input);
    return this.repo.save(doc);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Document ${id} not found`);
  }

  async upsertSummary(
    documentId: string,
    input: DocumentSummaryInput,
  ): Promise<DocumentSummary> {
    const doc = await this.findOne(documentId);
    let summary = await this.summaries.findOne({ where: { documentId } });
    if (!summary) {
      summary = this.summaries.create({
        documentId: doc.id,
        summaryText: input.summaryText,
        extractedText: input.extractedText,
      });
    } else {
      summary.summaryText = input.summaryText;
      summary.extractedText = input.extractedText;
    }
    return this.summaries.save(summary);
  }
}

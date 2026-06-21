import { IMedicalDocument } from '../medicalDocument/medicalDocumentInterface';

export interface IDocumentSummary {
  id: string;
  documentId: string;
  document?: IMedicalDocument;
  summaryText: string;
  extractedText: string;
  createdAt: Date;
}

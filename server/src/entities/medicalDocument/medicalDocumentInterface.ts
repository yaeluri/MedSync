import { IPatient } from '../patient/patientInterface';
import { IUser } from '../user/userInterface';
import { IDocumentSummary } from '../documentSummary/documentSummaryInterface';
import { DocumentType, SummaryStatus } from '../enums';

export interface IMedicalDocument {
  id: string;
  patientId: string;
  patient?: IPatient;
  uploadedByUserId: string;
  uploadedBy?: IUser;
  summaryStatus: SummaryStatus;
  documentType?: DocumentType;
  fileName: string;
  fileUrl: string;
  fileFormat?: string;
  uploadedAt: Date;
  updatedAt: Date;
  processingCount: number;
  summary?: IDocumentSummary;
}

import { IVisit } from '../visit/visitInterface';
import { RecordingStatus } from '../enums';

export interface IVisitRecording {
  id: string;
  visitId: string;
  visit?: IVisit;
  status: RecordingStatus;
  audioUrl: string;
  transcriptText?: string;
  createdAt: Date;
  updatedAt: Date;
}

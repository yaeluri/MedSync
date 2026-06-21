import { IVisit } from '../visit/visitInterface';
import { IDiagnosis } from '../diagnosis/diagnosisInterface';

export interface IVisitDiagnosis {
  visitId: string;
  diagnosisId: string;
  visit?: IVisit;
  diagnosis?: IDiagnosis;
  note?: string;
  createdAt: Date;
}

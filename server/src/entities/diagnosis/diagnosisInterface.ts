import { IVisitDiagnosis } from '../visitDiagnosis/visitDiagnosisInterface';

export interface IDiagnosis {
  id: string;
  code: string;
  description: string;
  visitDiagnoses?: IVisitDiagnosis[];
}

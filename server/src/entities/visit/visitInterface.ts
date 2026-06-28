import { IPatient } from '../patient/patientInterface';
import { ICaregiver } from '../caregiver/caregiverInterface';
import { ISlot } from '../slot/slotInterface';
import { IVisitRecording } from '../visitRecording/visitRecordingInterface';
import { IVisitSummary } from '../visitSummary/visitSummaryInterface';
import { IVisitDiagnosis } from '../visitDiagnosis/visitDiagnosisInterface';
import { IVisitMedicine } from '../visitMedicine/visitMedicineInterface';
import { VisitType } from '../enums';

export interface IVisit {
  id: string;
  patientId: string;
  patient?: IPatient;
  caregiverId: string;
  caregiver?: ICaregiver;
  slotId?: string;
  slot?: ISlot;
  visitDate: Date;
  bloodPressure?: string;
  pulse?: string;
  bodyTemp?: string;
  weight?: string;
  height?: string;
  oxygenSat?: string;
  chiefComplaint?: string;
  visitType?: VisitType;
  followUpDate?: string;
  referralNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  recording?: IVisitRecording;
  summary?: IVisitSummary;
  diagnoses?: IVisitDiagnosis[];
  medicines?: IVisitMedicine[];
}

import { IPatient } from '../patient/patientInterface';
import { ICaregiver } from '../caregiver/caregiverInterface';
import { IVisit } from '../visit/visitInterface';

export interface ISlot {
  id: string;
  patientId: string;
  patient?: IPatient;
  caregiverId: string;
  caregiver?: ICaregiver;
  slotTime: Date;
  hasReferral: boolean;
  createdAt: Date;
  visit?: IVisit;
}

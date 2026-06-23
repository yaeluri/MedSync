import { IVisit } from '../visit/visitInterface';
import { IMedicine } from '../medicine/medicineInterface';

export interface IVisitMedicine {
  visitId: string;
  medicineId: string;
  visit?: IVisit;
  medicine?: IMedicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  createdAt: Date;
}

import { IUser } from '../user/userInterface';
import { ISlot } from '../slot/slotInterface';
import { IMedicalDocument } from '../medicalDocument/medicalDocumentInterface';
import { IVisit } from '../visit/visitInterface';

export interface IPatient {
  id: string;
  userId: string;
  user?: IUser;
  hmo?: string;
  bloodType?: string;
  address: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  slots?: ISlot[];
  documents?: IMedicalDocument[];
  visits?: IVisit[];
}

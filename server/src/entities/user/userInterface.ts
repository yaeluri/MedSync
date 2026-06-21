import { IRole } from '../role/roleInterface';
import { IPatient } from '../patient/patientInterface';
import { ICaregiver } from '../caregiver/caregiverInterface';

export interface IUser {
  id: string;
  roleId: string;
  role?: IRole;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: Date;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: IPatient;
  caregiver?: ICaregiver;
}

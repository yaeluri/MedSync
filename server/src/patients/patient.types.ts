export interface Encounter {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  type: string;
  note?: string;
}

export interface PatientDocument {
  id: string;
  name: string;
  date: string;
  kind: string;
}

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | string;
  dob: string;
  email: string;
  phone: string;
  idNumber?: string;
  hmo: string;
  bloodType?: string;
  address: string;
  notes?: string;
  allergy?: string;
  overview: string;
  encounters: Encounter[];
  documents: PatientDocument[];
  createdAt: string;
  updatedAt: string;
}

export type PatientSummary = Pick<
  Patient,
  'id' | 'idNumber' | 'firstName' | 'lastName' | 'age' | 'gender'
>;

export interface CreatePatientInput {
  fullName: string;
  email: string;
  password: string;
  idNumber?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  hmo?: string;
  bloodType?: string;
  address?: string;
  notes?: string;
}

export interface UpdatePatientInput {
  fullName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  hmo?: string;
  bloodType?: string;
  address?: string;
  notes?: string;
}

import { apiRequest } from './client';

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
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female';
  dob: string;
  phone: string;
  hmo: string;
  address: string;
  allergy?: string;
  overview: string;
  encounters: Encounter[];
  documents: PatientDocument[];
}

export type PatientSummary = Pick<
  Patient,
  'id' | 'firstName' | 'lastName' | 'age' | 'gender'
>;

export function getPatients(search?: string): Promise<PatientSummary[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest(`/api/patients${query}`);
}

export function getPatientById(id: string): Promise<Patient> {
  return apiRequest(`/api/patients/${encodeURIComponent(id)}`);
}

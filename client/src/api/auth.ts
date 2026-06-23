import { apiPost } from './client';

export type RoleName = 'patient' | 'doctor' | string;

export interface AuthResult {
  userId: string;
  email: string;
  fullName: string;
  role: RoleName;
  patientId?: string;
  caregiverId?: string;
}

export interface RegisterPatientInput {
  role?: RoleName;
  fullName: string;
  email: string;
  password: string;
  idNumber?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  hmo?: string;
  address?: string;
  bloodType?: string;
}

export interface RegisterDoctorInput {
  role?: RoleName;
  fullName: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialization: string;
  clinicName?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

export function registerPatient(input: RegisterPatientInput): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/register/patient', input);
}

export function registerDoctor(input: RegisterDoctorInput): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/register/doctor', input);
}

export function login(email: string, password: string): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/login', { email, password });
}

const SESSION_KEY = 'medsync.session';

export function saveSession(result: AuthResult) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(result));
  localStorage.setItem('role', result.role);
}

export function loadSession(): AuthResult | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResult;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('role');
}

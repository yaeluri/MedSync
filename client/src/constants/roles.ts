export const ROLE_DOCTOR = 'doctor';
export const ROLE_PATIENT = 'patient';

export const ALL_ROLES = [ROLE_DOCTOR, ROLE_PATIENT] as const;

export type TRoleName = (typeof ALL_ROLES)[number];

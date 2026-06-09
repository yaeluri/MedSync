import { Injectable, NotFoundException } from '@nestjs/common';
import { Patient, PatientSummary } from './patient.types';

/**
 * In-memory data source. Replace with a real database/repository later;
 * the controller and client treat this as a template-driven data source.
 */
const PATIENTS: Patient[] = [
  {
    id: '123456789',
    firstName: 'Israel',
    lastName: 'Israeli',
    age: 45,
    gender: 'Male',
    dob: '15/05/1980',
    phone: '054-123-4567',
    hmo: 'Maccabi',
    address: 'Tel Aviv',
    allergy: 'Penicillin',
    overview:
      'Patient suffers from chronic Hypertension (diagnosed 2020). Recent complaints include recurring headaches. Last blood test (Oct 2025) showed elevated cholesterol. Currently on Ramipril 5mg.',
    encounters: [
      {
        id: 'e1',
        date: 'Dec 01, 2025',
        doctor: 'Dr. Rotem Philipp',
        specialty: 'Cardiology',
        type: 'Follow Up',
        note: 'Patient reported improvement in headaches after dosage adjustment...',
      },
      {
        id: 'e2',
        date: 'Sep 15, 2025',
        doctor: 'Dr. Levy',
        specialty: 'Family Medicine',
        type: 'Initial',
      },
    ],
    documents: [
      { id: 'd1', name: 'Blood Test Results', date: 'Oct 20, 2025', kind: 'Lab Results' },
    ],
  },
];

@Injectable()
export class PatientsService {
  findAll(search?: string): PatientSummary[] {
    const list = PATIENTS.map(({ id, firstName, lastName, age, gender }) => ({
      id,
      firstName,
      lastName,
      age,
      gender,
    }));

    const q = search?.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.id.includes(q),
    );
  }

  findOne(id: string): Patient {
    const patient = PATIENTS.find(p => p.id === id);
    if (!patient) {
      throw new NotFoundException(`Patient ${id} not found`);
    }
    return patient;
  }
}

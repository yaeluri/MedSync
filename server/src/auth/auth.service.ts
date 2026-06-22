import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user/userEntity';
import { Patient } from '../entities/patient/patientEntity';
import { Caregiver } from '../entities/caregiver/caregiverEntity';
import { hashPassword, verifyPassword } from '../common/password.util';
import { RolesService } from '../roles/roles.service';

export interface RegisterPatientInput {
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

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  userId: string;
  email: string;
  fullName: string;
  role: 'patient' | 'doctor' | string;
  patientId?: string;
  caregiverId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
    @InjectRepository(Caregiver) private readonly caregivers: Repository<Caregiver>,
    private readonly roles: RolesService,
    private readonly dataSource: DataSource,
  ) {}

  async registerPatient(input: RegisterPatientInput): Promise<AuthResult> {
    if (!input?.email || !input?.password || !input?.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }
    const email = input.email.toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const role = await this.roles.getOrCreate('patient', 'Patient role');

    return this.dataSource.transaction(async (manager) => {
      const user = manager.getRepository(User).create({
        roleId: role.id,
        fullName: input.fullName,
        email,
        password: hashPassword(input.password),
        phone: input.phone,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        gender: input.gender,
      });
      const savedUser = await manager.getRepository(User).save(user);

      const patient = manager.getRepository(Patient).create({
        userId: savedUser.id,
        idNumber: input.idNumber || undefined,
        hmo: input.hmo,
        bloodType: input.bloodType,
        address: input.address || '',
      });
      const savedPatient = await manager.getRepository(Patient).save(patient);

      return {
        userId: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: 'patient',
        patientId: savedPatient.id,
      };
    });
  }

  async registerDoctor(input: RegisterDoctorInput): Promise<AuthResult> {
    if (!input?.email || !input?.password || !input?.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }
    if (!input?.licenseNumber || !input?.specialization) {
      throw new BadRequestException(
        'licenseNumber and specialization are required',
      );
    }
    const email = input.email.toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const role = await this.roles.getOrCreate('doctor', 'Doctor role');

    return this.dataSource.transaction(async (manager) => {
      const user = manager.getRepository(User).create({
        roleId: role.id,
        fullName: input.fullName,
        email,
        password: hashPassword(input.password),
        phone: input.phone,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        gender: input.gender,
      });
      const savedUser = await manager.getRepository(User).save(user);

      const caregiver = manager.getRepository(Caregiver).create({
        userId: savedUser.id,
        licenseNumber: input.licenseNumber,
        specialization: input.specialization,
        clinicName: input.clinicName,
      });
      const savedCaregiver = await manager.getRepository(Caregiver).save(caregiver);

      return {
        userId: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: 'doctor',
        caregiverId: savedCaregiver.id,
      };
    });
  }

  async login(input: LoginInput): Promise<AuthResult> {
    if (!input?.email || !input?.password) {
      throw new BadRequestException('email and password are required');
    }
    const user = await this.users.findOne({
      where: { email: input.email.toLowerCase() },
      relations: ['role', 'patient', 'caregiver'],
    });
    if (!user || !verifyPassword(input.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role?.name ?? 'patient',
      patientId: user.patient?.id,
      caregiverId: user.caregiver?.id,
    };
  }
}

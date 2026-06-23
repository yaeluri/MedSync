import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caregiver } from '../entities/caregiver/caregiverEntity';

export interface CaregiverInput {
  userId: string;
  licenseNumber: string;
  specialization: string;
  clinicName?: string;
}

@Injectable()
export class CaregiversService {
  constructor(
    @InjectRepository(Caregiver) private readonly repo: Repository<Caregiver>,
  ) {}

  findAll(): Promise<Caregiver[]> {
    return this.repo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Caregiver> {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!item) throw new NotFoundException(`Caregiver ${id} not found`);
    return item;
  }

  async findByUserId(userId: string): Promise<Caregiver | null> {
    return this.repo.findOne({ where: { userId }, relations: ['user'] });
  }

  async create(input: CaregiverInput): Promise<Caregiver> {
    if (!input?.userId || !input?.licenseNumber || !input?.specialization) {
      throw new BadRequestException(
        'userId, licenseNumber and specialization are required',
      );
    }
    const dupUser = await this.repo.findOne({ where: { userId: input.userId } });
    if (dupUser) throw new ConflictException('Caregiver already exists for this user');
    const dupLic = await this.repo.findOne({
      where: { licenseNumber: input.licenseNumber },
    });
    if (dupLic) throw new ConflictException('License number already in use');

    return this.repo.save(this.repo.create(input));
  }

  async update(id: string, input: Partial<CaregiverInput>): Promise<Caregiver> {
    const caregiver = await this.findOne(id);
    if (input.licenseNumber !== undefined)
      caregiver.licenseNumber = input.licenseNumber;
    if (input.specialization !== undefined)
      caregiver.specialization = input.specialization;
    if (input.clinicName !== undefined) caregiver.clinicName = input.clinicName;
    return this.repo.save(caregiver);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Caregiver ${id} not found`);
  }
}

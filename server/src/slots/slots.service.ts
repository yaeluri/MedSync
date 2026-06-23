import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Slot } from '../entities/slot/slotEntity';

export interface SlotInput {
  patientId: string;
  caregiverId: string;
  slotTime: string | Date;
  hasReferral?: boolean;
}

export interface SlotQuery {
  patientId?: string;
  caregiverId?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot) private readonly repo: Repository<Slot>,
  ) {}

  async findAll(query: SlotQuery = {}): Promise<Slot[]> {
    const where: any = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.caregiverId) where.caregiverId = query.caregiverId;
    if (query.from && query.to) {
      where.slotTime = Between(new Date(query.from), new Date(query.to));
    }
    return this.repo.find({
      where,
      relations: ['patient', 'patient.user', 'caregiver', 'caregiver.user'],
      order: { slotTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Slot> {
    const slot = await this.repo.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'caregiver', 'caregiver.user', 'visit'],
    });
    if (!slot) throw new NotFoundException(`Slot ${id} not found`);
    return slot;
  }

  async create(input: SlotInput): Promise<Slot> {
    if (!input?.patientId || !input?.caregiverId || !input?.slotTime) {
      throw new BadRequestException(
        'patientId, caregiverId and slotTime are required',
      );
    }
    const slot = this.repo.create({
      patientId: input.patientId,
      caregiverId: input.caregiverId,
      slotTime: new Date(input.slotTime),
      hasReferral: !!input.hasReferral,
    });
    return this.repo.save(slot);
  }

  async update(id: string, input: Partial<SlotInput>): Promise<Slot> {
    const slot = await this.findOne(id);
    if (input.slotTime !== undefined) slot.slotTime = new Date(input.slotTime);
    if (input.hasReferral !== undefined) slot.hasReferral = !!input.hasReferral;
    if (input.patientId !== undefined) slot.patientId = input.patientId;
    if (input.caregiverId !== undefined) slot.caregiverId = input.caregiverId;
    return this.repo.save(slot);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Slot ${id} not found`);
  }
}

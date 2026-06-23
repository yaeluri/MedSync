import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from '../entities/medicine/medicineEntity';

export interface MedicineInput {
  name: string;
}

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine) private readonly repo: Repository<Medicine>,
  ) {}

  findAll(search?: string): Promise<Medicine[]> {
    const qb = this.repo.createQueryBuilder('m');
    if (search?.trim()) {
      qb.where('m.name ILIKE :q', { q: `%${search.trim()}%` });
    }
    return qb.orderBy('m.name', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Medicine> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Medicine ${id} not found`);
    return item;
  }

  async getOrCreateByName(name: string): Promise<Medicine> {
    const existing = await this.repo.findOne({ where: { name } });
    if (existing) return existing;
    return this.repo.save(this.repo.create({ name }));
  }

  async create(input: MedicineInput): Promise<Medicine> {
    if (!input?.name) throw new BadRequestException('name is required');
    const dup = await this.repo.findOne({ where: { name: input.name } });
    if (dup) throw new ConflictException(`Medicine '${input.name}' exists`);
    return this.repo.save(this.repo.create(input));
  }

  async update(id: string, input: Partial<MedicineInput>): Promise<Medicine> {
    const item = await this.findOne(id);
    if (input.name !== undefined) item.name = input.name;
    return this.repo.save(item);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Medicine ${id} not found`);
  }
}

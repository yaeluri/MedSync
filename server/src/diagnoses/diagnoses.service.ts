import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis } from '../entities/diagnosis/diagnosisEntity';

export interface DiagnosisInput {
  code: string;
  description: string;
}

@Injectable()
export class DiagnosesService {
  constructor(
    @InjectRepository(Diagnosis) private readonly repo: Repository<Diagnosis>,
  ) {}

  findAll(search?: string): Promise<Diagnosis[]> {
    const qb = this.repo.createQueryBuilder('d');
    if (search?.trim()) {
      qb.where('d.code ILIKE :q OR d.description ILIKE :q', {
        q: `%${search.trim()}%`,
      });
    }
    return qb.orderBy('d.code', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Diagnosis> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Diagnosis ${id} not found`);
    return item;
  }

  async getOrCreateByCode(code: string, description = ''): Promise<Diagnosis> {
    const existing = await this.repo.findOne({ where: { code } });
    if (existing) return existing;
    return this.repo.save(this.repo.create({ code, description }));
  }

  async create(input: DiagnosisInput): Promise<Diagnosis> {
    if (!input?.code || !input?.description) {
      throw new BadRequestException('code and description are required');
    }
    const dup = await this.repo.findOne({ where: { code: input.code } });
    if (dup) throw new ConflictException(`Diagnosis code '${input.code}' exists`);
    return this.repo.save(this.repo.create(input));
  }

  async update(id: string, input: Partial<DiagnosisInput>): Promise<Diagnosis> {
    const item = await this.findOne(id);
    Object.assign(item, input);
    return this.repo.save(item);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Diagnosis ${id} not found`);
  }
}

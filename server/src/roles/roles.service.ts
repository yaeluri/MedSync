import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role/roleEntity';

export interface RoleInput {
  name: string;
  description: string;
}

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly repo: Repository<Role>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.repo.findOne({ where: { name } });
  }

  async getOrCreate(name: string, description = ''): Promise<Role> {
    const existing = await this.findByName(name);
    if (existing) return existing;
    return this.repo.save(this.repo.create({ name, description }));
  }

  async create(input: RoleInput): Promise<Role> {
    if (!input?.name) throw new ConflictException('Role name is required');
    const existing = await this.findByName(input.name);
    if (existing) throw new ConflictException(`Role '${input.name}' already exists`);
    return this.repo.save(this.repo.create(input));
  }

  async update(id: string, input: Partial<RoleInput>): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, input);
    return this.repo.save(role);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Role ${id} not found`);
  }
}

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/userEntity';
import { Slot } from '../slot/slotEntity';
import { Visit } from '../visit/visitEntity';
import { ICaregiver } from './caregiverInterface';

@Entity({ name: 'caregivers' })
export class Caregiver extends BaseEntity implements ICaregiver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.caregiver, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', name: 'license_number', unique: true })
  licenseNumber: string;

  @Column({ type: 'varchar' })
  specialization: string;

  @Column({ type: 'varchar', name: 'clinic_name', nullable: true })
  clinicName?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Slot, (slot) => slot.caregiver)
  slots: Slot[];

  @OneToMany(() => Visit, (visit) => visit.caregiver)
  visits: Visit[];
}

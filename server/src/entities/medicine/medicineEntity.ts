import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VisitMedicine } from '../visitMedicine/visitMedicineEntity';
import { IMedicine } from './medicineInterface';

@Entity({ name: 'medicines' })
export class Medicine extends BaseEntity implements IMedicine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => VisitMedicine, (vm) => vm.medicine)
  visitMedicines: VisitMedicine[];
}

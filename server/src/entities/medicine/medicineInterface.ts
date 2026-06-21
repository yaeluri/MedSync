import { IVisitMedicine } from '../visitMedicine/visitMedicineInterface';

export interface IMedicine {
  id: string;
  name: string;
  visitMedicines?: IVisitMedicine[];
}

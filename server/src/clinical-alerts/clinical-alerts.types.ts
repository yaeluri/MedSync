import {
  ClinicalAlertCategory,
  ClinicalAlertSeverity,
  ClinicalAlertSource,
} from '../entities/enums';

export interface ClinicalAlertDto {
  id: string;
  category: ClinicalAlertCategory;
  severity: ClinicalAlertSeverity;
  label: string;
  source: ClinicalAlertSource;
}

export interface CreateManualAllergyDto {
  label: string;
  severity: ClinicalAlertSeverity;
  category?: ClinicalAlertCategory;
}

export interface BulkRegenerateResult {
  total: number;
  succeeded: number;
  failed: number;
}

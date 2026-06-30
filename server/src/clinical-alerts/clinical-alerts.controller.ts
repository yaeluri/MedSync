import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ClinicalAlertsService } from './clinical-alerts.service';
import {
  BulkRegenerateResult,
  ClinicalAlertDto,
  CreateManualAllergyDto,
} from './clinical-alerts.types';

@Controller('api/patients')
export class ClinicalAlertsController {
  constructor(private readonly service: ClinicalAlertsService) {}

  @Get(':id/clinical-alerts')
  list(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ClinicalAlertDto[]> {
    return this.service.getForPatient(id);
  }

  @Post(':id/clinical-alerts/regenerate')
  regenerate(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ClinicalAlertDto[]> {
    return this.service.regenerateForPatient(id);
  }

  @Post(':id/clinical-alerts')
  createManualAllergy(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: CreateManualAllergyDto,
  ): Promise<ClinicalAlertDto> {
    return this.service.createManualAllergy(id, body);
  }

  @Delete(':id/clinical-alerts/:alertId')
  @HttpCode(204)
  deleteManual(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('alertId', new ParseUUIDPipe()) alertId: string,
  ): Promise<void> {
    return this.service.deleteManualAlert(id, alertId);
  }

  @Post('clinical-alerts/regenerate-all')
  regenerateAll(): Promise<BulkRegenerateResult> {
    return this.service.regenerateAll();
  }
}

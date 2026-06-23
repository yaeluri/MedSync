import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  VisitDiagnosisInput,
  VisitInput,
  VisitMedicineInput,
  VisitRecordingInput,
  VisitRecordsService,
  VisitSummaryInput,
} from './visit-records.service';

@Controller('api/visits-records')
export class VisitRecordsController {
  constructor(private readonly service: VisitRecordsService) {}

  @Get()
  findAll(
    @Query('patientId') patientId?: string,
    @Query('caregiverId') caregiverId?: string,
  ) {
    return this.service.findAll(patientId, caregiverId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: VisitInput) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: Partial<VisitInput>,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }

  @Put(':id/recording')
  upsertRecording(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: VisitRecordingInput,
  ) {
    return this.service.upsertRecording(id, body);
  }

  @Put(':id/summary')
  upsertSummary(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: VisitSummaryInput,
  ) {
    return this.service.upsertSummary(id, body);
  }

  @Post(':id/diagnoses')
  addDiagnosis(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: VisitDiagnosisInput,
  ) {
    return this.service.addDiagnosis(id, body);
  }

  @Delete(':id/diagnoses/:diagnosisId')
  @HttpCode(204)
  removeDiagnosis(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('diagnosisId', new ParseUUIDPipe()) diagnosisId: string,
  ) {
    return this.service.removeDiagnosis(id, diagnosisId);
  }

  @Post(':id/medicines')
  addMedicine(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: VisitMedicineInput,
  ) {
    return this.service.addMedicine(id, body);
  }

  @Delete(':id/medicines/:medicineId')
  @HttpCode(204)
  removeMedicine(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('medicineId', new ParseUUIDPipe()) medicineId: string,
  ) {
    return this.service.removeMedicine(id, medicineId);
  }
}

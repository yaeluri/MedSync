import { Controller, Get, Param, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Patient, PatientSummary } from './patient.types';

@Controller('api/patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll(@Query('search') search?: string): PatientSummary[] {
    return this.patientsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Patient {
    return this.patientsService.findOne(id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patient } from '../entities/patient/patientEntity';
import { User } from '../entities/user/userEntity';
import { Visit } from '../entities/visit/visitEntity';
import { MedicalDocument } from '../entities/medicalDocument/medicalDocumentEntity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, User, Visit, MedicalDocument]),
    RolesModule,
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}

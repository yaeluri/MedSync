import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VisitsModule } from './visits/visits.module';
import { DocumentsModule } from './documents/documents.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), VisitsModule, DocumentsModule, PatientsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VisitsModule } from './visits/visits.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), VisitsModule, DocumentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

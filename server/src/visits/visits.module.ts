import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { SpeechService } from './speech.service';
import { SummaryService } from './summary.service';

@Module({
  imports: [ConfigModule],
  controllers: [VisitsController],
  providers: [VisitsService, SpeechService, SummaryService],
})
export class VisitsModule {}

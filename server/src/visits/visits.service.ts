import { Injectable } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { SummaryService } from './summary.service';

export interface TranscribeResult {
  transcript: string;
  summary: string;
}

export interface SummarizeResult {
  summary: string;
}

@Injectable()
export class VisitsService {
  constructor(
    private readonly speechService: SpeechService,
    private readonly summaryService: SummaryService,
  ) {}

  async transcribe(audioBuffer: Buffer): Promise<TranscribeResult> {
    const transcript = await this.speechService.transcribeAudio(audioBuffer);
    const summary = await this.summaryService.summarize(transcript);
    return { transcript, summary };
  }

  async summarizeText(text: string): Promise<SummarizeResult> {
    const summary = await this.summaryService.summarize(text);
    return { summary };
  }
}

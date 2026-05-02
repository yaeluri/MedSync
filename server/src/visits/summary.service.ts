import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';

const SUMMARY_PROMPT = `You are a medical scribe. Summarize the following medical visit transcript into a structured note with these sections, each as a clearly labeled heading:

- Chief Complaint
- History of Present Illness
- Assessment
- Plan

Use concise clinical language. If a section has no information in the transcript, write "Not documented." under it.

Transcript:
`;

@Injectable()
export class SummaryService implements OnModuleInit {
  private model!: GenerativeModel;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Missing required environment variable: GEMINI_API_KEY');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async summarize(transcript: string): Promise<string> {
    if (!transcript || transcript.length === 0) {
      return '';
    }

    try {
      const result = await this.model.generateContent(
        `${SUMMARY_PROMPT}${transcript}`,
      );
      return result.response.text();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`Summarization failed: ${detail}`);
    }
  }
}

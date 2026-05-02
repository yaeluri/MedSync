import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';

const SUMMARY_PROMPT = `You are a medical scribe transcribing a conversation between a caregiver (doctor) and a patient. The transcript may be in Hebrew or English. Produce the summary in the same language as the transcript.

Read the transcript carefully and identify:
- What the patient is complaining about (symptoms, concerns, history they describe)
- The doctor's diagnosis or clinical impression
- The doctor's recommendations (treatment, medications, follow-up, lifestyle advice, referrals)

Return the summary using exactly these labeled sections (translate the headings to the transcript's language):

- Patient Complaints
- Diagnosis
- Doctor's Recommendations

Use concise clinical language. Quote or paraphrase the speakers faithfully — do not invent facts. If a section has no information in the transcript, write "Not documented." under it.

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

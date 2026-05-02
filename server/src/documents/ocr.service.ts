import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';

const OCR_PROMPT = `You are an OCR engine specialized in medical documents. Extract ALL text content from this document exactly as it appears. Preserve the structure, headings, tables, numbers, dates, and medical values. Do not summarize or interpret — just extract the raw text faithfully.

If the document contains tables (e.g. blood test results), reproduce them in a readable format with columns aligned.

If you cannot read part of the document, indicate [illegible] for that section.

Return only the extracted text, nothing else.`;

@Injectable()
export class OcrService implements OnModuleInit {
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

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    const base64Data = buffer.toString('base64');

    const result = await this.model.generateContent([
      { text: OCR_PROMPT },
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    return result.response.text();
  }
}

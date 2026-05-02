import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';

const DOCUMENT_SUMMARY_PROMPT = `You are a clinical AI assistant specializing in medical document analysis. You will receive text extracted from a patient's medical document (blood test results, lab reports, imaging reports, or visit summaries).

Analyze the text and produce a structured clinical summary. The summary should be in the same language as the document.

Use exactly these sections (translate headings to the document's language if needed):

## Document Type
Identify what kind of document this is (e.g., Blood Test Results, Imaging Report, Discharge Summary, etc.)

## Key Findings
List the most clinically significant findings. For lab results, highlight any values outside the normal range with their reference ranges.

## Abnormal Values
If this is a lab report, list all out-of-range values in a clear format:
- Test Name: Value (Normal Range) — HIGH/LOW

## Clinical Significance
Brief interpretation of what the findings may indicate clinically. Be factual and measured — do not diagnose, but note patterns.

## Recommended Follow-up
Based on the findings, suggest what a physician might want to follow up on.

If a section has no relevant information, write "N/A" under it.

Document text:
`;

@Injectable()
export class DocumentSummaryService implements OnModuleInit {
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

  async summarize(documentText: string): Promise<string> {
    if (!documentText || documentText.trim().length === 0) {
      return '';
    }

    try {
      const result = await this.model.generateContent(
        `${DOCUMENT_SUMMARY_PROMPT}${documentText}`,
      );
      return result.response.text();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`Document summarization failed: ${detail}`);
    }
  }
}

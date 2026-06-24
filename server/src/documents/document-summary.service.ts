import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

const DOCUMENT_SUMMARY_PROMPT = `Role: Act as a medical data analyst.
Task: Summarize the following blood test results and medical visit summaries.
Requirements:
1. Executive Summary: Provide a 2-3 sentence overview of the patient's current status based on the documents.
2. Normal Findings: Briefly list key systems or categories that are within range (e.g., Kidney function, Electrolytes).
3. Abnormal Findings (High Priority): List all out-of-range values with: Parameter Name, Result vs. Reference Range, and Brief Significance.
4. Action Items: List specific questions or findings that require immediate discussion with a primary care physician.
Tone: Professional, objective, and concise.
IMPORTANT: Write the entire summary in Hebrew.
IMPORTANT: Output plain text only. Do NOT use Markdown, asterisks, pound signs, pipes, hyphens for lists, or any other formatting symbols. Use plain numbered lists and line breaks only.

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

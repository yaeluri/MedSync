import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpeechClient } from '@google-cloud/speech';

@Injectable()
export class SpeechService implements OnModuleInit {
  private readonly logger = new Logger(SpeechService.name);
  private client!: SpeechClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const credentials = this.configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );
    if (!credentials) {
      throw new Error(
        'Missing required environment variable: GOOGLE_APPLICATION_CREDENTIALS',
      );
    }
    // SpeechClient picks up GOOGLE_APPLICATION_CREDENTIALS automatically,
    // but we set keyFilename explicitly to make the dependency obvious.
    this.client = new SpeechClient({ keyFilename: credentials });
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      this.logger.log(
        `Sending ${audioBuffer.length} bytes to Speech-to-Text`,
      );
      const [response] = await this.client.recognize({
        audio: { content: audioBuffer.toString('base64') },
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'latest_long',
        },
      });

      const results = response.results ?? [];
      if (results.length === 0) {
        this.logger.log('Speech-to-Text returned no results');
        return '';
      }

      const transcript = results
        .map((r) => r.alternatives?.[0]?.transcript ?? '')
        .filter((t) => t.length > 0)
        .join(' ');

      this.logger.log(
        `Speech-to-Text transcript (${transcript.length} chars): ${transcript}`,
      );
      return transcript;
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`Transcription failed: ${detail}`);
    }
  }
}

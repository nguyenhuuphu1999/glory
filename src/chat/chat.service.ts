import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ChatRequest, ChatResponse, GeminiContent } from './interfaces/chat.interface';
import { buildFashionAdvisorInstruction, buildGeminiContents } from './chat-prompt.util';
import { FASHION_PRODUCTS } from './data/fashion-products.data';

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  promptFeedback?: unknown;
  usageMetadata?: unknown;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly modelName = 'gemini-1.5-flash';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async consultFashion(request: ChatRequest): Promise<ChatResponse> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new BadRequestException('Gemini API key is not configured');
    }

    let contents: GeminiContent[];
    try {
      contents = buildGeminiContents(request.message, request.history ?? []);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Invalid chat message');
    }

    const payload = {
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: buildFashionAdvisorInstruction(FASHION_PRODUCTS),
          },
        ],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 32,
        maxOutputTokens: 512,
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<GeminiGenerateContentResponse>(url, payload, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const reply = this.extractReplyText(response.data);
      if (!reply) {
        throw new InternalServerErrorException('Không nhận được phản hồi từ Gemini');
      }

      return {
        reply,
        model: this.modelName,
        promptFeedback: response.data?.promptFeedback,
        usageMetadata: response.data?.usageMetadata,
      };
    } catch (error) {
      return this.handleGeminiError(error);
    }
  }

  private extractReplyText(data?: GeminiGenerateContentResponse): string | null {
    if (!data?.candidates || !Array.isArray(data.candidates)) {
      return null;
    }

    for (const candidate of data.candidates) {
      const parts = candidate?.content?.parts;
      if (!parts || !Array.isArray(parts)) {
        continue;
      }

      const message = parts
        .map(part => (typeof part.text === 'string' ? part.text.trim() : ''))
        .filter(Boolean)
        .join('\n')
        .trim();

      if (message) {
        return message;
      }
    }

    return null;
  }

  private handleGeminiError(error: unknown): never {
    if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
      throw error;
    }

    const axiosError = error as AxiosError<{ error?: { message?: string } }>;
    if (axiosError?.isAxiosError) {
      const status = axiosError.response?.status ?? 500;
      const message = axiosError.response?.data?.error?.message || axiosError.message || 'Gemini API request failed';

      this.logger.error(`Gemini API error (${status}): ${message}`);

      if (status >= 400 && status < 500) {
        throw new BadRequestException(message);
      }

      throw new InternalServerErrorException('Gemini service is currently unavailable');
    }

    this.logger.error(`Unexpected error when contacting Gemini: ${error}`);
    throw new InternalServerErrorException('Gemini service is currently unavailable');
  }
}

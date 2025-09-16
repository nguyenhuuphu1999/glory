import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatHistoryMessage, ChatResponse } from './interfaces/chat.interface';

interface ChatRequestBody {
  message?: unknown;
  history?: unknown;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('fashion-consultant')
  public async consultFashion(@Body() body: ChatRequestBody): Promise<ChatResponse> {
    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      throw new BadRequestException('message is required');
    }

    let history: ChatHistoryMessage[] | undefined;
    if (body.history !== undefined) {
      if (!Array.isArray(body.history)) {
        throw new BadRequestException('history must be an array');
      }

      history = body.history.map((item, index) => {
        if (!item || typeof item !== 'object') {
          throw new BadRequestException(`history[${index}] must be an object`);
        }

        const role = (item as Record<string, unknown>).role;
        const content = (item as Record<string, unknown>).content;

        if (role !== 'user' && role !== 'assistant') {
          throw new BadRequestException(`history[${index}].role must be \"user\" hoặc \"assistant\"`);
        }

        if (typeof content !== 'string' || !content.trim()) {
          throw new BadRequestException(`history[${index}].content must be a non-empty string`);
        }

        return {
          role,
          content,
        };
      });
    }

    return this.chatService.consultFashion({
      message: body.message,
      history,
    });
  }
}

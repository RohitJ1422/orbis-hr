import {
  Controller,
  Post,
  Body,
  Sse,
  MessageEvent,
  Logger,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CompanionService, CompanionSseEvent } from './companion.service';

class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  hireId?: string;
}

@Controller('companion')
export class CompanionController {
  private readonly logger = new Logger(CompanionController.name);

  constructor(private readonly companionService: CompanionService) {}

  /**
   * Streaming chat endpoint — streams Claude's response as SSE.
   * POST /companion/chat
   * Body: { message: string, hireId?: string }
   *
   * Note: This uses SSE to stream the response token by token.
   * The client should connect with Accept: text/event-stream.
   */
  @Sse('chat')
  @Post('chat')
  chat(@Body() body: ChatRequestDto): Observable<MessageEvent> {
    this.logger.log(
      `Companion chat request: "${body.message.substring(0, 80)}..." hireId=${body.hireId ?? 'none'}`,
    );

    const stream$: Observable<CompanionSseEvent> =
      this.companionService.streamChat({
        message: body.message,
        hireId: body.hireId,
      });

    return stream$.pipe(
      map(
        (event: CompanionSseEvent): MessageEvent => ({
          data: event,
          type: event.event,
        }),
      ),
    );
  }
}

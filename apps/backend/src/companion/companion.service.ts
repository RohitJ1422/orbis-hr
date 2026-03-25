import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { Observable } from 'rxjs';

export interface ChatInput {
  message: string;
  hireId?: string;
}

export interface CompanionSseEvent {
  type: 'COMPANION_EVENT';
  event: 'TEXT_DELTA' | 'MESSAGE_START' | 'MESSAGE_STOP' | 'ERROR';
  text?: string;
  message?: string;
  timestamp: string;
}

const COMPANION_SYSTEM_PROMPT = `You are the OrbisHR AI Assistant — a professional, helpful, and empathetic HR companion embedded in the OrbisHR platform.

Your capabilities:
- Answer questions about HR policies, onboarding, benefits, and workplace culture
- Help employees navigate their 30/60/90 day onboarding journey
- Provide guidance on career development, performance reviews, and goal setting
- Assist with understanding company processes and procedures
- Offer emotional support and practical advice for new hires

Your tone:
- Warm, professional, and encouraging
- Concise but thorough — get to the point without being terse
- Empathetic — remember that starting a new job can be stressful
- Always actionable — whenever possible, give specific next steps

Constraints:
- Never make up specific company policies — if you don't know, say so and suggest who to ask
- Never discuss compensation, equity, or confidential business information
- Always recommend consulting HR directly for legal or compliance matters
- Keep responses focused on HR and onboarding topics`;

@Injectable()
export class CompanionService {
  private readonly logger = new Logger(CompanionService.name);
  private readonly client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY not set — companion calls will fail at runtime',
      );
    }
    this.client = new Anthropic({ apiKey: apiKey ?? 'not-set' });
  }

  streamChat(input: ChatInput): Observable<CompanionSseEvent> {
    const now = () => new Date().toISOString();

    return new Observable<CompanionSseEvent>((observer) => {
      const run = async () => {
        observer.next({
          type: 'COMPANION_EVENT',
          event: 'MESSAGE_START',
          message: 'OrbisHR Assistant is responding...',
          timestamp: now(),
        });

        try {
          const contextPrefix = input.hireId
            ? `[Context: responding to hire ID ${input.hireId}]\n\n`
            : '';

          const stream = await this.client.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: COMPANION_SYSTEM_PROMPT,
            messages: [
              {
                role: 'user',
                content: `${contextPrefix}${input.message}`,
              },
            ],
          });

          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              observer.next({
                type: 'COMPANION_EVENT',
                event: 'TEXT_DELTA',
                text: event.delta.text,
                timestamp: now(),
              });
            }
          }

          observer.next({
            type: 'COMPANION_EVENT',
            event: 'MESSAGE_STOP',
            message: 'Response complete',
            timestamp: now(),
          });

          observer.complete();
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.logger.error(`Companion streaming error: ${errMsg}`);
          observer.next({
            type: 'COMPANION_EVENT',
            event: 'ERROR',
            message: `Streaming error: ${errMsg}`,
            timestamp: now(),
          });
          observer.error(err);
        }
      };

      void run();
    });
  }
}

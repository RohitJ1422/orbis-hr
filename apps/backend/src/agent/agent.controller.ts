import {
  Controller,
  Get,
  Post,
  Param,
  Sse,
  MessageEvent,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AgentService, SseEvent } from './agent.service';
import { OnboardingService } from '../onboarding/onboarding.service';

@Controller('agent')
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(
    private readonly agentService: AgentService,
    private readonly onboardingService: OnboardingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * SSE endpoint — the Angular frontend connects here to receive live agent events.
   * GET /agent/stream/:hireId
   *
   * Emits events until the agent run signals completion via the done channel.
   */
  @Sse('stream/:hireId')
  stream(@Param('hireId') hireId: string): Observable<MessageEvent> {
    this.logger.log(`SSE client connected for hireId=${hireId}`);

    const events$ = fromEvent<SseEvent>(this.eventEmitter, `agent:${hireId}`);
    const done$ = fromEvent(this.eventEmitter, `agent:${hireId}:done`);

    return events$.pipe(
      takeUntil(done$),
      map(
        (event) =>
          ({
            data: event,
            type: event.event,
          }) as MessageEvent,
      ),
    );
  }

  /**
   * Trigger the onboarding agentic run for an existing hire record.
   * POST /agent/run/:hireId
   *
   * Returns 202 Accepted immediately; the agentic loop runs asynchronously.
   * Connect to GET /agent/stream/:hireId before calling this endpoint to
   * receive live SSE events from the run.
   */
  @Post('run/:hireId')
  @HttpCode(HttpStatus.ACCEPTED)
  async runOnboarding(
    @Param('hireId') hireId: string,
  ): Promise<{ accepted: boolean; hireId: string; message: string }> {
    let hire;
    try {
      hire = await this.onboardingService.findOne(hireId);
    } catch {
      throw new NotFoundException(
        `No hire record found with id=${hireId}. Create one via POST /onboarding first.`,
      );
    }

    this.logger.log(
      `Accepted onboarding run for hireId=${hireId} (${hire.name}, ${hire.role})`,
    );

    // Fire-and-forget — return 202 so the client can start listening on the SSE stream
    setImmediate(() => {
      void this.agentService
        .runOnboarding({
          hireId,
          name: hire.name,
          role: hire.role,
          startDate: hire.startDate,
          department: hire.department ?? undefined,
        })
        .catch((err: unknown) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.logger.error(
            `Unexpected error in onboarding run for hireId=${hireId}: ${errMsg}`,
          );
          this.eventEmitter.emit(`agent:${hireId}`, {
            event: 'ESCALATION',
            status: 'ESCALATED',
            message: `Unexpected error during onboarding: ${errMsg}`,
            employeeId: hireId,
            timestamp: new Date().toISOString(),
            requiresHumanAction: true,
            failedTool: 'agent_run',
          } as SseEvent);
          // Always signal done so the stream closes cleanly
          this.eventEmitter.emit(`agent:${hireId}:done`, {});
        });
    });

    return {
      accepted: true,
      hireId,
      message: `Onboarding run started for ${hire.name}. Connect to GET /agent/stream/${hireId} for live events.`,
    };
  }

  /**
   * Retrieve stored audit events for a hire.
   * GET /agent/events/:hireId
   */
  @Get('events/:hireId')
  getAgentEvents(@Param('hireId') hireId: string) {
    return this.onboardingService.getAgentEvents(hireId);
  }
}

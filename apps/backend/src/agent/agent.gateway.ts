import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { SseEvent } from './agent.service';

export interface SseMessageEvent {
  data: SseEvent;
}

/**
 * AgentGateway manages per-hireId SSE subjects so the controller can
 * subscribe to a stream and the service can push events into it.
 */
@Injectable()
export class AgentGateway {
  private readonly logger = new Logger(AgentGateway.name);
  private readonly subjects = new Map<string, Subject<SseMessageEvent>>();

  /**
   * Get or create a Subject for the given hireId.
   * The Angular frontend subscribes to this via the SSE endpoint.
   */
  getSubject(hireId: string): Subject<SseMessageEvent> {
    if (!this.subjects.has(hireId)) {
      this.subjects.set(hireId, new Subject<SseMessageEvent>());
      this.logger.debug(`Created SSE subject for hireId=${hireId}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.subjects.get(hireId)!;
  }

  /**
   * Emit an SSE event to all subscribers for a given hireId.
   */
  emit(hireId: string, event: SseEvent): void {
    const subject = this.getSubject(hireId);
    subject.next({ data: event });
    this.logger.debug(`SSE emit [${hireId}] ${event.event}: ${event.message}`);
  }

  /**
   * Complete (close) the SSE stream for a given hireId.
   * Call this when the onboarding run finishes.
   */
  complete(hireId: string): void {
    if (this.subjects.has(hireId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.subjects.get(hireId)!.complete();
      this.subjects.delete(hireId);
      this.logger.debug(`Completed and removed SSE subject for hireId=${hireId}`);
    }
  }
}

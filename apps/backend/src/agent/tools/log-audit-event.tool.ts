import { OnboardingService } from '../../onboarding/onboarding.service';
import { AgentEvent } from '../../onboarding/entities/agent-event.entity';

export interface LogAuditEventInput {
  employeeId: string;
  event: string;
  status: 'SUCCESS' | 'FAILURE' | 'ESCALATED';
  detail: string;
  timestamp: string;
}

export interface LogAuditEventOutput {
  id: string;
  employeeId: string;
  event: string;
  status: string;
  detail: string;
  timestamp: string;
  createdAt: Date;
}

export async function logAuditEvent(
  input: LogAuditEventInput,
  onboardingService: OnboardingService,
): Promise<LogAuditEventOutput> {
  console.log('[logAuditEvent] called with input:', JSON.stringify(input));

  let saved: AgentEvent;
  try {
    console.log('[logAuditEvent] calling onboardingService.saveAgentEvent...');
    saved = await onboardingService.saveAgentEvent({
      employeeId: input.employeeId,
      event: input.event,
      status: input.status,
      detail: input.detail,
      timestamp: input.timestamp,
    });
    console.log('[logAuditEvent] saveAgentEvent returned:', JSON.stringify(saved));
  } catch (err) {
    console.error('[logAuditEvent] saveAgentEvent threw:', err);
    throw err;
  }

  return {
    id: saved.id,
    employeeId: saved.employeeId,
    event: saved.event,
    status: saved.status,
    detail: saved.detail,
    timestamp: saved.timestamp,
    createdAt: saved.createdAt,
  };
}

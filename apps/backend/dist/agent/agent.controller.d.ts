import { MessageEvent } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { AgentService } from './agent.service';
import { OnboardingService } from '../onboarding/onboarding.service';
export declare class AgentController {
    private readonly agentService;
    private readonly onboardingService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(agentService: AgentService, onboardingService: OnboardingService, eventEmitter: EventEmitter2);
    stream(hireId: string): Observable<MessageEvent>;
    runOnboarding(hireId: string): Promise<{
        accepted: boolean;
        hireId: string;
        message: string;
    }>;
    getAgentEvents(hireId: string): Promise<import("../onboarding/entities/agent-event.entity").AgentEvent[]>;
}

import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnboardingService } from '../onboarding/onboarding.service';
export interface HireInput {
    hireId: string;
    name: string;
    role: string;
    startDate: string;
    department?: string;
}
export interface SseEvent {
    event: string;
    status: 'SUCCESS' | 'FAILURE' | 'ESCALATED' | 'INFO';
    message: string;
    employeeId: string | null;
    timestamp: string;
    requiresHumanAction?: boolean;
    failedTool?: string;
}
export interface OnboardingResult {
    hireId: string;
    employeeId: string | null;
    status: 'COMPLETE' | 'PARTIAL' | 'FAILED';
    summary: string;
    succeeded: string[];
    escalated: string[];
}
export declare class AgentService {
    private readonly onboardingService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly client;
    constructor(onboardingService: OnboardingService, eventEmitter: EventEmitter2);
    runOnboarding(hire: HireInput): Promise<OnboardingResult>;
    private emitToolSseEvent;
}

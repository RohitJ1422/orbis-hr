import { OnboardingService } from '../../onboarding/onboarding.service';
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
export declare function logAuditEvent(input: LogAuditEventInput, onboardingService: OnboardingService): Promise<LogAuditEventOutput>;

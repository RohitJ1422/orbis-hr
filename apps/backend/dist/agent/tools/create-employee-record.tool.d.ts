import { OnboardingService } from '../../onboarding/onboarding.service';
export interface CreateEmployeeRecordInput {
    name: string;
    role: string;
    startDate: string;
    department?: string;
}
export interface CreateEmployeeRecordOutput {
    employeeId: string;
    name: string;
    role: string;
    startDate: string;
    department: string;
}
export declare function createEmployeeRecord(input: CreateEmployeeRecordInput, onboardingService: OnboardingService): Promise<CreateEmployeeRecordOutput>;

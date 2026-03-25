import { OnboardingService } from '../../onboarding/onboarding.service';
export interface GenerateOnboardingPlanInput {
    employeeId: string;
    name: string;
    role: string;
    startDate: string;
}
export interface GenerateOnboardingPlanOutput {
    employeeId: string;
    plan: string;
    generatedAt: string;
}
export declare function generateOnboardingPlan(input: GenerateOnboardingPlanInput, onboardingService: OnboardingService): Promise<GenerateOnboardingPlanOutput>;

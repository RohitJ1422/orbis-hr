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

export async function createEmployeeRecord(
  input: CreateEmployeeRecordInput,
  onboardingService: OnboardingService,
): Promise<CreateEmployeeRecordOutput> {
  const hire = await onboardingService.create({
    name: input.name,
    role: input.role,
    startDate: input.startDate,
    department: input.department,
  });

  return {
    employeeId: hire.id,
    name: hire.name,
    role: hire.role,
    startDate: hire.startDate,
    department: hire.department,
  };
}

import Anthropic from '@anthropic-ai/sdk';
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

const PLAN_SYSTEM_PROMPT = `You are an expert HR onboarding specialist. Generate a detailed, structured 30/60/90-day onboarding plan for new hires.
The plan should be practical, actionable, and tailored to the specific role.

Structure the plan with these exact sections:
## Day 1–7: Orientation & Foundation
## Day 8–30: Role Ramp-Up
## Day 31–60: Independent Contribution
## Day 61–90: Full Productivity & Baseline

Each section should have 4-6 specific, actionable bullet points tailored to the role.
Be specific, professional, and encouraging. Write in second person ("You will...").`;

export async function generateOnboardingPlan(
  input: GenerateOnboardingPlanInput,
  onboardingService: OnboardingService,
): Promise<GenerateOnboardingPlanOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set — cannot generate onboarding plan',
    );
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Generate a 30/60/90-day onboarding plan for:
- Name: ${input.name}
- Role: ${input.role}
- Start Date: ${input.startDate}
- Employee ID: ${input.employeeId}

Tailor the plan specifically to the "${input.role}" position. Include role-specific tools, skills, stakeholders, and milestones.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: PLAN_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const planText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('\n');

  const generatedAt = new Date().toISOString();

  // Persist the plan to the hire record
  await onboardingService.update(input.employeeId, {
    onboardingPlan: planText,
  });

  return {
    employeeId: input.employeeId,
    plan: planText,
    generatedAt,
  };
}

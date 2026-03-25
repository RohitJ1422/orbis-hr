"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOnboardingPlan = generateOnboardingPlan;
const sdk_1 = require("@anthropic-ai/sdk");
const PLAN_SYSTEM_PROMPT = `You are an expert HR onboarding specialist. Generate a detailed, structured 30/60/90-day onboarding plan for new hires.
The plan should be practical, actionable, and tailored to the specific role.

Structure the plan with these exact sections:
## Day 1–7: Orientation & Foundation
## Day 8–30: Role Ramp-Up
## Day 31–60: Independent Contribution
## Day 61–90: Full Productivity & Baseline

Each section should have 4-6 specific, actionable bullet points tailored to the role.
Be specific, professional, and encouraging. Write in second person ("You will...").`;
async function generateOnboardingPlan(input, onboardingService) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is not set — cannot generate onboarding plan');
    }
    const client = new sdk_1.default({ apiKey });
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
        .map((block) => block.text)
        .join('\n');
    const generatedAt = new Date().toISOString();
    await onboardingService.update(input.employeeId, {
        onboardingPlan: planText,
    });
    return {
        employeeId: input.employeeId,
        plan: planText,
        generatedAt,
    };
}
//# sourceMappingURL=generate-onboarding-plan.tool.js.map
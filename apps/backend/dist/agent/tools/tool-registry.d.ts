import Anthropic from '@anthropic-ai/sdk';
import { OnboardingService } from '../../onboarding/onboarding.service';
export type ToolHandler = (input: Record<string, unknown>, onboardingService: OnboardingService) => Promise<unknown>;
export declare const TOOL_HANDLERS: Record<string, ToolHandler>;
export declare const ANTHROPIC_TOOL_DEFINITIONS: Anthropic.Tool[];

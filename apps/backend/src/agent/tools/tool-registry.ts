import Anthropic from '@anthropic-ai/sdk';
import { OnboardingService } from '../../onboarding/onboarding.service';
import {
  createEmployeeRecord,
  CreateEmployeeRecordInput,
} from './create-employee-record.tool';
import { sendTeamsWelcome, SendTeamsWelcomeInput } from './send-teams-welcome.tool';
import {
  generateOnboardingPlan,
  GenerateOnboardingPlanInput,
} from './generate-onboarding-plan.tool';
import { logAuditEvent, LogAuditEventInput } from './log-audit-event.tool';

export type ToolHandler = (
  input: Record<string, unknown>,
  onboardingService: OnboardingService,
) => Promise<unknown>;

export const TOOL_HANDLERS: Record<string, ToolHandler> = {
  create_employee_record: async (input, service) =>
    createEmployeeRecord(input as unknown as CreateEmployeeRecordInput, service),

  send_teams_welcome: async (input, _service) =>
    sendTeamsWelcome(input as unknown as SendTeamsWelcomeInput),

  generate_onboarding_plan: async (input, service) =>
    generateOnboardingPlan(input as unknown as GenerateOnboardingPlanInput, service),

  log_audit_event: async (input, service) =>
    logAuditEvent(input as unknown as LogAuditEventInput, service),
};

// Anthropic tool definitions for use in messages.create()
export const ANTHROPIC_TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'create_employee_record',
    description:
      'Creates a new employee/hire record in the database. Must be called first before any other tool. Returns the employeeId (UUID) needed for all subsequent tool calls.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Full name of the new hire',
        },
        role: {
          type: 'string',
          description: 'Job title / role of the new hire',
        },
        startDate: {
          type: 'string',
          description: 'Start date in ISO 8601 format (YYYY-MM-DD)',
        },
        department: {
          type: 'string',
          description:
            'Department name. If not provided, infer it from the role.',
        },
      },
      required: ['name', 'role', 'startDate'],
    },
  },
  {
    name: 'send_teams_welcome',
    description:
      'Sends a personalised welcome message to the Microsoft Teams onboarding channel. Call after create_employee_record succeeds. Non-fatal if it fails.',
    input_schema: {
      type: 'object' as const,
      properties: {
        employeeId: {
          type: 'string',
          description: 'UUID returned by create_employee_record',
        },
        name: {
          type: 'string',
          description: "Hire's full name",
        },
        role: {
          type: 'string',
          description: "Hire's job title",
        },
        startDate: {
          type: 'string',
          description: 'Start date in ISO 8601 format',
        },
        channel: {
          type: 'string',
          description: 'Teams channel name, default General',
        },
      },
      required: ['employeeId', 'name', 'role', 'startDate', 'channel'],
    },
  },
  {
    name: 'generate_onboarding_plan',
    description:
      'Generates a structured 30/60/90-day onboarding plan tailored to the hire\'s role using Claude AI. Call after create_employee_record succeeds. Non-fatal if it fails.',
    input_schema: {
      type: 'object' as const,
      properties: {
        employeeId: {
          type: 'string',
          description: 'UUID returned by create_employee_record',
        },
        name: {
          type: 'string',
          description: "Hire's full name",
        },
        role: {
          type: 'string',
          description: "Hire's job title",
        },
        startDate: {
          type: 'string',
          description: 'Start date in ISO 8601 format',
        },
      },
      required: ['employeeId', 'name', 'role', 'startDate'],
    },
  },
  {
    name: 'log_audit_event',
    description:
      'Logs an audit event to the database. MUST be called after every other tool call — success or failure. Never skip this.',
    input_schema: {
      type: 'object' as const,
      properties: {
        employeeId: {
          type: 'string',
          description: 'UUID of the employee, or "UNKNOWN" if creation failed',
        },
        event: {
          type: 'string',
          description:
            'Event name e.g. EMPLOYEE_CREATED, SLACK_SENT, SLACK_FAILED, PLAN_GENERATED, PLAN_FAILED, ONBOARDING_COMPLETE, ONBOARDING_PARTIAL',
        },
        status: {
          type: 'string',
          enum: ['SUCCESS', 'FAILURE', 'ESCALATED'],
          description: 'Outcome status of the event',
        },
        detail: {
          type: 'string',
          description:
            'One sentence explaining what occurred and why. Be specific.',
        },
        timestamp: {
          type: 'string',
          description: 'ISO 8601 datetime string of when the event occurred',
        },
      },
      required: ['employeeId', 'event', 'status', 'detail', 'timestamp'],
    },
  },
];

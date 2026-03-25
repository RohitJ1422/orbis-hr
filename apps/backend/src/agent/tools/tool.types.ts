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
  createdAt: string;
}

export interface SendSlackWelcomeInput {
  employeeId: string;
  name: string;
  role: string;
  startDate: string;
  channel: string;
}

export interface SendSlackWelcomeOutput {
  messageTimestamp: string;
  channel: string;
  delivered: boolean;
}

export interface SendTeamsWelcomeInput {
  employeeId: string;
  name: string;
  role: string;
  startDate: string;
  channel: string;
}

export interface SendTeamsWelcomeOutput {
  messageTimestamp: string;
  channel: string;
  delivered: boolean;
}

export interface GenerateOnboardingPlanInput {
  employeeId: string;
  name: string;
  role: string;
  startDate: string;
}

export interface GenerateOnboardingPlanOutput {
  employeeId: string;
  plan: {
    days1to7: string[];
    days8to30: string[];
    days31to60: string[];
    days61to90: string[];
  };
}

export interface LogAuditEventInput {
  employeeId: string;
  event: string;
  status: 'SUCCESS' | 'FAILURE' | 'ESCALATED';
  detail: string;
  timestamp: string;
}

export interface LogAuditEventOutput {
  logged: boolean;
  eventId: string;
}

export const TOOL_DEFINITIONS = [
  {
    name: 'create_employee_record',
    description:
      'Call this tool first for every onboarding run. Creates a new employee record in the HR database. Returns an employeeId that all subsequent tools require. If this tool fails, stop immediately and escalate.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the new hire' },
        role: { type: 'string', description: 'Job title of the new hire' },
        startDate: { type: 'string', description: 'Start date in ISO format e.g. 2026-03-30' },
        department: { type: 'string', description: 'Department name — infer from role if not provided' },
      },
      required: ['name', 'role', 'startDate'],
    },
  },
  {
    name: 'send_teams_welcome',
    description:
      'Call this tool after create_employee_record succeeds. Sends a personalised welcome message to the Microsoft Teams onboarding channel. If this fails, log the failure and continue — do not stop the onboarding run.',
    input_schema: {
      type: 'object',
      properties: {
        employeeId: { type: 'string', description: 'UUID returned by create_employee_record' },
        name: { type: 'string', description: 'Full name of the new hire' },
        role: { type: 'string', description: 'Job title of the new hire' },
        startDate: { type: 'string', description: 'Start date in ISO format' },
        channel: { type: 'string', description: 'Teams channel name, default is General' },
      },
      required: ['employeeId', 'name', 'role', 'startDate', 'channel'],
    },
  },
  {
    name: 'generate_onboarding_plan',
    description:
      'Call this tool after create_employee_record succeeds. Generates a personalised 30/60/90 day onboarding plan tailored to the hire role. If this fails, log the failure and continue.',
    input_schema: {
      type: 'object',
      properties: {
        employeeId: { type: 'string', description: 'UUID returned by create_employee_record' },
        name: { type: 'string', description: 'Full name of the new hire' },
        role: { type: 'string', description: 'Job title of the new hire' },
        startDate: { type: 'string', description: 'Start date in ISO format' },
      },
      required: ['employeeId', 'name', 'role', 'startDate'],
    },
  },
  {
    name: 'log_audit_event',
    description:
      'Call this tool after every other tool call, whether it succeeded or failed. Records what happened and why to the audit log. Never skip this. If logging itself fails, print a warning and continue.',
    input_schema: {
      type: 'object',
      properties: {
        employeeId: { type: 'string', description: 'UUID of the employee, or UNKNOWN if create_employee_record failed' },
        event: { type: 'string', description: 'Event name e.g. EMPLOYEE_CREATED, SLACK_FAILED, PLAN_GENERATED' },
        status: { type: 'string', enum: ['SUCCESS', 'FAILURE', 'ESCALATED'], description: 'Outcome of the action' },
        detail: { type: 'string', description: 'One sentence explaining what happened and why' },
        timestamp: { type: 'string', description: 'ISO datetime of when this event occurred' },
      },
      required: ['employeeId', 'event', 'status', 'detail', 'timestamp'],
    },
  },
];
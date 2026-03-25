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
export declare const TOOL_DEFINITIONS: ({
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            name: {
                type: string;
                description: string;
            };
            role: {
                type: string;
                description: string;
            };
            startDate: {
                type: string;
                description: string;
            };
            department: {
                type: string;
                description: string;
            };
            employeeId?: undefined;
            channel?: undefined;
            event?: undefined;
            status?: undefined;
            detail?: undefined;
            timestamp?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            employeeId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            role: {
                type: string;
                description: string;
            };
            startDate: {
                type: string;
                description: string;
            };
            channel: {
                type: string;
                description: string;
            };
            department?: undefined;
            event?: undefined;
            status?: undefined;
            detail?: undefined;
            timestamp?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            employeeId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            role: {
                type: string;
                description: string;
            };
            startDate: {
                type: string;
                description: string;
            };
            department?: undefined;
            channel?: undefined;
            event?: undefined;
            status?: undefined;
            detail?: undefined;
            timestamp?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            employeeId: {
                type: string;
                description: string;
            };
            event: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            detail: {
                type: string;
                description: string;
            };
            timestamp: {
                type: string;
                description: string;
            };
            name?: undefined;
            role?: undefined;
            startDate?: undefined;
            department?: undefined;
            channel?: undefined;
        };
        required: string[];
    };
})[];

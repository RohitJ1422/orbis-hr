"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const sdk_1 = require("@anthropic-ai/sdk");
const onboarding_service_1 = require("../onboarding/onboarding.service");
const tool_registry_1 = require("./tools/tool-registry");
const AGENT_SYSTEM_PROMPT = `You are the OrbisHR Provisioner Agent, an autonomous onboarding orchestrator for OrbisHR — an agentic HRMS.

Your job is to autonomously complete all onboarding provisioning steps for a new hire in the correct order.
The hire record already exists in the database. You will be given the employeeId to use — do NOT call create_employee_record.

MANDATORY EXECUTION ORDER — follow this exactly:
1. send_teams_welcome → log_audit_event (TEAMS_SENT or TEAMS_FAILED)
   - If send_teams_welcome fails: log TEAMS_FAILED audit event, continue to step 2. Do NOT stop.
2. generate_onboarding_plan → log_audit_event (PLAN_GENERATED or PLAN_FAILED)
   - If generate_onboarding_plan fails: log PLAN_FAILED audit event, continue to step 3. Do NOT stop.
3. Final log_audit_event (ONBOARDING_COMPLETE or ONBOARDING_PARTIAL)
   - ONBOARDING_COMPLETE if all steps succeeded.
   - ONBOARDING_PARTIAL if any non-critical step failed. Detail what succeeded and what needs human follow-up.

RULES:
- Never skip log_audit_event after any tool call, success or failure.
- Never invent an employeeId — always use the exact employeeId provided in the user message.
- Always set the channel to "General" for send_teams_welcome.
- Log concise, specific detail strings in audit events — explain what occurred and why.
- All timestamps must be ISO 8601 format.

Before calling each tool, briefly reason about why you're calling it so the reasoning is transparent.`;
const SLEEP_MS = 1000;
const MAX_ITERATIONS = 20;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
let AgentService = AgentService_1 = class AgentService {
    constructor(onboardingService, eventEmitter) {
        this.onboardingService = onboardingService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AgentService_1.name);
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            this.logger.warn('ANTHROPIC_API_KEY not set — agent calls will fail at runtime');
        }
        this.client = new sdk_1.default({ apiKey: apiKey ?? 'not-set' });
    }
    async runOnboarding(hire) {
        const { hireId } = hire;
        const now = () => new Date().toISOString();
        let employeeId = hireId;
        const succeeded = [];
        const escalated = [];
        const emit = (event) => {
            this.eventEmitter.emit(`agent:${hireId}`, event);
        };
        this.logger.log(`Starting onboarding for ${hire.name} (${hire.role}, start ${hire.startDate})`);
        const initialUserMessage = `Start the onboarding provisioning run for this hire. The employee record already exists — do NOT call create_employee_record.

Employee details:
- Name: ${hire.name}
- Role: ${hire.role}
- Start Date: ${hire.startDate}
- Department: ${hire.department ?? '(infer from role)'}
- Employee ID: ${hireId}

Use "${hireId}" as the employeeId for ALL tool calls (send_teams_welcome, generate_onboarding_plan, and every log_audit_event).

Follow the mandatory execution order: send_teams_welcome → generate_onboarding_plan → final audit log.
Log an audit event after EVERY tool call. Begin now.`;
        const messages = [
            { role: 'user', content: initialUserMessage },
        ];
        let iterations = 0;
        while (iterations < MAX_ITERATIONS) {
            iterations++;
            this.logger.debug(`Agentic loop iteration ${iterations}`);
            let response;
            try {
                response = await this.client.messages.create({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 4096,
                    system: AGENT_SYSTEM_PROMPT,
                    tools: tool_registry_1.ANTHROPIC_TOOL_DEFINITIONS,
                    tool_choice: { type: 'auto' },
                    messages,
                });
            }
            catch (err) {
                const errMsg = err instanceof Error ? err.message : String(err);
                this.logger.error(`Claude API call failed: ${errMsg}`);
                emit({
                    event: 'ESCALATION',
                    status: 'ESCALATED',
                    message: `Claude API error: ${errMsg}`,
                    employeeId,
                    timestamp: now(),
                    requiresHumanAction: true,
                    failedTool: 'claude_api',
                });
                escalated.push('claude_api');
                break;
            }
            for (const block of response.content) {
                if (block.type === 'text' && block.text.trim()) {
                    this.logger.log(`[Agent reasoning] ${block.text.trim()}`);
                }
            }
            const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
            if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
                this.logger.log('Agent completed the onboarding run');
                break;
            }
            messages.push({ role: 'assistant', content: response.content });
            const toolResults = [];
            for (const toolUse of toolUseBlocks) {
                const toolName = toolUse.name;
                const toolInput = toolUse.input;
                this.logger.log(`Calling tool: ${toolName}`);
                console.log(`[AgentService] tool=${toolName} input=${JSON.stringify(toolInput)}`);
                let result;
                let toolError = null;
                const handler = tool_registry_1.TOOL_HANDLERS[toolName];
                if (!handler) {
                    console.error(`[AgentService] No handler found for tool: ${toolName}`);
                    toolError = `Unknown tool: ${toolName}`;
                }
                else {
                    try {
                        result = await handler(toolInput, this.onboardingService);
                        console.log(`[AgentService] tool=${toolName} result=${JSON.stringify(result)}`);
                    }
                    catch (err) {
                        const errMsg = err instanceof Error ? err.message : String(err);
                        this.logger.warn(`Tool ${toolName} failed on first attempt: ${errMsg}. Retrying in ${SLEEP_MS}ms...`);
                        await sleep(SLEEP_MS);
                        try {
                            result = await handler(toolInput, this.onboardingService);
                            console.log(`[AgentService] tool=${toolName} retry result=${JSON.stringify(result)}`);
                        }
                        catch (retryErr) {
                            toolError =
                                retryErr instanceof Error
                                    ? retryErr.message
                                    : String(retryErr);
                            this.logger.error(`Tool ${toolName} failed after retry: ${toolError}`);
                        }
                    }
                }
                if (!toolError && toolName === 'create_employee_record' && result) {
                    const res = result;
                    if (res.employeeId)
                        employeeId = res.employeeId;
                }
                this.emitToolSseEvent(toolName, toolError, result, employeeId, emit, now(), succeeded, escalated);
                toolResults.push(toolError
                    ? {
                        type: 'tool_result',
                        tool_use_id: toolUse.id,
                        is_error: true,
                        content: `Error: ${toolError}`,
                    }
                    : {
                        type: 'tool_result',
                        tool_use_id: toolUse.id,
                        content: JSON.stringify(result),
                    });
            }
            messages.push({ role: 'user', content: toolResults });
            if (response.stop_reason !== 'tool_use') {
                this.logger.log(`Agent stop_reason=${response.stop_reason}, ending loop`);
                break;
            }
        }
        if (iterations >= MAX_ITERATIONS) {
            this.logger.warn(`Agentic loop reached max iterations (${MAX_ITERATIONS}). Terminating.`);
            emit({
                event: 'ESCALATION',
                status: 'ESCALATED',
                message: `Onboarding run exceeded maximum iterations (${MAX_ITERATIONS}). Manual review required.`,
                employeeId,
                timestamp: new Date().toISOString(),
                requiresHumanAction: true,
                failedTool: 'agent_loop',
            });
            escalated.push('agent_loop');
        }
        this.eventEmitter.emit(`agent:${hireId}:done`, {});
        const isComplete = escalated.length === 0;
        const runStatus = isComplete ? 'COMPLETE' : employeeId ? 'PARTIAL' : 'FAILED';
        const summary = isComplete
            ? `Onboarding completed successfully for ${hire.name}. All steps provisioned.`
            : `Onboarding ${runStatus.toLowerCase()} for ${hire.name}. ` +
                `Succeeded: [${succeeded.join(', ')}]. ` +
                `Escalated: [${escalated.join(', ')}].`;
        return { hireId, employeeId, status: runStatus, summary, succeeded, escalated };
    }
    emitToolSseEvent(toolName, toolError, result, employeeId, emit, timestamp, succeeded, escalated) {
        const eventMap = {
            create_employee_record: {
                success: 'EMPLOYEE_CREATED',
                failure: 'EMPLOYEE_CREATE_FAILED',
            },
            send_teams_welcome: {
                success: 'TEAMS_SENT',
                failure: 'TEAMS_FAILED',
            },
            generate_onboarding_plan: {
                success: 'PLAN_GENERATED',
                failure: 'PLAN_FAILED',
            },
            log_audit_event: {
                success: 'AUDIT_LOGGED',
                failure: 'AUDIT_LOG_FAILED',
            },
        };
        const eventNames = eventMap[toolName] ?? {
            success: `${toolName.toUpperCase()}_SUCCESS`,
            failure: `${toolName.toUpperCase()}_FAILED`,
        };
        if (toolError) {
            const isCritical = toolName === 'create_employee_record';
            escalated.push(toolName);
            emit({
                event: isCritical ? 'ESCALATION' : eventNames.failure,
                status: 'ESCALATED',
                message: `${toolName} failed after 1 retry: ${toolError}`,
                employeeId,
                timestamp,
                ...(isCritical && { requiresHumanAction: true }),
                failedTool: toolName,
            });
            return;
        }
        succeeded.push(toolName);
        let message = `${toolName} completed successfully`;
        if (toolName === 'create_employee_record' && result) {
            const res = result;
            message = `Employee record created for ${res.name} (ID: ${res.employeeId})`;
        }
        else if (toolName === 'send_teams_welcome') {
            message = 'Teams welcome message sent to the onboarding channel';
        }
        else if (toolName === 'generate_onboarding_plan') {
            message = '30/60/90-day onboarding plan generated and saved';
        }
        else if (toolName === 'log_audit_event' && result) {
            const res = result;
            message = `Audit event logged: ${res.event} (${res.status})`;
            if (res.event === 'ONBOARDING_COMPLETE' || res.event === 'ONBOARDING_PARTIAL') {
                emit({
                    event: res.event,
                    status: 'SUCCESS',
                    message: res.event === 'ONBOARDING_COMPLETE'
                        ? 'Onboarding run completed successfully — all steps provisioned'
                        : 'Onboarding run completed with partial success — some steps require human follow-up',
                    employeeId,
                    timestamp,
                });
                return;
            }
        }
        emit({
            event: eventNames.success,
            status: 'SUCCESS',
            message,
            employeeId,
            timestamp,
        });
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService,
        event_emitter_1.EventEmitter2])
], AgentService);
//# sourceMappingURL=agent.service.js.map
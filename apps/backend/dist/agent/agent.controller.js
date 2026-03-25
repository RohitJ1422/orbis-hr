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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AgentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const agent_service_1 = require("./agent.service");
const onboarding_service_1 = require("../onboarding/onboarding.service");
let AgentController = AgentController_1 = class AgentController {
    constructor(agentService, onboardingService, eventEmitter) {
        this.agentService = agentService;
        this.onboardingService = onboardingService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AgentController_1.name);
    }
    stream(hireId) {
        this.logger.log(`SSE client connected for hireId=${hireId}`);
        const events$ = (0, rxjs_1.fromEvent)(this.eventEmitter, `agent:${hireId}`);
        const done$ = (0, rxjs_1.fromEvent)(this.eventEmitter, `agent:${hireId}:done`);
        return events$.pipe((0, operators_1.takeUntil)(done$), (0, operators_1.map)((event) => ({
            data: event,
            type: event.event,
        })));
    }
    async runOnboarding(hireId) {
        let hire;
        try {
            hire = await this.onboardingService.findOne(hireId);
        }
        catch {
            throw new common_1.NotFoundException(`No hire record found with id=${hireId}. Create one via POST /onboarding first.`);
        }
        this.logger.log(`Accepted onboarding run for hireId=${hireId} (${hire.name}, ${hire.role})`);
        setImmediate(() => {
            void this.agentService
                .runOnboarding({
                hireId,
                name: hire.name,
                role: hire.role,
                startDate: hire.startDate,
                department: hire.department ?? undefined,
            })
                .catch((err) => {
                const errMsg = err instanceof Error ? err.message : String(err);
                this.logger.error(`Unexpected error in onboarding run for hireId=${hireId}: ${errMsg}`);
                this.eventEmitter.emit(`agent:${hireId}`, {
                    event: 'ESCALATION',
                    status: 'ESCALATED',
                    message: `Unexpected error during onboarding: ${errMsg}`,
                    employeeId: hireId,
                    timestamp: new Date().toISOString(),
                    requiresHumanAction: true,
                    failedTool: 'agent_run',
                });
                this.eventEmitter.emit(`agent:${hireId}:done`, {});
            });
        });
        return {
            accepted: true,
            hireId,
            message: `Onboarding run started for ${hire.name}. Connect to GET /agent/stream/${hireId} for live events.`,
        };
    }
    getAgentEvents(hireId) {
        return this.onboardingService.getAgentEvents(hireId);
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Sse)('stream/:hireId'),
    __param(0, (0, common_1.Param)('hireId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], AgentController.prototype, "stream", null);
__decorate([
    (0, common_1.Post)('run/:hireId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Param)('hireId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "runOnboarding", null);
__decorate([
    (0, common_1.Get)('events/:hireId'),
    __param(0, (0, common_1.Param)('hireId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "getAgentEvents", null);
exports.AgentController = AgentController = AgentController_1 = __decorate([
    (0, common_1.Controller)('agent'),
    __metadata("design:paramtypes", [agent_service_1.AgentService,
        onboarding_service_1.OnboardingService,
        event_emitter_1.EventEmitter2])
], AgentController);
//# sourceMappingURL=agent.controller.js.map
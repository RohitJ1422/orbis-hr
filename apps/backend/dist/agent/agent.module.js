"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const agent_controller_1 = require("./agent.controller");
const agent_service_1 = require("./agent.service");
const agent_gateway_1 = require("./agent.gateway");
const onboarding_module_1 = require("../onboarding/onboarding.module");
let AgentModule = class AgentModule {
};
exports.AgentModule = AgentModule;
exports.AgentModule = AgentModule = __decorate([
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule, onboarding_module_1.OnboardingModule],
        controllers: [agent_controller_1.AgentController],
        providers: [agent_service_1.AgentService, agent_gateway_1.AgentGateway],
        exports: [agent_service_1.AgentService, agent_gateway_1.AgentGateway],
    })
], AgentModule);
//# sourceMappingURL=agent.module.js.map
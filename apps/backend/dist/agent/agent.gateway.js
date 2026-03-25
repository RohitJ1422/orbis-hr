"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AgentGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentGateway = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let AgentGateway = AgentGateway_1 = class AgentGateway {
    constructor() {
        this.logger = new common_1.Logger(AgentGateway_1.name);
        this.subjects = new Map();
    }
    getSubject(hireId) {
        if (!this.subjects.has(hireId)) {
            this.subjects.set(hireId, new rxjs_1.Subject());
            this.logger.debug(`Created SSE subject for hireId=${hireId}`);
        }
        return this.subjects.get(hireId);
    }
    emit(hireId, event) {
        const subject = this.getSubject(hireId);
        subject.next({ data: event });
        this.logger.debug(`SSE emit [${hireId}] ${event.event}: ${event.message}`);
    }
    complete(hireId) {
        if (this.subjects.has(hireId)) {
            this.subjects.get(hireId).complete();
            this.subjects.delete(hireId);
            this.logger.debug(`Completed and removed SSE subject for hireId=${hireId}`);
        }
    }
};
exports.AgentGateway = AgentGateway;
exports.AgentGateway = AgentGateway = AgentGateway_1 = __decorate([
    (0, common_1.Injectable)()
], AgentGateway);
//# sourceMappingURL=agent.gateway.js.map
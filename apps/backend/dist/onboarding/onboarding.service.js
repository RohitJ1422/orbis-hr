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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const hire_entity_1 = require("./entities/hire.entity");
const agent_event_entity_1 = require("./entities/agent-event.entity");
let OnboardingService = class OnboardingService {
    constructor(hireRepository, agentEventRepository) {
        this.hireRepository = hireRepository;
        this.agentEventRepository = agentEventRepository;
    }
    async create(createHireDto) {
        const department = createHireDto.department ?? this.inferDepartment(createHireDto.role);
        const hire = this.hireRepository.create({ ...createHireDto, department });
        return this.hireRepository.save(hire);
    }
    async findAll() {
        return this.hireRepository.find({ order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const hire = await this.hireRepository.findOne({ where: { id } });
        if (!hire) {
            throw new common_1.NotFoundException(`Hire with id ${id} not found`);
        }
        return hire;
    }
    async update(id, updateHireDto) {
        const hire = await this.findOne(id);
        Object.assign(hire, updateHireDto);
        return this.hireRepository.save(hire);
    }
    async remove(id) {
        const hire = await this.findOne(id);
        await this.hireRepository.remove(hire);
    }
    async saveHire(hire) {
        return this.hireRepository.save(hire);
    }
    async saveAgentEvent(event) {
        console.log('[saveAgentEvent] called with:', JSON.stringify(event));
        try {
            const result = await this.agentEventRepository.save(event);
            console.log('[saveAgentEvent] repository.save returned id:', result.id, 'event:', result.event);
            return result;
        }
        catch (err) {
            console.error('[saveAgentEvent] repository.save threw:', err);
            throw err;
        }
    }
    async getAgentEvents(employeeId) {
        return this.agentEventRepository.find({
            where: { employeeId },
            order: { createdAt: 'ASC' },
        });
    }
    inferDepartment(role) {
        const roleLower = role.toLowerCase();
        if (roleLower.includes('engineer') ||
            roleLower.includes('developer') ||
            roleLower.includes('architect') ||
            roleLower.includes('devops') ||
            roleLower.includes('sre')) {
            return 'Engineering';
        }
        if (roleLower.includes('designer') ||
            roleLower.includes('ux') ||
            roleLower.includes('ui')) {
            return 'Design';
        }
        if (roleLower.includes('product') ||
            roleLower.includes('pm') ||
            roleLower.includes('manager')) {
            return 'Product';
        }
        if (roleLower.includes('sales') ||
            roleLower.includes('account') ||
            roleLower.includes('revenue')) {
            return 'Sales';
        }
        if (roleLower.includes('market') ||
            roleLower.includes('growth') ||
            roleLower.includes('content')) {
            return 'Marketing';
        }
        if (roleLower.includes('hr') ||
            roleLower.includes('people') ||
            roleLower.includes('talent') ||
            roleLower.includes('recruit')) {
            return 'People & Culture';
        }
        if (roleLower.includes('finance') ||
            roleLower.includes('accounting') ||
            roleLower.includes('controller')) {
            return 'Finance';
        }
        if (roleLower.includes('data') ||
            roleLower.includes('analyst') ||
            roleLower.includes('science')) {
            return 'Data & Analytics';
        }
        if (roleLower.includes('legal') || roleLower.includes('counsel')) {
            return 'Legal';
        }
        if (roleLower.includes('operations') || roleLower.includes('ops')) {
            return 'Operations';
        }
        return 'General';
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(hire_entity_1.Hire)),
    __param(1, (0, typeorm_1.InjectRepository)(agent_event_entity_1.AgentEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map
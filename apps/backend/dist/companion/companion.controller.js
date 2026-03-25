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
var CompanionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanionController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const class_validator_1 = require("class-validator");
const companion_service_1 = require("./companion.service");
class ChatRequestDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChatRequestDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChatRequestDto.prototype, "hireId", void 0);
let CompanionController = CompanionController_1 = class CompanionController {
    constructor(companionService) {
        this.companionService = companionService;
        this.logger = new common_1.Logger(CompanionController_1.name);
    }
    chat(body) {
        this.logger.log(`Companion chat request: "${body.message.substring(0, 80)}..." hireId=${body.hireId ?? 'none'}`);
        const stream$ = this.companionService.streamChat({
            message: body.message,
            hireId: body.hireId,
        });
        return stream$.pipe((0, rxjs_1.map)((event) => ({
            data: event,
            type: event.event,
        })));
    }
};
exports.CompanionController = CompanionController;
__decorate([
    (0, common_1.Sse)('chat'),
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChatRequestDto]),
    __metadata("design:returntype", rxjs_1.Observable)
], CompanionController.prototype, "chat", null);
exports.CompanionController = CompanionController = CompanionController_1 = __decorate([
    (0, common_1.Controller)('companion'),
    __metadata("design:paramtypes", [companion_service_1.CompanionService])
], CompanionController);
//# sourceMappingURL=companion.controller.js.map
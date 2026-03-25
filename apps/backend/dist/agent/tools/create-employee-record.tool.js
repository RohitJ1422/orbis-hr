"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployeeRecord = createEmployeeRecord;
async function createEmployeeRecord(input, onboardingService) {
    const hire = await onboardingService.create({
        name: input.name,
        role: input.role,
        startDate: input.startDate,
        department: input.department,
    });
    return {
        employeeId: hire.id,
        name: hire.name,
        role: hire.role,
        startDate: hire.startDate,
        department: hire.department,
    };
}
//# sourceMappingURL=create-employee-record.tool.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = logAuditEvent;
async function logAuditEvent(input, onboardingService) {
    console.log('[logAuditEvent] called with input:', JSON.stringify(input));
    let saved;
    try {
        console.log('[logAuditEvent] calling onboardingService.saveAgentEvent...');
        saved = await onboardingService.saveAgentEvent({
            employeeId: input.employeeId,
            event: input.event,
            status: input.status,
            detail: input.detail,
            timestamp: input.timestamp,
        });
        console.log('[logAuditEvent] saveAgentEvent returned:', JSON.stringify(saved));
    }
    catch (err) {
        console.error('[logAuditEvent] saveAgentEvent threw:', err);
        throw err;
    }
    return {
        id: saved.id,
        employeeId: saved.employeeId,
        event: saved.event,
        status: saved.status,
        detail: saved.detail,
        timestamp: saved.timestamp,
        createdAt: saved.createdAt,
    };
}
//# sourceMappingURL=log-audit-event.tool.js.map
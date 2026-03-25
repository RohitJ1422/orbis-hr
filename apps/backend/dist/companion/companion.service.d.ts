import { Observable } from 'rxjs';
export interface ChatInput {
    message: string;
    hireId?: string;
}
export interface CompanionSseEvent {
    type: 'COMPANION_EVENT';
    event: 'TEXT_DELTA' | 'MESSAGE_START' | 'MESSAGE_STOP' | 'ERROR';
    text?: string;
    message?: string;
    timestamp: string;
}
export declare class CompanionService {
    private readonly logger;
    private readonly client;
    constructor();
    streamChat(input: ChatInput): Observable<CompanionSseEvent>;
}

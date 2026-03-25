import { Subject } from 'rxjs';
import { SseEvent } from './agent.service';
export interface SseMessageEvent {
    data: SseEvent;
}
export declare class AgentGateway {
    private readonly logger;
    private readonly subjects;
    getSubject(hireId: string): Subject<SseMessageEvent>;
    emit(hireId: string, event: SseEvent): void;
    complete(hireId: string): void;
}

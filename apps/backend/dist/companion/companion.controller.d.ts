import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CompanionService } from './companion.service';
declare class ChatRequestDto {
    message: string;
    hireId?: string;
}
export declare class CompanionController {
    private readonly companionService;
    private readonly logger;
    constructor(companionService: CompanionService);
    chat(body: ChatRequestDto): Observable<MessageEvent>;
}
export {};

import { Repository } from 'typeorm';
import { Hire } from './entities/hire.entity';
import { AgentEvent } from './entities/agent-event.entity';
import { CreateHireDto } from './dto/create-hire.dto';
import { UpdateHireDto } from './dto/update-hire.dto';
export declare class OnboardingService {
    private readonly hireRepository;
    private readonly agentEventRepository;
    constructor(hireRepository: Repository<Hire>, agentEventRepository: Repository<AgentEvent>);
    create(createHireDto: CreateHireDto): Promise<Hire>;
    findAll(): Promise<Hire[]>;
    findOne(id: string): Promise<Hire>;
    update(id: string, updateHireDto: UpdateHireDto): Promise<Hire>;
    remove(id: string): Promise<void>;
    saveHire(hire: Partial<Hire>): Promise<Hire>;
    saveAgentEvent(event: Partial<AgentEvent>): Promise<AgentEvent>;
    getAgentEvents(employeeId: string): Promise<AgentEvent[]>;
    private inferDepartment;
}

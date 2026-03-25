import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hire } from './entities/hire.entity';
import { AgentEvent } from './entities/agent-event.entity';
import { CreateHireDto } from './dto/create-hire.dto';
import { UpdateHireDto } from './dto/update-hire.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(Hire)
    private readonly hireRepository: Repository<Hire>,
    @InjectRepository(AgentEvent)
    private readonly agentEventRepository: Repository<AgentEvent>,
  ) {}

  async create(createHireDto: CreateHireDto): Promise<Hire> {
    // Infer department from role if not provided
    const department =
      createHireDto.department ?? this.inferDepartment(createHireDto.role);
    const hire = this.hireRepository.create({ ...createHireDto, department });
    return this.hireRepository.save(hire);
  }

  async findAll(): Promise<Hire[]> {
    return this.hireRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Hire> {
    const hire = await this.hireRepository.findOne({ where: { id } });
    if (!hire) {
      throw new NotFoundException(`Hire with id ${id} not found`);
    }
    return hire;
  }

  async update(id: string, updateHireDto: UpdateHireDto): Promise<Hire> {
    const hire = await this.findOne(id);
    Object.assign(hire, updateHireDto);
    return this.hireRepository.save(hire);
  }

  async remove(id: string): Promise<void> {
    const hire = await this.findOne(id);
    await this.hireRepository.remove(hire);
  }

  async saveHire(hire: Partial<Hire>): Promise<Hire> {
    return this.hireRepository.save(hire);
  }

  async saveAgentEvent(event: Partial<AgentEvent>): Promise<AgentEvent> {
    console.log('[saveAgentEvent] called with:', JSON.stringify(event));
    try {
      const result = await this.agentEventRepository.save(event);
      console.log('[saveAgentEvent] repository.save returned id:', result.id, 'event:', result.event);
      return result;
    } catch (err) {
      console.error('[saveAgentEvent] repository.save threw:', err);
      throw err;
    }
  }

  async getAgentEvents(employeeId: string): Promise<AgentEvent[]> {
    return this.agentEventRepository.find({
      where: { employeeId },
      order: { createdAt: 'ASC' },
    });
  }

  private inferDepartment(role: string): string {
    const roleLower = role.toLowerCase();
    if (
      roleLower.includes('engineer') ||
      roleLower.includes('developer') ||
      roleLower.includes('architect') ||
      roleLower.includes('devops') ||
      roleLower.includes('sre')
    ) {
      return 'Engineering';
    }
    if (
      roleLower.includes('designer') ||
      roleLower.includes('ux') ||
      roleLower.includes('ui')
    ) {
      return 'Design';
    }
    if (
      roleLower.includes('product') ||
      roleLower.includes('pm') ||
      roleLower.includes('manager')
    ) {
      return 'Product';
    }
    if (
      roleLower.includes('sales') ||
      roleLower.includes('account') ||
      roleLower.includes('revenue')
    ) {
      return 'Sales';
    }
    if (
      roleLower.includes('market') ||
      roleLower.includes('growth') ||
      roleLower.includes('content')
    ) {
      return 'Marketing';
    }
    if (
      roleLower.includes('hr') ||
      roleLower.includes('people') ||
      roleLower.includes('talent') ||
      roleLower.includes('recruit')
    ) {
      return 'People & Culture';
    }
    if (
      roleLower.includes('finance') ||
      roleLower.includes('accounting') ||
      roleLower.includes('controller')
    ) {
      return 'Finance';
    }
    if (
      roleLower.includes('data') ||
      roleLower.includes('analyst') ||
      roleLower.includes('science')
    ) {
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
}

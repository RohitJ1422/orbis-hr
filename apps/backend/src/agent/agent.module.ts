import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentGateway } from './agent.gateway';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [EventEmitterModule, OnboardingModule],
  controllers: [AgentController],
  providers: [AgentService, AgentGateway],
  exports: [AgentService, AgentGateway],
})
export class AgentModule {}

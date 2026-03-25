import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { Hire } from './entities/hire.entity';
import { AgentEvent } from './entities/agent-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hire, AgentEvent])],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}

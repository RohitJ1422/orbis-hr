import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingModule } from './onboarding/onboarding.module';
import { AgentModule } from './agent/agent.module';
import { CompanionModule } from './companion/companion.module';
import { Hire } from './onboarding/entities/hire.entity';
import { AgentEvent } from './onboarding/entities/agent-event.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      database: process.env.DATABASE_NAME ?? 'orbishr',
      username: process.env.DATABASE_USER ?? 'orbis',
      password: process.env.DATABASE_PASSWORD ?? 'orbis_secret',
      entities: [Hire, AgentEvent],
      synchronize: process.env.NODE_ENV !== 'production', // auto-sync schema in dev
      logging: process.env.NODE_ENV === 'development',
    }),
    OnboardingModule,
    AgentModule,
    CompanionModule,
  ],
})
export class AppModule {}

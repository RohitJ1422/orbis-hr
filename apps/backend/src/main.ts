import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Angular frontend (default port 4200)
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:3001',
      process.env.FRONTEND_URL ?? 'http://localhost:4200',
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe — strips unknown fields, validates DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);

  logger.log(`OrbisHR backend is running on http://localhost:${port}`);
  logger.log(`SSE agent stream: GET http://localhost:${port}/agent/stream/:hireId`);
  logger.log(`Trigger onboarding: POST http://localhost:${port}/agent/run/:hireId`);
  logger.log(`Companion chat: POST http://localhost:${port}/companion/chat`);
}

void bootstrap();

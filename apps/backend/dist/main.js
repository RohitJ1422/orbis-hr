"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const port = parseInt(process.env.PORT ?? '3001', 10);
    await app.listen(port);
    logger.log(`OrbisHR backend is running on http://localhost:${port}`);
    logger.log(`SSE agent stream: GET http://localhost:${port}/agent/stream/:hireId`);
    logger.log(`Trigger onboarding: POST http://localhost:${port}/agent/run/:hireId`);
    logger.log(`Companion chat: POST http://localhost:${port}/companion/chat`);
}
void bootstrap();
//# sourceMappingURL=main.js.map
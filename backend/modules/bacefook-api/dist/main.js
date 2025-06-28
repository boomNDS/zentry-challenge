"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Bacefook API')
        .setDescription('A social media platform API built with NestJS and Prisma')
        .setVersion('1.0')
        .addTag('users', 'User management endpoints')
        .addTag('posts', 'Post management endpoints')
        .addTag('comments', 'Comment management endpoints')
        .addTag('likes', 'Like management endpoints')
        .addTag('follows', 'Follow relationship endpoints')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Bacefook API Documentation',
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation is available at: http://localhost:${port}/api`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    const signals = ['SIGTERM', 'SIGINT'];
    for (const signal of signals) {
        process.on(signal, async () => {
            logger.log(`Received ${signal}, starting graceful shutdown...`);
            await app.close();
            logger.log('Application closed successfully');
            process.exit(0);
        });
    }
}
bootstrap().catch((error) => {
    const logger = new common_1.Logger('Bootstrap');
    logger.error('Failed to start application', error.stack);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
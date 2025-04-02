"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors();
    app.setGlobalPrefix('api');
    app.connectMicroservice({
        transport: microservices_1.Transport.NATS,
        options: {
            servers: [configService.get('NATS_URL')],
            queue: 'auth_queue',
        },
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Auth Service API')
        .setDescription('The Authentication and Authorization API for Church Planner')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.startAllMicroservices();
    const port = configService.get('PORT', 3001);
    await app.listen(port);
    console.log(`Auth Service is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map
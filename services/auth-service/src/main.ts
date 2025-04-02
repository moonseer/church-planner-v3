import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the main HTTP application
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix('api');

  // Connect to NATS for microservice communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [configService.get('NATS_URL')],
      queue: 'auth_queue',
    },
  });

  // Setup Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('The Authentication and Authorization API for Church Planner')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start microservices
  await app.startAllMicroservices();
  
  // Start HTTP server
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  
  console.log(`Auth Service is running on: ${await app.getUrl()}`);
}

bootstrap(); 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { GrpcConfig } from 'src/config/grpc.config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap', { timestamp: true });

  // Graceful shutdown
  app.enableShutdownHooks();

  // Apply validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw an error when non-whitelisted properties are encountered
      transform: true, // Automatically transform payloads to the correct DTO instances
    }),
  );

  // Retrieve the configuration
  const configService = app.get(ConfigService);
  const gRpcConfig = configService.get<GrpcConfig>('grpc');

  // Create a microservice using the configuration
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: gRpcConfig.url,
      package: gRpcConfig.package,
      protoPath: gRpcConfig.protoPath,
    },
  });

  // Start the service
  await app.startAllMicroservices();
  logger.log(`User service is running on ${gRpcConfig.url}`);
}
bootstrap();

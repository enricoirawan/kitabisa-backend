import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Apply cookie parser
  app.use(cookieParser());
  // Enable CORS

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.getOrThrow('FRONT_END_URL'),
    credentials: true,
  });

  // Get port from .env
  const port = configService.getOrThrow('PORT');
  // Run app
  await app.listen(port);
}
bootstrap();

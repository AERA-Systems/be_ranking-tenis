import 'reflect-metadata';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const defaultCorsOrigins = [
    'https://api-ranking.ribeirosistemas.com',
    'https://rankingfeminino.ribeirosistemas.com',
    'http://localhost:4200'
  ];
  const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/;
  const privateNetworkOriginPattern = /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/;

  const corsOrigins = Array.from(
    new Set([
    ...defaultCorsOrigins,
    ...(process.env.CORS_ORIGIN?.split(',')
      .map((item) => item.trim().replace(/\/$/, ''))
      .filter(Boolean) ?? []),
    ]),
  );

  app.use(cookieParser());
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const normalizedOrigin = origin?.replace(/\/$/, '');

      if (
        !normalizedOrigin ||
        corsOrigins.includes(normalizedOrigin) ||
        localDevOriginPattern.test(normalizedOrigin) ||
        privateNetworkOriginPattern.test(normalizedOrigin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ranking Tenis API')
    .setDescription('API de ranking de tenis em NestJS')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3333);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://${host}:${port}`);
}

bootstrap();

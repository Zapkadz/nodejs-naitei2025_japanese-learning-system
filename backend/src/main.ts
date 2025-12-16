import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { validateEnv } from './config/env.validation';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// Validate environment variables on application startup (and reuse it)
const env = validateEnv();

const logger = new Logger('Bootstrap');

function parseCommaList(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isLocalDevOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);

    // Avoid hardcoded IP literals in source; allow localhost dev only.
    // If you need IP-based origins, configure them via FRONTEND_ORIGINS env.
    return url.hostname === 'localhost' || url.hostname.endsWith('.localhost');
  } catch (err) {
    // C029: log exception in catch block
    logger.warn(`Invalid Origin header: "${origin}"`, err as Error);
    return false;
  }
}

async function startApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const apiPrefix = process.env.API_PREFIX?.trim() || 'api';
  const allowedOrigins = parseCommaList(process.env.FRONTEND_ORIGINS);

  app.enableCors({
    origin: (origin, callback) => {
      // non-browser clients may not send Origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // In non-production, allow localhost dev origins by hostname check
      if (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix(apiPrefix);

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: `/${apiPrefix}/uploads/`,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(
          validationErrors.map((error) => ({
            [error.property]: Object.values(error.constraints ?? {})[0],
          })),
        );
      },
    }),
  );

  await app.listen(env.PORT);
}
void startApp();

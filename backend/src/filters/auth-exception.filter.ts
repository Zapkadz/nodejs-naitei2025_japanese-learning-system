import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { RateLimitGuard } from '../guards/rate-limit.guard';

@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  catch(exception: UnauthorizedException, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest();
    const url = request.url;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const method = request.method;

    // Only record failed attempts for login endpoint
    if (url.includes('/login')) {
      try {
        const rateLimitGuard = this.moduleRef.get(RateLimitGuard, { strict: false });
        if (rateLimitGuard) {
          rateLimitGuard.recordFailedAttempt(host);
        }
      } catch (error) {
        // Log error with context information for debugging
        this.logger.error(
          `Failed to get RateLimitGuard for login endpoint. IP: ${ip}, URL: ${url}, Method: ${method}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    throw exception;
  }
}


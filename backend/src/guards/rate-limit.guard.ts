import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly attempts = new Map<string, RateLimitEntry>();
  private readonly maxAttempts = 5; // Maximum attempts per window
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes in milliseconds

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const now = Date.now();

    // Clean up expired entries
    this.cleanupExpiredEntries(now);

    const entry = this.attempts.get(ip);

    if (!entry) {
      // No previous failed attempts, allow through
      return true;
    }

    if (now > entry.resetTime) {
      // Window expired, reset and allow through
      this.attempts.delete(ip);
      return true;
    }

    if (entry.count >= this.maxAttempts) {
      // Rate limit exceeded
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000 / 60);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many login attempts. Please try again after ${remainingTime} minute(s).`,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Allow through, failed attempts will be recorded by exception filter
    return true;
  }

  // Record a failed login attempt
  recordFailedAttempt(context: ExecutionContext | ArgumentsHost): void {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const entry = this.attempts.get(ip);

    if (entry) {
      entry.count++;
    } else {
      // Create new entry for first failed attempt
      const now = Date.now();
      this.attempts.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    }
  }

  // Reset attempts for successful login
  resetAttempts(context: ExecutionContext | ArgumentsHost): void {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    this.attempts.delete(ip);
  }

  private getClientIp(request: any): string {
    return (
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      'unknown'
    );
  }

  private cleanupExpiredEntries(now: number): void {
    for (const [ip, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(ip);
      }
    }
  }
}


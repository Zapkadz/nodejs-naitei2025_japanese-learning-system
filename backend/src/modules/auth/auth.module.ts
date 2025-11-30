import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/passport/jwt.strategy';
import { LocalStrategy } from 'src/passport/local.strategy';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { validateEnv } from 'src/config/env.validation';
import { RateLimitGuard } from 'src/guards/rate-limit.guard';
import { APP_FILTER } from '@nestjs/core';
import { AuthExceptionFilter } from 'src/filters/auth-exception.filter';

// Validate environment variables on module load
const env = validateEnv();

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    RateLimitGuard,
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
  ],
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}

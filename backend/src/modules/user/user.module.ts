import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { validateEnv } from 'src/config/env.validation';
import { TestAttempt } from 'src/entities/test_attempts.entity';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const env = validateEnv();

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([User, TestAttempt]),
    JwtModule.register({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  exports: [UserService],
})
export class UserModule {}

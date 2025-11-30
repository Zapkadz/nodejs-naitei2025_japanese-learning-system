import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { validateEnv } from 'src/config/env.validation';

import * as dotenv from 'dotenv';
dotenv.config();

// Validate environment variables on module load
const env = validateEnv();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
    });
  }

  validate(payload: { email: string; sub: number }): {
    userId: number;
    email: string;
  } {
    return { userId: payload.sub, email: payload.email };
  }
}

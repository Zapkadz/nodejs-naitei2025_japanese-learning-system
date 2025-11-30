import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { validateEnv } from 'src/config/env.validation';

@Injectable()
export class AuthService {
  private readonly env = validateEnv();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(user: {
    email: string;
    id: number;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id };
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.env.JWT_SECRET,
      expiresIn: '7d',
    });
    await this.userService.saveRefreshToken(user.id, refreshToken);
    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: refreshToken,
    };
  }
}

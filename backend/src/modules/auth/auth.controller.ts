import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { UserResponseDto } from '../user/dto/user-reponse.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { User } from 'src/entities/users.entity';
import { RateLimitGuard } from 'src/guards/rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly rateLimitGuard: RateLimitGuard,
  ) {}

  @UseGuards(RateLimitGuard, LocalAuthGuard)
  @Post('/login')
  async loginUser(
    @Request() request: any,
  ): Promise<{ user: UserResponseDto | null }> {
    const tokens = await this.authService.loginUser(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.user as { email: string; id: number },
    );
    const accessToken = tokens.accessToken;
    // Reset rate limit on successful login
    this.rateLimitGuard.resetAttempts({ switchToHttp: () => ({ getRequest: () => request }) } as any);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return this.userService.buildUserResponse(request.user, accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getProfile(
    @Request() request: any,
  ): Promise<{ user: UserResponseDto | null }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const email = request.user.email;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const token = request.headers.authorization?.split(' ')[1];
    const user = await this.userService.findByEmail(email as string);
    return this.userService.buildUserResponse(user as User, token as string);
  }
}

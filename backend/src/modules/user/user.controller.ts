import {
  Body,
  Controller,
  Patch,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-reponse.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/entities/users.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import sharp from 'sharp';

@Controller('user/')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ user: UserResponseDto | null }> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUserProfile(
    @Body() dataUser: UpdateUserDto,
    @Request() request: any,
  ): Promise<{ user: UserResponseDto | null }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = request.user.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const token = request.headers.authorization?.split(' ')[1];

    if (!dataUser.currentPassword) {
      throw new ForbiddenException(
        'Current password is required for profile updates',
      );
    }

    const isValidPassword = await this.userService.validateCurrentPassword(
      userId as number,
      dataUser.currentPassword,
    );

    if (!isValidPassword) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const user = await this.userService.updateProfile(
      userId as number,
      dataUser,
    );
    return this.userService.buildUserResponse(user as User, token as string);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException('Only JPG/PNG files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const buffer: Buffer = await sharp(file.buffer)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .resize(300, 300)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .png({ quality: 80 })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .toBuffer();

    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const updatedUser = await this.userService.updateProfile(userId, {
      image: base64Image,
    });

    return {
      user: {
        email: updatedUser?.email,
        full_name: updatedUser?.full_name,
        image: updatedUser?.image,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('weekly-activity')
  getWeeklyActivity(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as number;
    return this.userService.getWeeklyActivity(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllUsersByAdmin(@Request() req, @Query('query') query?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const adminId = req.user.userId as number;

    const rawUsers = await this.userService.getAllUsersByKeySearch(
      adminId,
      query,
    );

    return this.userService.buildUsersResponse(rawUsers);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:testId/completed-attempts')
  async getCompletedAttempts(
    @Param('testId') testId: number,
    @Request() request: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const adminId = request.user.userId as number;
    const attempts = await this.userService.getCompletedAttemptsByTest(
      adminId,
      testId,
    );

    return this.userService.buildCompletedAttemptsResponse(attempts);
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Between, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserResponseDto } from './dto/user-reponse.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { TestAttempt } from 'src/entities/test_attempts.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TestAttempt)
    private readonly testAttemptRepo: Repository<TestAttempt>,
  ) {}

  buildUserResponse(user: User, token?: string): { user: UserResponseDto } {
    return {
      user: {
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        image: user.image,
        token: token ?? undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  buildUsersResponse(users: User[]): { users: UserResponseDto[] } {
    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };
  }

  buildCompletedAttemptsResponse(attempts: TestAttempt[]) {
    return {
      attempts: attempts.map((a) => ({
        id: a.id,
        is_completed: a.is_completed,
        total_score: a.total_score,
        is_passed: a.is_passed,
        started_at: a.started_at,
        completed_at: a.completed_at,
        user: {
          id: a.user.id,
          full_name: a.user.full_name,
          email: a.user.email,
          image: a.user.image,
        },
      })),
    };
  }

  async createUser(data: CreateUserDto): Promise<User> {
    // Check password & confirm
    if (data.password !== data.confirm_password) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirm_password, ...userData } = data;
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
    }

    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.findByEmail(email);
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return user;
      }
    }
    return null;
  }

  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Uset not found');
    }
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refresh_token = hashedRefreshToken;
    await this.userRepository.save(user);
  }

  async validateCurrentPassword(
    userId: number,
    currentPassword: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user || !user.password) {
      return false;
    }

    return bcrypt.compare(currentPassword, user.password);
  }

  async updateProfile(
    userId: number,
    dataUser: Partial<User> & { currentPassword?: string },
  ): Promise<Partial<User> | null> {
    // Remove currentPassword from update data (it's only for validation)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentPassword, ...updateData } = dataUser;

    // Hash new password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.userRepository.update(userId, updateData);
    return this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'full_name', 'email', 'image', 'createdAt', 'updatedAt'],
    });
  }

  async getWeeklyActivity(userId: number) {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const attempts = await this.testAttemptRepo.find({
      where: {
        user: { id: userId },
        is_completed: true,
        completed_at: Between(sevenDaysAgo, today),
      },
    });

    // Tạo map count theo từng ngày
    const dailyCount = new Map<string, number>();

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dailyCount.set(key, 0);
    }

    attempts.forEach((att) => {
      if (!att.completed_at) return;
      const key = att.completed_at.toISOString().split('T')[0];
      dailyCount.set(key, (dailyCount.get(key) || 0) + 1);
    });

    // Build response
    const result = Array.from(dailyCount.entries()).map(([date, completed]) => {
      const day = new Date(date).toLocaleString('en-US', { weekday: 'short' });
      return {
        day, // 'Mon', 'Tue', ...
        completed, // số bài làm xong
        date, // yyyy-mm-dd
        userId,
      };
    });

    return result;
  }

  async is_admin(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.role === 'admin';
  }

  async getAllUsersByKeySearch(
    adminId: number,
    query?: string,
  ): Promise<User[]> {
    const isAdmin = await this.is_admin(adminId);
    if (!isAdmin) {
      throw new BadRequestException('Only admin can access this resource');
    }

    if (!query || query.trim() === '') {
      return this.userRepository.find({
        order: { createdAt: 'DESC' },
      });
    }

    return this.userRepository.find({
      where: [{ full_name: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
      order: { createdAt: 'DESC' },
    });
  }

  async getCompletedAttemptsByTest(adminId: number, testId: number) {
    const isAdmin = await this.is_admin(adminId);
    if (!isAdmin) {
      throw new BadRequestException('Only admin can access this resource');
    }
    const attempts = await this.testAttemptRepo.find({
      where: {
        test: { id: testId },
        is_completed: true,
      },
      relations: ['user'],
      order: { completed_at: 'DESC' },
    });

    if (!attempts || attempts.length === 0) {
      throw new NotFoundException('No attempts found');
    }

    return attempts;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserResponseDto } from './dto/user-reponse.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}

import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, Length, IsEmail } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'confirm_password'] as const),
) {
  @IsOptional()
  @Length(3, 255)
  password?: string;

  @IsOptional()
  @IsEmail()
  @Length(5, 100)
  email?: string;

  @IsOptional()
  @Length(3, 100)
  full_name?: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  @Length(3, 255)
  currentPassword?: string;
}

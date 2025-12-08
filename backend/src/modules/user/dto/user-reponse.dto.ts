export class UserResponseDto {
  id?: number;
  email: string;
  token?: string;
  full_name: string;
  role: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { validateEnv } from './env.validation';

dotenv.config();

// Validate environment variables on module load
const env = validateEnv();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      username: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
})
export class DatabaseModule {}

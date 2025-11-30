import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { Test } from '../../entities/tests.entity';

@Module({
  controllers: [TestController],
  providers: [TestService],
  imports: [TypeOrmModule.forFeature([Test])],
  exports: [TestService],
})
export class TestModule {}


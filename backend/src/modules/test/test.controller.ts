import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TestService } from './test.service';
import { Test } from '../../entities/tests.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('level') level?: string,
    @Query('year') year?: string,
  ): Promise<{ tests: Test[] }> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    const tests = await this.testService.findAll(level, yearNumber);
    return this.testService.buildTestsResponse(tests);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ test: Test }> {
    const test = await this.testService.findOne(id);
    return this.testService.buildTestResponse(test);
  }
}

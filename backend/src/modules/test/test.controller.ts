import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { TestService } from './test.service';
import { Test } from '../../entities/tests.entity';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  async findAll(
    @Query('level') level?: string,
    @Query('year') year?: string,
  ): Promise<Test[]> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.testService.findAll(level, yearNumber);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Test> {
    return this.testService.findOne(id);
  }
}


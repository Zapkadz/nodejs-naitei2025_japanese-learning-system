import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from '../../entities/tests.entity';
import { Section } from 'src/entities/sections.entity';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
  ) {}

  async findAll(
    level?: string,
    year?: number,
    skill?: string,
  ): Promise<Test[]> {
    const queryBuilder = this.testRepository.createQueryBuilder('test');

    if (level) {
      queryBuilder.andWhere('test.level = :level', { level });
    }

    if (year) {
      queryBuilder.andWhere('test.year = :year', { year });
    }

    if (skill) {
      queryBuilder.andWhere('test.skill = :skill', { skill });
    }

    queryBuilder.orderBy('test.year', 'DESC').addOrderBy('test.month', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Test> {
    const test = await this.testRepository.findOne({
      where: { id },
      relations: {
        sections: true,
      },
      order: {
        sections: { order_index: 'ASC' },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    interface SectionQuestionCount {
      sectionId: number;
      count: number;
    }

    const questionCounts = await this.testRepository.manager
      .createQueryBuilder()
      .select('section.id', 'sectionId')
      .addSelect('COUNT(question.id)', 'count')
      .from(Section, 'section')
      .leftJoin('section.parts', 'part')
      .leftJoin('part.questions', 'question')
      .where('section.testId = :testId', { testId: id })
      .groupBy('section.id')
      .getRawMany<SectionQuestionCount>();

    // Map sectionId → count
    const countMap = new Map<number, number>();
    questionCounts.forEach((row) => {
      countMap.set(Number(row.sectionId), Number(row.count));
    });

    test.sections = test.sections.map((section) => ({
      ...section,
      question_count: countMap.get(section.id) || 0,
    }));

    return test;
  }

  buildTestResponse(test: Test): { test: Test } {
    return { test };
  }

  buildTestsResponse(tests: Test[]): { tests: Test[] } {
    return { tests };
  }
}

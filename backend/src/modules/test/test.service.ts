import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from '../../entities/tests.entity';
import { Section } from '../../entities/sections.entity';
import { Part } from '../../entities/parts.entity';
import { Passage } from '../../entities/passages.entity';
import { Question } from '../../entities/questions.entity';
import { Option } from '../../entities/options.entity';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
  ) {}

  async findAll(level?: string, year?: number): Promise<Test[]> {
    const queryBuilder = this.testRepository.createQueryBuilder('test');

    if (level) {
      queryBuilder.andWhere('test.level = :level', { level });
    }

    if (year) {
      queryBuilder.andWhere('test.year = :year', { year });
    }

    queryBuilder.orderBy('test.year', 'DESC').addOrderBy('test.month', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Test> {
    const test = await this.testRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect('test.sections', 'section')
      .leftJoinAndSelect('section.parts', 'part')
      .leftJoinAndSelect('part.passages', 'passage')
      .leftJoinAndSelect('part.questions', 'question')
      .leftJoinAndSelect('passage.questions', 'passageQuestion')
      .leftJoinAndSelect('question.options', 'option')
      .leftJoinAndSelect('passageQuestion.options', 'passageOption')
      .where('test.id = :id', { id })
      .orderBy('section.order_index', 'ASC')
      .addOrderBy('part.part_number', 'ASC')
      .addOrderBy('passage.id', 'ASC')
      .addOrderBy('question.question_number', 'ASC')
      .addOrderBy('passageQuestion.question_number', 'ASC')
      .addOrderBy('option.order_index', 'ASC')
      .addOrderBy('passageOption.order_index', 'ASC')
      .getOne();

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    if (test.sections) {
      test.sections.sort((a, b) => a.order_index - b.order_index);

      test.sections.forEach((section) => {
        if (section.parts) {
          section.parts.sort((a, b) => a.part_number - b.part_number);

          section.parts.forEach((part) => {
            if (part.questions) {
              part.questions.sort(
                (a, b) => a.question_number - b.question_number,
              );

              part.questions.forEach((question) => {
                if (question.options) {
                  question.options.sort(
                    (a, b) => a.order_index - b.order_index,
                  );
                }
              });
            }

            if (part.passages) {
              part.passages.sort((a, b) => a.id - b.id);

              part.passages.forEach((passage) => {
                if (passage.questions) {
                  passage.questions.sort(
                    (a, b) => a.question_number - b.question_number,
                  );

                  passage.questions.forEach((question) => {
                    if (question.options) {
                      question.options.sort(
                        (a, b) => a.order_index - b.order_index,
                      );
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

    return test;
  }

  buildTestResponse(test: Test): { test: Test } {
    return { test };
  }

  buildTestsResponse(tests: Test[]): { tests: Test[] } {
    return { tests };
  }
}


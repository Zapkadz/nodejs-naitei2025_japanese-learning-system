// src/modules/progress/entities/section-attempt.entity.ts
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TestAttempt } from './test_attempts.entity';
import { Section } from './sections.entity';
import { UserAnswer } from './user_answers.entity';

@Entity('section_attempts')
export class SectionAttempt extends BaseEntity {
  @ManyToOne(() => TestAttempt, (t) => t.section_attempts, {
    onDelete: 'CASCADE',
  })
  test_attempt: TestAttempt;

  @ManyToOne(() => Section, { onDelete: 'CASCADE' })
  section: Section;

  @Column({ length: 20, default: 'NOT_STARTED' })
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

  @Column({ type: 'int', nullable: true })
  score?: number | null;

  @Column({ type: 'int', nullable: true })
  correct_count?: number | null;

  @Column({ type: 'int', default: 0 })
  question_count: number;

  @Column({ type: 'int', nullable: true })
  time_remaining?: number | null;

  @OneToMany(() => UserAnswer, (a) => a.section_attempt)
  answers: UserAnswer[];
}

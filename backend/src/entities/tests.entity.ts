// src/modules/tests/entities/test.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { Section } from './sections.entity';
import { TestAttempt } from './test_attempts.entity';

@Entity('tests')
export class Test extends BaseEntity {
  @Column({ length: 50 })
  title: string;

  @Column({ length: 3 })
  level: string; // N3

  @Column()
  year: number;

  @Column()
  month: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 10, default: 'all' })
  skill: string; // all, goi, bun, dokkai, choukai

  @OneToMany(() => Section, (section) => section.test)
  sections: Section[];

  @OneToMany(() => TestAttempt, (attempt) => attempt.test)
  attempts: TestAttempt[];
}

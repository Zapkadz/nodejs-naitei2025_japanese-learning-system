export class QuestionStatDto {
  questionNumber: number;
  correctCount: number;
  totalCount: number;
  correctRate: number;
}

export class SectionStatDto {
  sectionName: string;
  sectionTotalQuestion: number;
  questions: QuestionStatDto[];
}

export class TestStatisticsResponseDto {
  testId: number;
  sections: SectionStatDto[];
}

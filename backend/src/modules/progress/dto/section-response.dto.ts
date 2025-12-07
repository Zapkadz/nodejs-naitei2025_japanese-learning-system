// DTO for Section Response with full details
export class OptionResponseDto {
  id: number;
  content: string;
  order_index: number;
}

export class QuestionResponseDto {
  id: number;
  question_number: number;
  content?: string;
  image_url?: string;
  audio_url?: string;
  explanation?: string;
  passage_id?: number | null;
  options: OptionResponseDto[];
}

export class PassageResponseDto {
  id: number;
  title?: string;
  content?: string;
  image_url?: string;
}

export class PartResponseDto {
  id: number;
  part_number: number;
  title?: string;
  passages: PassageResponseDto[];
  questions: QuestionResponseDto[];
}

export class SectionResponseDto {
  id: number;
  name: string;
  audio_url?: string;
  time_limit: number;
  order_index: number;
  parts: PartResponseDto[];
}


import type {
  ITest,
  ITestDetail,
  TestFilter,
  ISubmission,
  IResult,
  ITestAttempt,
  ISectionAttemptWithDetails,
  IAuthResponse,
  ILoginCredentials,
  IRegisterData,
  IUser,
  ISectionAttempt,
  IQuestionResult,
  IPasswordChange,
  IWeeklyActivity,
  IActivityHeatmapDay,
} from '../types';
import type { IDataService } from './IDataService';

export class MockDataService implements IDataService {
  private currentUser: IUser | null = null;
  private testAttempts: Map<number, ITestAttempt> = new Map();
  private sectionAttempts: Map<number, ISectionAttempt> = new Map();
  private userAnswers: Map<number, Map<number, { selected_option_id: number | null; is_marked: boolean }>> = new Map();
  private testAttemptIdCounter = 1;
  private sectionAttemptIdCounter = 1;

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Test Attempt 1: COMPLETED (2 days ago)
    const testAttempt1Date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    
    this.testAttempts.set(1, {
      id: 1,
      user_id: 1,
      test_id: 1,
      test_title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N3 2023年7月',
      level: 'N3',
      is_completed: true,
      is_passed: true,
      total_score: 85,
      started_at: testAttempt1Date.toISOString(),
      completed_at: new Date(testAttempt1Date.getTime() + 200 * 60 * 1000).toISOString(),
      section_attempts: [],
    });

    // Section attempts for test attempt 1
    this.sectionAttempts.set(1, {
      id: 1,
      test_attempt_id: 1,
      section_id: 1,
      status: 'COMPLETED',
      score: 83,
      correct_count: 5,
      question_count: 6,
      time_remaining: 0,
      created_at: testAttempt1Date.toISOString(),
      updated_at: new Date(testAttempt1Date.getTime() + 45 * 60 * 1000).toISOString(),
    });

    // Add mock answers for section attempt 1 (6 questions)
    const attempt1Answers = new Map<number, { selected_option_id: number | null; is_marked: boolean }>();
    attempt1Answers.set(1, { selected_option_id: 2, is_marked: false }); // Correct
    attempt1Answers.set(2, { selected_option_id: 5, is_marked: false }); // Correct
    attempt1Answers.set(3, { selected_option_id: 10, is_marked: false }); // Wrong (correct is 9)
    attempt1Answers.set(4, { selected_option_id: 14, is_marked: false }); // Correct
    attempt1Answers.set(5, { selected_option_id: 17, is_marked: false }); // Correct
    attempt1Answers.set(6, { selected_option_id: 23, is_marked: false }); // Wrong (correct is 21)
    this.userAnswers.set(1, attempt1Answers);

    this.sectionAttempts.set(2, {
      id: 2,
      test_attempt_id: 1,
      section_id: 2,
      status: 'COMPLETED',
      score: 75,
      correct_count: 3,
      question_count: 4,
      time_remaining: 0,
      created_at: testAttempt1Date.toISOString(),
      updated_at: new Date(testAttempt1Date.getTime() + 115 * 60 * 1000).toISOString(),
    });

    // Add mock answers for section attempt 2 (4 questions: 7, 8, 9, 10)
    const attempt2Answers = new Map<number, { selected_option_id: number | null; is_marked: boolean }>();
    attempt2Answers.set(7, { selected_option_id: 26, is_marked: true }); // Correct (marked)
    attempt2Answers.set(8, { selected_option_id: 30, is_marked: false }); // Correct
    attempt2Answers.set(9, { selected_option_id: 34, is_marked: true }); // Correct (marked)
    attempt2Answers.set(10, { selected_option_id: 37, is_marked: false }); // Wrong (correct is 38)
    this.userAnswers.set(2, attempt2Answers);

    this.sectionAttempts.set(3, {
      id: 3,
      test_attempt_id: 1,
      section_id: 3,
      status: 'COMPLETED',
      score: 100,
      correct_count: 2,
      question_count: 2,
      time_remaining: 0,
      created_at: testAttempt1Date.toISOString(),
      updated_at: new Date(testAttempt1Date.getTime() + 155 * 60 * 1000).toISOString(),
    });

    // Add mock answers for section attempt 3 (2 questions: 11, 12)
    const attempt3Answers = new Map<number, { selected_option_id: number | null; is_marked: boolean }>();
    attempt3Answers.set(11, { selected_option_id: 41, is_marked: false }); // Correct
    attempt3Answers.set(12, { selected_option_id: 46, is_marked: false }); // Correct
    this.userAnswers.set(3, attempt3Answers);

    // Test Attempt 2: NOT COMPLETED - Section 1 done, Section 2 paused, Section 3 not started (1 day ago)
    const testAttempt2Date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    
    this.testAttempts.set(2, {
      id: 2,
      user_id: 1,
      test_id: 1,
      test_title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N3 2023年7月',
      level: 'N3',
      is_completed: false,
      is_passed: null,
      total_score: null,
      started_at: testAttempt2Date.toISOString(),
      completed_at: null,
      section_attempts: [],
    });

    // Section 1: COMPLETED
    this.sectionAttempts.set(4, {
      id: 4,
      test_attempt_id: 2,
      section_id: 1,
      status: 'COMPLETED',
      score: 83,
      correct_count: 5,
      question_count: 6,
      time_remaining: 0,
      created_at: testAttempt2Date.toISOString(),
      updated_at: new Date(testAttempt2Date.getTime() + 42 * 60 * 1000).toISOString(),
    });

    // Section 2: PAUSED (in progress but stopped)
    this.sectionAttempts.set(5, {
      id: 5,
      test_attempt_id: 2,
      section_id: 2,
      status: 'PAUSED',
      score: null,
      correct_count: null,
      question_count: 4,
      time_remaining: 20 * 60,
      created_at: testAttempt2Date.toISOString(),
      updated_at: new Date(testAttempt2Date.getTime() + 50 * 60 * 1000).toISOString(),
    });

    // Section 3: NOT_STARTED
    this.sectionAttempts.set(6, {
      id: 6,
      test_attempt_id: 2,
      section_id: 3,
      status: 'NOT_STARTED',
      score: null,
      correct_count: null,
      question_count: 2,
      time_remaining: 40 * 60,
      created_at: testAttempt2Date.toISOString(),
      updated_at: testAttempt2Date.toISOString(),
    });

    // Test Attempt 3: NOT COMPLETED - Only section 1 started (3 days ago)
    const testAttempt3Date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    this.testAttempts.set(3, {
      id: 3,
      user_id: 1,
      test_id: 1,
      test_title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N3 2023年7月',
      level: 'N3',
      is_completed: false,
      is_passed: null,
      total_score: null,
      started_at: testAttempt3Date.toISOString(),
      completed_at: null,
      section_attempts: [],
    });

    // Section 1: IN_PROGRESS
    this.sectionAttempts.set(7, {
      id: 7,
      test_attempt_id: 3,
      section_id: 1,
      status: 'IN_PROGRESS',
      score: null,
      correct_count: null,
      question_count: 6,
      time_remaining: 15 * 60,
      created_at: testAttempt3Date.toISOString(),
      updated_at: testAttempt3Date.toISOString(),
    });

    // Section 2: NOT_STARTED
    this.sectionAttempts.set(8, {
      id: 8,
      test_attempt_id: 3,
      section_id: 2,
      status: 'NOT_STARTED',
      score: null,
      correct_count: null,
      question_count: 4,
      time_remaining: 70 * 60,
      created_at: testAttempt3Date.toISOString(),
      updated_at: testAttempt3Date.toISOString(),
    });

    // Section 3: NOT_STARTED
    this.sectionAttempts.set(9, {
      id: 9,
      test_attempt_id: 3,
      section_id: 3,
      status: 'NOT_STARTED',
      score: null,
      correct_count: null,
      question_count: 2,
      time_remaining: 40 * 60,
      created_at: testAttempt3Date.toISOString(),
      updated_at: testAttempt3Date.toISOString(),
    });

    this.testAttemptIdCounter = 4;
    this.sectionAttemptIdCounter = 10;
  }

  // ============================================================================
  // Mock Test Data
  // ============================================================================

  private mockTests: ITest[] = [
    {
      id: 1,
      title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N3 2023年7月',
      level: 'N3',
      year: 2023,
      month: 7,
      is_active: true,
      is_attempted: true,
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2023-06-01T00:00:00Z',
    },
    {
      id: 2,
      title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N3 2023年12月',
      level: 'N3',
      year: 2023,
      month: 12,
      is_active: true,
      is_attempted: false,
      created_at: '2023-11-01T00:00:00Z',
      updated_at: '2023-11-01T00:00:00Z',
    },
      {
      id: 3,
      title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N3 2024年7月',
      level: 'N3',
      year: 2024,
      month: 7,
      is_active: true,
      is_attempted: false,
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
    },
    {
      id: 4,
      title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N2 2024年12月',
      level: 'N2',
      year: 2024,
      month: 12,
      is_active: true,
      is_attempted: false,
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2024-11-01T00:00:00Z',
    },
    {
      id: 6,
      title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N4 2024年12月',
      level: 'N4',
      year: 2024,
      month: 12,
      is_active: true,
      is_attempted: false,
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2024-11-01T00:00:00Z',
    },
       {
      id: 7,
      title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N5 2024年12月',
      level: 'N5',
      year: 2024,
      month: 12,
      is_active: true,
      is_attempted: false,
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2024-11-01T00:00:00Z',
    },
          {
      id: 8,
      title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N1 2024年12月',
      level: 'N1',
      year: 2024,
      month: 12,
      is_active: true,
      is_attempted: false,
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2024-11-01T00:00:00Z',
    },
  ];

  private mockTestDetail: ITestDetail = {
    id: 1,
    title: '<ruby>日本語<rt>にほんご</rt></ruby>能力<ruby>試験<rt>しけん</rt></ruby> N3 2023年7月',
    level: 'N3',
    year: 2023,
    month: 7,
    is_active: true,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z',
    sections: [
      {
        id: 1,
        test_id: 1,
        name: '<ruby>言語<rt>げんご</rt></ruby>知識（<ruby>文字<rt>もじ</rt></ruby>・<ruby>語彙<rt>ごい</rt></ruby>）',
        audio_url: null,
        time_limit: 30,
        order_index: 1,
        parts: [
          {
            id: 1,
            section_id: 1,
            part_number: 1,
            title: '<ruby>問題<rt>もんだい</rt></ruby>1：___の<ruby>言葉<rt>ことば</rt></ruby>の<ruby>読<rt>よ</rt></ruby>み<ruby>方<rt>かた</rt></ruby>として最もよいものを、1・2・3・4から一つ<ruby>選<rt>えら</rt></ruby>びなさい。',
            questions: [
              {
                id: 1,
                part_id: 1,
                passage_id: null,
                question_number: 1,
                content: '<ruby>彼<rt>かれ</rt></ruby>は<u>困難</u>な<ruby>状況<rt>じょうきょう</rt></ruby>でも<ruby>頑張<rt>がんば</rt></ruby>った。',
                image_url: null,
                audio_url: null,
                explanation: '「困難」は「こんなん」と読みます。「難しい状況」という意味です。',
                options: [
                  { id: 1, question_id: 1, content: 'こまん', order_index: 1, is_correct: false },
                  { id: 2, question_id: 1, content: 'こんなん', order_index: 2, is_correct: true },
                  { id: 3, question_id: 1, content: 'こうなん', order_index: 3, is_correct: false },
                  { id: 4, question_id: 1, content: 'くんなん', order_index: 4, is_correct: false },
                ],
              },
              {
                id: 2,
                part_id: 1,
                passage_id: null,
                question_number: 2,
                content: 'この<ruby>資料<rt>しりょう</rt></ruby>を<u>保存</u>してください。',
                image_url: null,
                audio_url: null,
                explanation: '「保存」は「ほぞん」と読みます。',
                options: [
                  { id: 5, question_id: 2, content: 'ほぞん', order_index: 1, is_correct: true },
                  { id: 6, question_id: 2, content: 'ほうぞん', order_index: 2, is_correct: false },
                  { id: 7, question_id: 2, content: 'ほそん', order_index: 3, is_correct: false },
                  { id: 8, question_id: 2, content: 'ほうそん', order_index: 4, is_correct: false },
                ],
              },
              {
                id: 3,
                part_id: 1,
                passage_id: null,
                question_number: 3,
                content: '<ruby>明日<rt>あした</rt></ruby>の<ruby>会議<rt>かいぎ</rt></ruby>の<u>議題</u>を<ruby>確認<rt>かくにん</rt></ruby>してください。',
                image_url: null,
                audio_url: null,
                explanation: '「議題」は「ぎだい」と読みます。',
                options: [
                  { id: 9, question_id: 3, content: 'ぎだい', order_index: 1, is_correct: true },
                  { id: 10, question_id: 3, content: 'きだい', order_index: 2, is_correct: false },
                  { id: 11, question_id: 3, content: 'ぎたい', order_index: 3, is_correct: false },
                  { id: 12, question_id: 3, content: 'きたい', order_index: 4, is_correct: false },
                ],
              },
            ],
          },
          {
            id: 2,
            section_id: 1,
            part_number: 2,
            title: '<ruby>問題<rt>もんだい</rt></ruby>2：___の<ruby>言葉<rt>ことば</rt></ruby>を<ruby>漢字<rt>かんじ</rt></ruby>で<ruby>書<rt>か</rt></ruby>くとき、最もよいものを、1・2・3・4から一つ<ruby>選<rt>えら</rt></ruby>びなさい。',
            questions: [
              {
                id: 4,
                part_id: 2,
                passage_id: null,
                question_number: 4,
                content: '<ruby>彼女<rt>かのじょ</rt></ruby>は<u>せいかく</u>な<ruby>性格<rt>せいかく</rt></ruby>だ。',
                image_url: null,
                audio_url: null,
                explanation: '「せいかく」は「性格」と書きます。',
                options: [
                  { id: 13, question_id: 4, content: '正確', order_index: 1, is_correct: false },
                  { id: 14, question_id: 4, content: '性格', order_index: 2, is_correct: true },
                  { id: 15, question_id: 4, content: '制格', order_index: 3, is_correct: false },
                  { id: 16, question_id: 4, content: '清確', order_index: 4, is_correct: false },
                ],
              },
              {
                id: 5,
                part_id: 2,
                passage_id: null,
                question_number: 5,
                content: '<ruby>新<rt>あたら</rt></ruby>しい<ruby>方法<rt>ほうほう</rt></ruby>を<u>ていあん</u>します。',
                image_url: null,
                audio_url: null,
                explanation: '「ていあん」は「提案」と書きます。',
                options: [
                  { id: 17, question_id: 5, content: '提案', order_index: 1, is_correct: true },
                  { id: 18, question_id: 5, content: '定案', order_index: 2, is_correct: false },
                  { id: 19, question_id: 5, content: '程案', order_index: 3, is_correct: false },
                  { id: 20, question_id: 5, content: '底案', order_index: 4, is_correct: false },
                ],
              },
            ],
          },
          {
            id: 3,
            section_id: 1,
            part_number: 3,
            title: '<ruby>問題<rt>もんだい</rt></ruby>3：(  )に<ruby>入<rt>はい</rt></ruby>る最もよいものを、1・2・3・4から一つ<ruby>選<rt>えら</rt></ruby>びなさい。',
            questions: [
              {
                id: 6,
                part_id: 3,
                passage_id: null,
                question_number: 6,
                content: '<ruby>彼<rt>かれ</rt></ruby>は<ruby>毎日<rt>まいにち</rt></ruby><ruby>遅<rt>おそ</rt></ruby>くまで(  )<ruby>働<rt>はたら</rt></ruby>いている。',
                image_url: null,
                audio_url: null,
                explanation: '「一生懸命」は「とても頑張って」という意味です。',
                options: [
                  { id: 21, question_id: 6, content: '一生懸命', order_index: 1, is_correct: true },
                  { id: 22, question_id: 6, content: '一所懸命', order_index: 2, is_correct: false },
                  { id: 23, question_id: 6, content: '一心不乱', order_index: 3, is_correct: false },
                  { id: 24, question_id: 6, content: '一生無事', order_index: 4, is_correct: false },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 2,
        test_id: 1,
        name: '<ruby>言語<rt>げんご</rt></ruby>知識（<ruby>文法<rt>ぶんぽう</rt></ruby>）・<ruby>読解<rt>どっかい</rt></ruby>',
        audio_url: null,
        time_limit: 70,
        order_index: 2,
        parts: [
          {
            id: 4,
            section_id: 2,
            part_number: 1,
            title: '<ruby>問題<rt>もんだい</rt></ruby>1：次の<ruby>文<rt>ぶん</rt></ruby>の(  )に<ruby>入<rt>はい</rt></ruby>れるのに最もよいものを、1・2・3・4から一つ<ruby>選<rt>えら</rt></ruby>びなさい。',
            questions: [
              {
                id: 7,
                part_id: 4,
                passage_id: null,
                question_number: 7,
                content: '<ruby>雨<rt>あめ</rt></ruby>が<ruby>降<rt>ふ</rt></ruby>っている(  )、<ruby>出<rt>で</rt></ruby>かけなければなりません。',
                image_url: null,
                audio_url: null,
                explanation: '「のに」は逆接の接続助詞です。',
                options: [
                  { id: 25, question_id: 7, content: 'から', order_index: 1, is_correct: false },
                  { id: 26, question_id: 7, content: 'のに', order_index: 2, is_correct: true },
                  { id: 27, question_id: 7, content: 'ので', order_index: 3, is_correct: false },
                  { id: 28, question_id: 7, content: 'けど', order_index: 4, is_correct: false },
                ],
              },
              {
                id: 8,
                part_id: 4,
                passage_id: null,
                question_number: 8,
                content: 'この<ruby>仕事<rt>しごと</rt></ruby>は<ruby>難<rt>むずか</rt></ruby>しくて、<ruby>簡単<rt>かんたん</rt></ruby>には(  )。',
                image_url: null,
                audio_url: null,
                explanation: '可能形の否定「できない」が正解です。',
                options: [
                  { id: 29, question_id: 8, content: 'できます', order_index: 1, is_correct: false },
                  { id: 30, question_id: 8, content: 'できません', order_index: 2, is_correct: true },
                  { id: 31, question_id: 8, content: 'します', order_index: 3, is_correct: false },
                  { id: 32, question_id: 8, content: 'しません', order_index: 4, is_correct: false },
                ],
              },
            ],
          },
          {
            id: 5,
            section_id: 2,
            part_number: 2,
            title: '<ruby>問題<rt>もんだい</rt></ruby>2：次の<ruby>文章<rt>ぶんしょう</rt></ruby>を<ruby>読<rt>よ</rt></ruby>んで、<ruby>質問<rt>しつもん</rt></ruby>に<ruby>答<rt>こた</rt></ruby>えなさい。',
            passage: {
              id: 1,
              part_id: 5,
              title: '<ruby>日本<rt>にほん</rt></ruby>の<ruby>伝統的<rt>でんとうてき</rt></ruby>な<ruby>文化<rt>ぶんか</rt></ruby>',
              content: '<p><ruby>日本<rt>にほん</rt></ruby>には<ruby>長<rt>なが</rt></ruby>い<ruby>歴史<rt>れきし</rt></ruby>を<ruby>持<rt>も</rt></ruby>つ<ruby>伝統的<rt>でんとうてき</rt></ruby>な<ruby>文化<rt>ぶんか</rt></ruby>がたくさんあります。<ruby>茶道<rt>さどう</rt></ruby>、<ruby>華道<rt>かどう</rt></ruby>、<ruby>書道<rt>しょどう</rt></ruby>などの<ruby>芸術<rt>げいじゅつ</rt></ruby>は、<ruby>現代<rt>げんだい</rt></ruby>でも<ruby>多<rt>おお</rt></ruby>くの<ruby>人々<rt>ひとびと</rt></ruby>に<ruby>愛<rt>あい</rt></ruby>されています。</p><p>また、<ruby>和服<rt>わふく</rt></ruby>や<ruby>和食<rt>わしょく</rt></ruby>も<ruby>日本<rt>にほん</rt></ruby>の<ruby>大切<rt>たいせつ</rt></ruby>な<ruby>文化遺産<rt>ぶんかいさん</rt></ruby>です。<ruby>特<rt>とく</rt></ruby>に<ruby>和食<rt>わしょく</rt></ruby>は2013<ruby>年<rt>ねん</rt></ruby>にユネスコの<ruby>無形文化遺産<rt>むけいぶんかいさん</rt></ruby>に<ruby>登録<rt>とうろく</rt></ruby>されました。これらの<ruby>文化<rt>ぶんか</rt></ruby>を<ruby>次<rt>つぎ</rt></ruby>の<ruby>世代<rt>せだい</rt></ruby>に<ruby>伝<rt>つた</rt></ruby>えていくことが<ruby>重要<rt>じゅうよう</rt></ruby>です。</p>',
              image_url: null,
            },
            questions: [
              {
                id: 9,
                part_id: 5,
                passage_id: 1,
                question_number: 9,
                content: '<ruby>文章<rt>ぶんしょう</rt></ruby>によると、<ruby>日本<rt>にほん</rt></ruby>の<ruby>伝統的<rt>でんとうてき</rt></ruby>な<ruby>芸術<rt>げいじゅつ</rt></ruby>には<ruby>何<rt>なに</rt></ruby>がありますか。',
                image_url: null,
                audio_url: null,
                explanation: '文章では、茶道、華道、書道が伝統的な芸術として挙げられています。',
                options: [
                  { id: 33, question_id: 9, content: '<ruby>茶道<rt>さどう</rt></ruby>、<ruby>華道<rt>かどう</rt></ruby>、<ruby>書道<rt>しょどう</rt></ruby>', order_index: 1, is_correct: true },
                  { id: 34, question_id: 9, content: '<ruby>柔道<rt>じゅうどう</rt></ruby>、<ruby>剣道<rt>けんどう</rt></ruby>、<ruby>空手<rt>からて</rt></ruby>', order_index: 2, is_correct: false },
                  { id: 35, question_id: 9, content: '<ruby>絵画<rt>かいが</rt></ruby>、<ruby>彫刻<rt>ちょうこく</rt></ruby>、<ruby>音楽<rt>おんがく</rt></ruby>', order_index: 3, is_correct: false },
                  { id: 36, question_id: 9, content: '<ruby>演劇<rt>えんげき</rt></ruby>、<ruby>舞踊<rt>ぶよう</rt></ruby>、<ruby>歌舞伎<rt>かぶき</rt></ruby>', order_index: 4, is_correct: false },
                ],
              },
              {
                id: 10,
                part_id: 5,
                passage_id: 1,
                question_number: 10,
                content: '<ruby>和食<rt>わしょく</rt></ruby>がユネスコの<ruby>無形文化遺産<rt>むけいぶんかいさん</rt></ruby>に<ruby>登録<rt>とうろく</rt></ruby>されたのは<ruby>何年<rt>なんねん</rt></ruby>ですか。',
                image_url: null,
                audio_url: null,
                explanation: '文章では、和食が2013年に無形文化遺産に登録されたと書かれています。',
                options: [
                  { id: 37, question_id: 10, content: '2011<ruby>年<rt>ねん</rt></ruby>', order_index: 1, is_correct: false },
                  { id: 38, question_id: 10, content: '2013<ruby>年<rt>ねん</rt></ruby>', order_index: 2, is_correct: true },
                  { id: 39, question_id: 10, content: '2015<ruby>年<rt>ねん</rt></ruby>', order_index: 3, is_correct: false },
                  { id: 40, question_id: 10, content: '<ruby>仕事<rt>しごと</rt></ruby>の<ruby>効率<rt>こうりつ</rt></ruby>', order_index: 4, is_correct: false },
                ],
              },
            ],
          },
          {
            id: 51,
            section_id: 2,
            part_number: 3,
            title: '<ruby>問題<rt>もんだい</rt></ruby>3：次の<ruby>図<rt>ず</rt></ruby>を<ruby>見<rt>み</rt></ruby>て、<ruby>質問<rt>しつもん</rt></ruby>に<ruby>答<rt>こた</rt></ruby>えなさい。',
            passage: {
              id: 2,
              part_id: 51,
              title: null,
              content: '',
              image_url: '/reading.png',
            },
            questions: [
              {
                id: 101,
                part_id: 51,
                passage_id: 2,
                question_number: 11,
                content: '<ruby>図<rt>ず</rt></ruby>によると、この<ruby>情報<rt>じょうほう</rt></ruby>は<ruby>何<rt>なに</rt></ruby>についてですか。',
                image_url: null,
                audio_url: null,
                explanation: '図には日本の伝統文化に関する情報が示されています。',
                options: [
                  { id: 401, question_id: 101, content: '<ruby>日本<rt>にほん</rt></ruby>の<ruby>伝統文化<rt>でんとうぶんか</rt></ruby>', order_index: 1, is_correct: true },
                  { id: 402, question_id: 101, content: '<ruby>現代<rt>げんだい</rt></ruby>アート', order_index: 2, is_correct: false },
                  { id: 403, question_id: 101, content: '<ruby>スポーツ<rt>すぽーつ</rt></ruby>', order_index: 3, is_correct: false },
                  { id: 404, question_id: 101, content: '<ruby>科学技術<rt>かがくぎじゅつ</rt></ruby>', order_index: 4, is_correct: false },
                ],
              },
              {
                id: 102,
                part_id: 51,
                passage_id: 2,
                question_number: 12,
                content: '<ruby>図<rt>ず</rt></ruby>から<ruby>読<rt>よ</rt></ruby>み<ruby>取<rt>と</rt></ruby>れることとして、<ruby>正<rt>ただ</rt></ruby>しいものはどれですか。',
                image_url: null,
                audio_url: null,
                explanation: '図を見て内容を理解する必要があります。',
                options: [
                  { id: 405, question_id: 102, content: '<ruby>伝統<rt>でんとう</rt></ruby>を<ruby>大切<rt>たいせつ</rt></ruby>にする<ruby>姿勢<rt>しせい</rt></ruby>が<ruby>見<rt>み</rt></ruby>られる', order_index: 1, is_correct: true },
                  { id: 406, question_id: 102, content: '<ruby>新<rt>あたら</rt></ruby>しい<ruby>技術<rt>ぎじゅつ</rt></ruby>だけが<ruby>重要<rt>じゅうよう</rt></ruby>である', order_index: 2, is_correct: false },
                  { id: 407, question_id: 102, content: '<ruby>外国<rt>がいこく</rt></ruby>の<ruby>文化<rt>ぶんか</rt></ruby>を<ruby>否定<rt>ひてい</rt></ruby>している', order_index: 3, is_correct: false },
                  { id: 408, question_id: 102, content: '<ruby>歴史<rt>れきし</rt></ruby>は<ruby>必要<rt>ひつよう</rt></ruby>ない', order_index: 4, is_correct: false },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 3,
        test_id: 1,
        name: '<ruby>聴解<rt>ちょうかい</rt></ruby>',
        audio_url: '/audio.mp3',
        time_limit: 40,
        order_index: 3,
        parts: [
          {
            id: 6,
            section_id: 3,
            part_number: 1,
            title: '<ruby>問題<rt>もんだい</rt></ruby>1：<ruby>課題<rt>かだい</rt></ruby>理解',
            questions: [
              {
                id: 11,
                part_id: 6,
                passage_id: null,
                question_number: 1,
                content: '<ruby>男<rt>おとこ</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>と<ruby>女<rt>おんな</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>が<ruby>話<rt>はな</rt></ruby>しています。<ruby>男<rt>おとこ</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>はこれから<ruby>何<rt>なに</rt></ruby>をしますか。',
                image_url: null,
                audio_url: null,
                explanation: '音声では、男の人が「資料をコピーしてきます」と言っています。',
                options: [
                  { id: 41, question_id: 11, content: '<ruby>資料<rt>しりょう</rt></ruby>をコピーする', order_index: 1, is_correct: true },
                  { id: 42, question_id: 11, content: '<ruby>会議室<rt>かいぎしつ</rt></ruby>を<ruby>予約<rt>よやく</rt></ruby>する', order_index: 2, is_correct: false },
                  { id: 43, question_id: 11, content: 'コーヒーを<ruby>買<rt>か</rt></ruby>う', order_index: 3, is_correct: false },
                  { id: 44, question_id: 11, content: '<ruby>電話<rt>でんわ</rt></ruby>をかける', order_index: 4, is_correct: false },
                ],
              },
              {
                id: 12,
                part_id: 6,
                passage_id: null,
                question_number: 2,
                content: '<ruby>店<rt>みせ</rt></ruby>で<ruby>店員<rt>てんいん</rt></ruby>と<ruby>客<rt>きゃく</rt></ruby>が<ruby>話<rt>はな</rt></ruby>しています。<ruby>客<rt>きゃく</rt></ruby>は<ruby>何<rt>なに</rt></ruby>を<ruby>買<rt>か</rt></ruby>いますか。',
                image_url: null,
                audio_url: null,
                explanation: '音声では、客が「青いシャツをください」と言っています。',
                options: [
                  { id: 45, question_id: 12, content: '<ruby>赤<rt>あか</rt></ruby>いシャツ', order_index: 1, is_correct: false },
                  { id: 46, question_id: 12, content: '<ruby>青<rt>あお</rt></ruby>いシャツ', order_index: 2, is_correct: true },
                  { id: 47, question_id: 12, content: '<ruby>白<rt>しろ</rt></ruby>いシャツ', order_index: 3, is_correct: false },
                  { id: 48, question_id: 12, content: '<ruby>黒<rt>くろ</rt></ruby>いシャツ', order_index: 4, is_correct: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  private mockUser: IUser = {
    id: 1,
    email: 'test@example.com',
    full_name: '<ruby>田中<rt>たなか</rt></ruby><ruby>太郎<rt>たろう</rt></ruby>',
    urlAvatar: './avatar.jpg',
    role: 'USER',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  // ============================================================================
  // Test Management
  // ============================================================================

  async getTests(filter?: TestFilter): Promise<ITest[]> {
    await this.delay(300);
    let filtered = [...this.mockTests];
    if (filter?.level) filtered = filtered.filter((test) => test.level === filter.level);
    if (filter?.year) filtered = filtered.filter((test) => test.year === filter.year);
    if (filter?.is_active !== undefined) filtered = filtered.filter((test) => test.is_active === filter.is_active);
    return filtered;
  }

  async getTestDetail(id: number): Promise<ITestDetail> {
    await this.delay(500);
    
    // For now, return the same mock test detail for all test IDs
    // In real implementation, each test would have its own structure
    const testInfo = this.mockTests.find(t => t.id === id);
    if (!testInfo) {
      throw new Error(`Test with id ${id} not found`);
    }
    
    // Return mock test detail with the correct test info
    return {
      ...this.mockTestDetail,
      id: testInfo.id,
      title: testInfo.title,
      level: testInfo.level,
      year: testInfo.year,
      month: testInfo.month,
      is_active: testInfo.is_active,
      is_attempted: testInfo.is_attempted,
      created_at: testInfo.created_at,
      updated_at: testInfo.updated_at,
    };
  }

  // ============================================================================
  // Test Attempt Management (Parent)
  // ============================================================================

  async startTestAttempt(testId: number): Promise<ITestAttempt> {
    await this.delay(300);
    
    // In real app, userId would come from JWT token
    // For mock, use hardcoded userId = 1
    const userId = 1;

    // Check if there's an incomplete test attempt for this user+test
    const existingAttempt = Array.from(this.testAttempts.values()).find(
      ta => ta.user_id === userId && ta.test_id === testId && !ta.is_completed
    );

    if (existingAttempt) {
      // Return existing incomplete attempt
      return this.getTestAttempt(existingAttempt.id);
    }

    // Create new test attempt
    const test = this.mockTests.find(t => t.id === testId);
    if (!test) throw new Error(`Test with id ${testId} not found`);

    const testAttempt: ITestAttempt = {
      id: this.testAttemptIdCounter++,
      user_id: userId,
      test_id: testId,
      test_title: test.title,
      level: test.level,
      is_completed: false,
      is_passed: null,
      total_score: null,
      started_at: new Date().toISOString(),
      completed_at: null,
      section_attempts: [],
    };

    this.testAttempts.set(testAttempt.id, testAttempt);
    return testAttempt;
  }

  async getTestAttempt(testAttemptId: number): Promise<ITestAttempt> {
    await this.delay(200);

    const testAttempt = this.testAttempts.get(testAttemptId);
    if (!testAttempt) throw new Error(`Test attempt with id ${testAttemptId} not found`);

    // Get all section attempts for this test attempt
    const sectionAttempts = Array.from(this.sectionAttempts.values())
      .filter(sa => sa.test_attempt_id === testAttemptId)
      .sort((a, b) => (a.section_id || 0) - (b.section_id || 0));

    // Enrich with section details
    const sections: ISectionAttemptWithDetails[] = sectionAttempts.map(sa => {
      const section = this.mockTestDetail.sections.find(s => s.id === sa.section_id);
      return {
        ...sa,
        section_name: section?.name || '',
        time_limit: section?.time_limit || 0,
      };
    });

    return { ...testAttempt, sections };
  }

  async getTestAttempts(testId?: number): Promise<ITestAttempt[]> {
    await this.delay(300);

    const attempts = Array.from(this.testAttempts.values())
      .filter(ta => (testId ? ta.test_id === testId : true))
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

    // Populate sections for each attempt
    const result: ITestAttempt[] = [];
    for (const attempt of attempts) {
      result.push(await this.getTestAttempt(attempt.id));
    }

    return result;
  }

  // ============================================================================
  // Section Attempt Management (Child)
  // ============================================================================

  async startSectionAttempt(testAttemptId: number, sectionId: number): Promise<ISectionAttempt> {
    await this.delay(300);

    const testAttempt = this.testAttempts.get(testAttemptId);
    if (!testAttempt) throw new Error(`Test attempt with id ${testAttemptId} not found`);

    const section = this.mockTestDetail.sections.find(s => s.id === sectionId);
    if (!section) throw new Error(`Section with id ${sectionId} not found`);

    // Check if section attempt already exists for this test attempt + section
    const existingAttempt = Array.from(this.sectionAttempts.values()).find(
      sa => sa.test_attempt_id === testAttemptId && sa.section_id === sectionId
    );

    if (existingAttempt) {
      return existingAttempt;
    }

    // Create new section attempt
    const totalQuestions = section.parts.reduce((sum, part) => sum + part.questions.length, 0);
    
    const sectionAttempt: ISectionAttempt = {
      id: this.sectionAttemptIdCounter++,
      test_attempt_id: testAttemptId,
      section_id: sectionId,
      status: 'IN_PROGRESS',
      score: null,
      correct_count: null,
      question_count: totalQuestions,
      time_remaining: section.time_limit * 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.sectionAttempts.set(sectionAttempt.id, sectionAttempt);
    this.userAnswers.set(sectionAttempt.id, new Map());

    return sectionAttempt;
  }

  async getSectionAttempt(attemptId: number): Promise<ISectionAttempt> {
    await this.delay(200);
    const attempt = this.sectionAttempts.get(attemptId);
    if (!attempt) throw new Error(`Section attempt with id ${attemptId} not found`);
    return { ...attempt };
  }

  async resumeSectionAttempt(attemptId: number): Promise<ISectionAttempt> {
    await this.delay(300);
    const attempt = this.sectionAttempts.get(attemptId);
    if (!attempt) throw new Error(`Section attempt with id ${attemptId} not found`);
    if (attempt.status !== 'PAUSED') throw new Error(`Section attempt ${attemptId} is not paused`);
    attempt.status = 'IN_PROGRESS';
    attempt.updated_at = new Date().toISOString();
    return { ...attempt };
  }

  async saveProgress(attemptId: number, timeRemaining: number): Promise<ISectionAttempt> {
    await this.delay(200);
    const attempt = this.sectionAttempts.get(attemptId);
    if (!attempt) throw new Error(`Section attempt with id ${attemptId} not found`);
    attempt.time_remaining = timeRemaining;
    attempt.status = 'PAUSED';
    attempt.updated_at = new Date().toISOString();
    return { ...attempt };
  }

  async submitAttempt(data: ISubmission): Promise<IResult> {
    await this.delay(500);

    const attempt = this.sectionAttempts.get(data.section_attempt_id);
    if (!attempt) throw new Error(`Section attempt with id ${data.section_attempt_id} not found`);

    // Store answers
    const answerMap = this.userAnswers.get(data.section_attempt_id) || new Map();
    data.answers.forEach((answer) => {
      answerMap.set(answer.question_id, {
        selected_option_id: answer.selected_option_id,
        is_marked: answer.is_marked,
      });
    });
    this.userAnswers.set(data.section_attempt_id, answerMap);

    // Calculate results
    const section = this.mockTestDetail.sections.find(s => s.id === attempt.section_id);
    if (!section) throw new Error(`Section with id ${attempt.section_id} not found`);

    const questionResults: IQuestionResult[] = [];
    let correctCount = 0;

    section.parts.forEach((part) => {
      part.questions.forEach((question) => {
        const userAnswer = answerMap.get(question.id);
        const correctOption = question.options.find((opt) => opt.is_correct);
        if (!correctOption) throw new Error(`No correct option for question ${question.id}`);

        const isCorrect = userAnswer?.selected_option_id === correctOption.id;
        if (isCorrect) correctCount++;

        questionResults.push({
          question_id: question.id,
          question_number: question.question_number,
          selected_option_id: userAnswer?.selected_option_id || null,
          correct_option_id: correctOption.id,
          is_correct: isCorrect,
          is_marked: userAnswer?.is_marked || false,
          explanation: question.explanation,
        });
      });
    });

    const totalQuestions = questionResults.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const score = percentage;

    // Update section attempt
    attempt.status = 'COMPLETED';
    attempt.score = score;
    attempt.correct_count = correctCount;
    attempt.time_remaining = data.time_remaining || 0;
    attempt.updated_at = new Date().toISOString();

    // Check if all sections are complete, update test attempt
    const testAttempt = this.testAttempts.get(attempt.test_attempt_id || 0);
    if (testAttempt) {
      const allSections = Array.from(this.sectionAttempts.values())
        .filter(sa => sa.test_attempt_id === attempt.test_attempt_id);
      
      const allCompleted = allSections.every(sa => sa.status === 'COMPLETED');
      if (allCompleted) {
        const avgScore = Math.round(
          allSections.reduce((sum, sa) => sum + (sa.score || 0), 0) / allSections.length
        );
        testAttempt.is_completed = true;
        testAttempt.total_score = avgScore;
        testAttempt.is_passed = avgScore >= 60;
        testAttempt.completed_at = new Date().toISOString();
      }
    }

    return {
      section_attempt_id: data.section_attempt_id,
      score,
      correct_count: correctCount,
      total_questions: totalQuestions,
      percentage,
      questions: questionResults,
    };
  }

  async getAttemptResult(attemptId: number): Promise<IResult> {
    await this.delay(300);

    const attempt = this.sectionAttempts.get(attemptId);
    if (!attempt || attempt.status !== 'COMPLETED') {
      throw new Error(`Completed section attempt with id ${attemptId} not found`);
    }

    const section = this.mockTestDetail.sections.find(s => s.id === attempt.section_id);
    if (!section) throw new Error(`Section with id ${attempt.section_id} not found`);

    const answerMap = this.userAnswers.get(attemptId) || new Map();
    const questionResults: IQuestionResult[] = [];

    section.parts.forEach((part) => {
      part.questions.forEach((question) => {
        const userAnswer = answerMap.get(question.id);
        const correctOption = question.options.find((opt) => opt.is_correct);
        if (!correctOption) throw new Error(`No correct option for question ${question.id}`);

        questionResults.push({
          question_id: question.id,
          question_number: question.question_number,
          selected_option_id: userAnswer?.selected_option_id || null,
          correct_option_id: correctOption.id,
          is_correct: userAnswer?.selected_option_id === correctOption.id,
          is_marked: userAnswer?.is_marked || false,
          explanation: question.explanation,
        });
      });
    });

    return {
      section_attempt_id: attemptId,
      score: attempt.score || 0,
      correct_count: attempt.correct_count || 0,
      total_questions: questionResults.length,
      percentage: attempt.score || 0,
      questions: questionResults,
    };
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    await this.delay(500);
    if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
      this.currentUser = this.mockUser;
      return { token: 'mock-jwt-token-' + Date.now(), user: this.mockUser };
    }
    throw new Error('Invalid credentials');
  }

  async getHistory(): Promise<ITestAttempt[]> {
    return this.getTestAttempts();
  }

  async register(data: IRegisterData): Promise<IAuthResponse> {
    await this.delay(500);
    const newUser: IUser = {
      id: Math.floor(Math.random() * 10000),
      email: data.email,
      full_name: data.full_name,
      urlAvatar: data.urlAvatar || null,
      role: 'USER',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.currentUser = newUser;
    return { token: 'mock-jwt-token-' + Date.now(), user: newUser };
  }

  async getCurrentUser(): Promise<IUser> {
    await this.delay(200);
    if (!this.currentUser) throw new Error('User not authenticated');
    return this.currentUser;
  }

  async logout(): Promise<void> {
    await this.delay(200);
    // Clear session data
    this.currentUser = null;
    // Clear all session tokens from storage
    localStorage.removeItem('jlpt-auth-storage');
    localStorage.removeItem('token');
  }

  // ============================================================================
  // User Profile
  // ============================================================================

  async updateUser(data: any): Promise<any> {
    await this.delay(300);
    if (!this.currentUser) throw new Error('User not authenticated');
    this.currentUser = {
      ...this.currentUser,
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.currentUser;
  }

  async changePassword(_data: IPasswordChange): Promise<void> {
    await this.delay(300);
    if (!this.currentUser) throw new Error('User not authenticated');
    // Mock implementation - just simulate delay
    console.log('Password changed successfully (mock)');
  }

  async uploadAvatar(file: any): Promise<any> {
    await this.delay(300);
    if (!this.currentUser) throw new Error('User not authenticated');
    const fileName = (file && (file.name || typeof file === 'string')) ? (file.name || file) : 'avatar.png';
    const url = `/uploads/${Date.now()}-${fileName}`;
    this.currentUser = {
      ...this.currentUser,
      urlAvatar: url,
      updated_at: new Date().toISOString(),
    };
    return this.currentUser;
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  async getUserWeeklyActivity(): Promise<IWeeklyActivity[]> {
    await this.delay(200);
    // Return empty mock data to satisfy interface; replace with real aggregation if needed
    return [];
  }

  async getUserActivityHeatmap(year?: number): Promise<IActivityHeatmapDay[]> {
    await this.delay(200);
    const targetYear = year ?? new Date().getFullYear();
    const start = new Date(targetYear, 0, 1);
    const end = new Date(targetYear, 11, 31);
    const days: IActivityHeatmapDay[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const count = Math.random() < 0.2 ? Math.floor(Math.random() * 5) : 0;
      const level: 0 | 1 | 2 | 3 | 4 =
        count === 0 ? 0 :
        count === 1 ? 1 :
        count === 2 ? 2 :
        count === 3 ? 3 : 4;
      days.push({ date: d.toISOString().slice(0, 10), count, level });
    }
    return days;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

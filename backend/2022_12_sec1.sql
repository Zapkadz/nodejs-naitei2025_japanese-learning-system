USE jlpt;
SET NAMES utf8mb4;

-- =========================================================
-- 1. TẠO ĐỀ THI VÀ SECTION (N3 12/2022)
-- =========================================================
-- Thêm Test
INSERT INTO tests (title, level, year, month, is_active, created_at, updated_at) 
VALUES ('JLPT N3 12/2022', 'N3', 2022, 12, 1, NOW(), NOW());

SET @test_id = LAST_INSERT_ID();

-- Thêm Section: Ngôn ngữ kiến thức (文字・語彙)
INSERT INTO sections (testId, name, time_limit, order_index, created_at, updated_at)
VALUES (@test_id, '言語知識（文字・語彙）', 30, 1, NOW(), NOW());

SET @sec_id = LAST_INSERT_ID();

-- =========================================================
-- 2. MONDAI 1: CÁCH ĐỌC KANJI
-- =========================================================

INSERT INTO parts (sectionId, part_number, title, created_at, updated_at)
VALUES (@sec_id, 1, '___ の言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。', NOW(), NOW());
SET @part1_id = LAST_INSERT_ID();

-- Q1: 容器 -> ようき (2)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part1_id, 1, 'この店では、いろいろな<u>容器</u>を売っています。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'ようぎ', 1, 0, NOW(), NOW()),
(@q_id, 'ようき', 2, 1, NOW(), NOW()), -- Correct
(@q_id, 'どうぐ', 3, 0, NOW(), NOW()),
(@q_id, 'どうく', 4, 0, NOW(), NOW());

-- Q2: 比べた -> くらべた (1)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part1_id, 2, '山本さんは何と何を<u>比べた</u>んですか。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'くらべた', 1, 1, NOW(), NOW()), -- Correct
(@q_id, 'ならべた', 2, 0, NOW(), NOW()),
(@q_id, 'しらべた', 3, 0, NOW(), NOW()),
(@q_id, 'えらべた', 4, 0, NOW(), NOW());

-- Q3: 複数 -> ふくすう (3)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part1_id, 3, '書類が<u>複数</u>あるので、間違えないでください。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'ふくす', 1, 0, NOW(), NOW()),
(@q_id, 'ふうすう', 2, 0, NOW(), NOW()),
(@q_id, 'ふくすう', 3, 1, NOW(), NOW()), -- Correct
(@q_id, 'ふうす', 4, 0, NOW(), NOW());

-- Q4: 血圧 -> けつあつ (1)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part1_id, 4, '昨日病院で<u>血圧</u>を計りました。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'けつあつ', 1, 1, NOW(), NOW()), -- Correct
(@q_id, 'けつやつ', 2, 0, NOW(), NOW()),
(@q_id, 'ちあつ', 3, 0, NOW(), NOW()),
(@q_id, 'ちやつ', 4, 0, NOW(), NOW());

-- Q5: 夕日 -> ゆうひ (4)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part1_id, 5, 'ここから見る<u>夕日</u>はきれいだ。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'ゆび', 1, 0, NOW(), NOW()),
(@q_id, 'ゆひ', 2, 0, NOW(), NOW()),
(@q_id, 'ゆうび', 3, 0, NOW(), NOW()),
(@q_id, 'ゆうひ', 4, 1, NOW(), NOW()); -- Correct

-- Q6: 難しい -> むずかしい (4)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part1_id, 6, 'そこに一人で行くのは<u>難しい</u>と思います。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'きびしい', 1, 0, NOW(), NOW()),
(@q_id, 'めずらしい', 2, 0, NOW(), NOW()),
(@q_id, 'さびしい', 3, 0, NOW(), NOW()),
(@q_id, 'むずかしい', 4, 1, NOW(), NOW()); -- Correct

-- Q7: 件 -> けん (3)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part1_id, 7, '中村さんから出張の<u>件</u>でお電話がありました。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'けい', 1, 0, NOW(), NOW()),
(@q_id, 'よう', 2, 0, NOW(), NOW()),
(@q_id, 'けん', 3, 1, NOW(), NOW()), -- Correct
(@q_id, 'よん', 4, 0, NOW(), NOW());

-- Q8: 横断 -> おうだん (2)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part1_id, 8, 'ここを<u>横断</u>するときは気をつけてください。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'おうざん', 1, 0, NOW(), NOW()),
(@q_id, 'おうだん', 2, 1, NOW(), NOW()), -- Correct
(@q_id, 'きだん', 3, 0, NOW(), NOW()),
(@q_id, 'きざん', 4, 0, NOW(), NOW());

-- =========================================================
-- 3. MONDAI 2: CÁCH VIẾT KANJI
-- =========================================================

INSERT INTO parts (sectionId, part_number, title, created_at, updated_at)
VALUES (@sec_id, 2, '___ のことばを漢字で書くとき、最もよいものを、1・2・3・4から一つえらびなさい。', NOW(), NOW());
SET @part2_id = LAST_INSERT_ID();

-- Q9: すった -> 吸った (3)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part2_id, 9, '車から出て、外の空気を<u>すった</u>。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '吹った', 1, 0, NOW(), NOW()),
(@q_id, '呼った', 2, 0, NOW(), NOW()),
(@q_id, '吸った', 3, 1, NOW(), NOW()), -- Correct
(@q_id, '叫った', 4, 0, NOW(), NOW());

-- Q10: みじかい -> 短い (3)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part2_id, 10, 'あしたのアルバイトは、いつもより時間が<u>みじかい</u>。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '早い', 1, 0, NOW(), NOW()),
(@q_id, '長い', 2, 0, NOW(), NOW()),
(@q_id, '短い', 3, 1, NOW(), NOW()), -- Correct
(@q_id, '遅い', 4, 0, NOW(), NOW());

-- Q11: い -> 胃 (2)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part2_id, 11, '今日は少し、<u>い</u>の調子がよくない。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '肩', 1, 0, NOW(), NOW()),
(@q_id, '胃', 2, 1, NOW(), NOW()), -- Correct
(@q_id, '腰', 3, 0, NOW(), NOW()),
(@q_id, '肌', 4, 0, NOW(), NOW());

-- Q12: えがお -> 笑顔 (4)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part2_id, 12, 'その話を聞いて、みんなが<u>えがお</u>になった。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '楽顔', 1, 0, NOW(), NOW()),
(@q_id, '悲顔', 2, 0, NOW(), NOW()),
(@q_id, '泣顔', 3, 0, NOW(), NOW()),
(@q_id, '笑顔', 4, 1, NOW(), NOW()); -- Correct

-- Q13: こくばん -> 黒板 (1)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part2_id, 13, '<u>こくばん</u>を見てください。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '黒板', 1, 1, NOW(), NOW()), -- Correct
(@q_id, '黒坂', 2, 0, NOW(), NOW()),
(@q_id, '告板', 3, 0, NOW(), NOW()),
(@q_id, '告坂', 4, 0, NOW(), NOW());

-- Q14: いっぱんてき -> 一般的 (2)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part2_id, 14, 'それは<u>いっぱんてき</u>なことだと思う。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '一段的', 1, 0, NOW(), NOW()),
(@q_id, '一般的', 2, 1, NOW(), NOW()), -- Correct
(@q_id, '一役的', 3, 0, NOW(), NOW()),
(@q_id, '一設的', 4, 0, NOW(), NOW());

-- =========================================================
-- 4. MONDAI 3: ĐIỀN VÀO CHỖ TRỐNG (Ngữ cảnh)
-- =========================================================

INSERT INTO parts (sectionId, part_number, title, created_at, updated_at)
VALUES (@sec_id, 3, '（　）に入れるのに最もよいものを、 1・2・3・4から一つえらびなさい。', NOW(), NOW());
SET @part3_id = LAST_INSERT_ID();

-- Q15: 親戚 (3)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 15, '田中さんは私のめいと結婚したので、私たちは(　)になりました。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '夫婦', 1, 0, NOW(), NOW()),
(@q_id, '家内', 2, 0, NOW(), NOW()),
(@q_id, '親戚', 3, 1, NOW(), NOW()), -- Correct
(@q_id, '兄弟', 4, 0, NOW(), NOW());

-- Q16: 偶然 (4)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 16, '昨日は駅で、学生時代の友達に(　)会って、びっくりした。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'ついでに', 1, 0, NOW(), NOW()),
(@q_id, '当然', 2, 0, NOW(), NOW()),
(@q_id, 'たまに', 3, 0, NOW(), NOW()),
(@q_id, '偶然', 4, 1, NOW(), NOW()); -- Correct

-- Q17: 迷って (1)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 17, '洗剤は種類が多いので、どれを買おうか(　)しまう。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '迷って', 1, 1, NOW(), NOW()), -- Correct
(@q_id, '騒いで', 2, 0, NOW(), NOW()),
(@q_id, '疑って', 3, 0, NOW(), NOW()),
(@q_id, '飽きて', 4, 0, NOW(), NOW());

-- Q18: ぴったり (2)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 18, '足に(　)合う靴がなかなか見つからない。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'はっきり', 1, 0, NOW(), NOW()),
(@q_id, 'ぴったり', 2, 1, NOW(), NOW()), -- Correct
(@q_id, 'うっかり', 3, 0, NOW(), NOW()),
(@q_id, 'がっかり', 4, 0, NOW(), NOW());

-- Q19: 干した (3)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 19, '天気がいいので、庭に洗濯物を(　)。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '混ぜた', 1, 0, NOW(), NOW()),
(@q_id, '揚げた', 2, 0, NOW(), NOW()),
(@q_id, '干した', 3, 1, NOW(), NOW()), -- Correct
(@q_id, 'こぼした', 4, 0, NOW(), NOW());

-- Q20: レシピ (2)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 20, '今日の晩ご飯は、森さんが教えてくれた日本料理の(　)を見て作りました。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'メッセージ', 1, 0, NOW(), NOW()),
(@q_id, 'レシピ', 2, 1, NOW(), NOW()), -- Correct
(@q_id, 'サイン', 3, 0, NOW(), NOW()),
(@q_id, 'アナウンス', 4, 0, NOW(), NOW());

-- Q21: 登場 (4)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 21, '映画の中に(　)する男性が、父にそっくりだった。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '発生', 1, 0, NOW(), NOW()),
(@q_id, '支出', 2, 0, NOW(), NOW()),
(@q_id, '掲示', 3, 0, NOW(), NOW()),
(@q_id, '登場', 4, 1, NOW(), NOW()); -- Correct

-- Q22: どきどき (1)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 22, '大勢の前で歌うのは初めてだったので、(　)した。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'どきどき', 1, 1, NOW(), NOW()), -- Correct
(@q_id, 'だぶだぶ', 2, 0, NOW(), NOW()),
(@q_id, 'ぐうぐう', 3, 0, NOW(), NOW()),
(@q_id, 'ざあざあ', 4, 0, NOW(), NOW());

-- Q23: 希望 (3)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 23, 'ホテルで海側の部屋を(　)したが、空いていなかった。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '納得', 1, 0, NOW(), NOW()),
(@q_id, '承知', 2, 0, NOW(), NOW()),
(@q_id, '希望', 3, 1, NOW(), NOW()), -- Correct
(@q_id, '準備', 4, 0, NOW(), NOW());

-- Q24: ほえる (1)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 24, '夜になると、隣の家の犬が(　)ので、 うるさくてなかなか眠れない。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'ほえる', 1, 1, NOW(), NOW()), -- Correct
(@q_id, 'ひびく', 2, 0, NOW(), NOW()),
(@q_id, 'しゃべる', 3, 0, NOW(), NOW()),
(@q_id, 'どなる', 4, 0, NOW(), NOW());

-- Q25: 追い越す (2)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part3_id, 25, 'この道は狭いので、前の車を(　)のは危険ですよ。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '飛び出す', 1, 0, NOW(), NOW()),
(@q_id, '追い越す', 2, 1, NOW(), NOW()), -- Correct
(@q_id, '押し込む', 3, 0, NOW(), NOW()),
(@q_id, '取り替える', 4, 0, NOW(), NOW());

-- =========================================================
-- 5. MONDAI 4: TỪ ĐỒNG NGHĨA (Paraphrasing)
-- =========================================================

INSERT INTO parts (sectionId, part_number, title, created_at, updated_at)
VALUES (@sec_id, 4, '___ に意味が最も近いものを、 1・2・3・4から一つえらびなさい。', NOW(), NOW());
SET @part4_id = LAST_INSERT_ID();

-- Q26: あたえよう -> あげよう (1)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part4_id, 26, 'もう少し時間を<u>あたえよう</u>と思う。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'あげよう', 1, 1, NOW(), NOW()), -- Correct
(@q_id, 'もらおう', 2, 0, NOW(), NOW()),
(@q_id, '作ろう', 3, 0, NOW(), NOW()),
(@q_id, '使おう', 4, 0, NOW(), NOW());

-- Q27: ずいぶん -> 非常に (2)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part4_id, 27, 'ここは車が<u>ずいぶん</u>多いですね。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '最も', 1, 0, NOW(), NOW()),
(@q_id, '非常に', 2, 1, NOW(), NOW()), -- Correct
(@q_id, 'まあまあ', 3, 0, NOW(), NOW()),
(@q_id, 'やっぱり', 4, 0, NOW(), NOW());

-- Q28: 指定の -> 決められた (1)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part4_id, 28, '荷物は、<u>指定</u>の場所に置いてください。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '決められた', 1, 1, NOW(), NOW()), -- Correct
(@q_id, '空いている', 2, 0, NOW(), NOW()),
(@q_id, '近くの', 3, 0, NOW(), NOW()),
(@q_id, 'ほかの', 4, 0, NOW(), NOW());

-- Q29: 不安 -> 心配 (3)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part4_id, 29, '山田さんの話を聞くまでは<u>不安</u>だった。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '賛成', 1, 0, NOW(), NOW()),
(@q_id, '大変', 2, 0, NOW(), NOW()),
(@q_id, '心配', 3, 1, NOW(), NOW()), -- Correct
(@q_id, '反対', 4, 0, NOW(), NOW());

-- Q30: スケジュール -> 予定 (4)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part4_id, 30, '<u>スケジュール</u>は川井さんに聞いてください。', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '行き方', 1, 0, NOW(), NOW()),
(@q_id, '理由', 2, 0, NOW(), NOW()),
(@q_id, 'やり方', 3, 0, NOW(), NOW()),
(@q_id, '予定', 4, 1, NOW(), NOW()); -- Correct

-- =========================================================
-- 6. MONDAI 5: CÁCH DÙNG TỪ (Usage)
-- =========================================================

INSERT INTO parts (sectionId, part_number, title, created_at, updated_at)
VALUES (@sec_id, 5, 'つぎのことばの使い方として最もよいものを、 1・2・3・4から一つえらびなさい。', NOW(), NOW());
SET @part5_id = LAST_INSERT_ID();

-- Q31: 発展 (4)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part5_id, 31, '発展', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '毎朝ジョギングを続けたら、健康が発展するだろう。', 1, 0, NOW(), NOW()),
(@q_id, 'テレビで紹介されてから 、この店は客の数が発展した。', 2, 0, NOW(), NOW()),
(@q_id, '林さんは中学校のとき 、成績が急に発展したそうだ 。', 3, 0, NOW(), NOW()),
(@q_id, 'この町は歴史的な建物が多く、観光地として発展してきた。', 4, 1, NOW(), NOW()); -- Correct

-- Q32: だく (2)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part5_id, 32, 'だく', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '朝作ったお弁当を大きめのハンカチでだいてかばんに入れた 。', 1, 0, NOW(), NOW()),
(@q_id, '生まれた子を初めてだいたとき 、とても小さくて軽いと感じた 。', 2, 1, NOW(), NOW()), -- Correct
(@q_id, 'けがをしないように、包丁をしっかりだいて魚を切った。', 3, 0, NOW(), NOW()),
(@q_id, '引っ越しのとき運びやすいように 、本や雑誌をひもでだいた。', 4, 0, NOW(), NOW());

-- Q33: 原料 (4)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part5_id, 33, '原料', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'ここから見える景色を原料にして、抽象的な絵をかくつもりだ。', 1, 0, NOW(), NOW()),
(@q_id, '大学を卒業したら、留学の経験を原料にして仕事がしたい。', 2, 0, NOW(), NOW()),
(@q_id, 'このドラマは、海外の小説を原料にしたそうです。', 3, 0, NOW(), NOW()),
(@q_id, '牛乳を原料にして、チーズやバターが作られます。', 4, 1, NOW(), NOW()); -- Correct

-- Q34: 異常 (1)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part5_id, 34, '異常', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, '今年の夏は異常な暑さで、エアコンがよく売れたそうだ。', 1, 1, NOW(), NOW()), -- Correct
(@q_id, 'その色は見えにくいので 、赤などの異常な色を使ってください。', 2, 0, NOW(), NOW()),
(@q_id, '妹の作文は上手に書けていたが、異常な漢字が一つあった。', 3, 0, NOW(), NOW()),
(@q_id, '姉の靴は、私とは異常なサイズなので、借りることができない。', 4, 0, NOW(), NOW());

-- Q35: 重なる (3)
INSERT INTO questions (partId, question_number, content, created_at, updated_at) 
VALUES (@part5_id, 35, '重なる', NOW(), NOW());
SET @q_id = LAST_INSERT_ID();

INSERT INTO options (questionId, content, order_index, is_correct, created_at, updated_at) VALUES 
(@q_id, 'A 銀行とB銀行が重なって、新しい銀行ができました。', 1, 0, NOW(), NOW()),
(@q_id, '私たちの研究会に、来月から新しい仲間が重なります。', 2, 0, NOW(), NOW()),
(@q_id, '子どもの運動会が大切な会議と重なった、見に行けない。', 3, 1, NOW(), NOW()), -- Correct
(@q_id, '貯金がたくさん重なったら、車を買おうと思っている。', 4, 0, NOW(), NOW());

COMMIT;
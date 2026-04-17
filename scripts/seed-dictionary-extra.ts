/**
 * Supplementary seed: adds MORE entries to the dictionary_entries table.
 * Run AFTER the initial seed: npx tsx scripts/seed-dictionary-extra.ts
 */
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'local.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

interface DictEntry {
  simplified: string;
  traditional?: string;
  pinyin: string;
  meaning: string;
  hskLevel?: number;
  frequency?: number;
  partOfSpeech?: string;
}

// Check what already exists to avoid duplicates
const existingRows = db.prepare('SELECT simplified FROM dictionary_entries').all() as { simplified: string }[];
const existingSet = new Set(existingRows.map(r => r.simplified));

const entries: DictEntry[] = [
  // ═══════════════════════════════════════════
  // HSK 1 Remaining
  // ═══════════════════════════════════════════
  { simplified: '哪里', pinyin: 'nǎlǐ', meaning: 'where', hskLevel: 1, frequency: 158, partOfSpeech: 'pronoun' },
  { simplified: '点', pinyin: 'diǎn', meaning: 'o\'clock; a little; point', hskLevel: 1, frequency: 159, partOfSpeech: 'noun' },
  { simplified: '号', pinyin: 'hào', meaning: 'number; date (of month)', hskLevel: 1, frequency: 160, partOfSpeech: 'noun' },
  { simplified: '下', pinyin: 'xià', meaning: 'below; next; to go down', hskLevel: 1, frequency: 161, partOfSpeech: 'noun/verb' },
  { simplified: '上', pinyin: 'shàng', meaning: 'above; previous; to go up', hskLevel: 1, frequency: 162, partOfSpeech: 'noun/verb' },

  // ═══════════════════════════════════════════
  // HSK 2 Extra
  // ═══════════════════════════════════════════
  { simplified: '地图', traditional: '地圖', pinyin: 'dìtú', meaning: 'map', hskLevel: 2, frequency: 320, partOfSpeech: 'noun' },
  { simplified: '药', traditional: '藥', pinyin: 'yào', meaning: 'medicine; drug', hskLevel: 2, frequency: 321, partOfSpeech: 'noun' },
  { simplified: '眼镜', traditional: '眼鏡', pinyin: 'yǎnjìng', meaning: 'glasses; spectacles', hskLevel: 2, frequency: 322, partOfSpeech: 'noun' },
  { simplified: '裤子', traditional: '褲子', pinyin: 'kùzi', meaning: 'pants; trousers', hskLevel: 2, frequency: 323, partOfSpeech: 'noun' },
  { simplified: '裙子', pinyin: 'qúnzi', meaning: 'skirt; dress', hskLevel: 2, frequency: 324, partOfSpeech: 'noun' },
  { simplified: '鞋', pinyin: 'xié', meaning: 'shoe', hskLevel: 2, frequency: 325, partOfSpeech: 'noun' },
  { simplified: '帽子', pinyin: 'màozi', meaning: 'hat; cap', hskLevel: 2, frequency: 326, partOfSpeech: 'noun' },
  { simplified: '伞', traditional: '傘', pinyin: 'sǎn', meaning: 'umbrella', hskLevel: 2, frequency: 327, partOfSpeech: 'noun' },
  { simplified: '黄瓜', traditional: '黃瓜', pinyin: 'huángguā', meaning: 'cucumber', hskLevel: 2, frequency: 328, partOfSpeech: 'noun' },
  { simplified: '西瓜', pinyin: 'xīguā', meaning: 'watermelon', hskLevel: 2, frequency: 329, partOfSpeech: 'noun' },
  { simplified: '生病', pinyin: 'shēngbìng', meaning: 'to get sick; to fall ill', hskLevel: 2, frequency: 330, partOfSpeech: 'verb' },
  { simplified: '发烧', traditional: '發燒', pinyin: 'fāshāo', meaning: 'to have a fever', hskLevel: 2, frequency: 331, partOfSpeech: 'verb' },
  { simplified: '感冒', pinyin: 'gǎnmào', meaning: 'to catch a cold; cold', hskLevel: 2, frequency: 332, partOfSpeech: 'noun/verb' },
  { simplified: '休息', pinyin: 'xiūxi', meaning: 'to rest', hskLevel: 2, frequency: 333, partOfSpeech: 'verb' },
  { simplified: '锻炼', traditional: '鍛煉', pinyin: 'duànliàn', meaning: 'to exercise; to work out', hskLevel: 2, frequency: 334, partOfSpeech: 'verb' },
  { simplified: '便宜', pinyin: 'piányi', meaning: 'cheap; inexpensive', hskLevel: 2, frequency: 335, partOfSpeech: 'adjective' },
  { simplified: '聪明', traditional: '聰明', pinyin: 'cōngming', meaning: 'clever; smart', hskLevel: 2, frequency: 336, partOfSpeech: 'adjective' },
  { simplified: '安静', traditional: '安靜', pinyin: 'ānjìng', meaning: 'quiet; peaceful', hskLevel: 2, frequency: 337, partOfSpeech: 'adjective' },
  { simplified: '声音', traditional: '聲音', pinyin: 'shēngyīn', meaning: 'sound; voice', hskLevel: 2, frequency: 338, partOfSpeech: 'noun' },
  { simplified: '照片', pinyin: 'zhàopiàn', meaning: 'photo; photograph', hskLevel: 2, frequency: 339, partOfSpeech: 'noun' },
  { simplified: '河', pinyin: 'hé', meaning: 'river', hskLevel: 2, frequency: 340, partOfSpeech: 'noun' },
  { simplified: '树', traditional: '樹', pinyin: 'shù', meaning: 'tree', hskLevel: 2, frequency: 341, partOfSpeech: 'noun' },

  // ═══════════════════════════════════════════
  // HSK 3 Extra (filling gaps ~100 more)
  // ═══════════════════════════════════════════
  { simplified: '除了', pinyin: 'chúle', meaning: 'besides; except for', hskLevel: 3, frequency: 470, partOfSpeech: 'preposition' },
  { simplified: '根据', traditional: '根據', pinyin: 'gēnjù', meaning: 'according to; based on', hskLevel: 3, frequency: 471, partOfSpeech: 'preposition' },
  { simplified: '而且', pinyin: 'érqiě', meaning: 'moreover; and also', hskLevel: 3, frequency: 472, partOfSpeech: 'conjunction' },
  { simplified: '无论', traditional: '無論', pinyin: 'wúlùn', meaning: 'regardless; no matter', hskLevel: 3, frequency: 473, partOfSpeech: 'conjunction' },
  { simplified: '只要', pinyin: 'zhǐyào', meaning: 'as long as; if only', hskLevel: 3, frequency: 474, partOfSpeech: 'conjunction' },
  { simplified: '只有', pinyin: 'zhǐyǒu', meaning: 'only; only if', hskLevel: 3, frequency: 475, partOfSpeech: 'conjunction' },
  { simplified: '尽量', traditional: '盡量', pinyin: 'jǐnliàng', meaning: 'as much as possible', hskLevel: 3, frequency: 476, partOfSpeech: 'adverb' },
  { simplified: '逐步', pinyin: 'zhúbù', meaning: 'step by step; gradually', hskLevel: 3, frequency: 477, partOfSpeech: 'adverb' },
  { simplified: '及时', traditional: '及時', pinyin: 'jíshí', meaning: 'in time; timely', hskLevel: 3, frequency: 478, partOfSpeech: 'adjective' },
  { simplified: '数学', traditional: '數學', pinyin: 'shùxué', meaning: 'mathematics', hskLevel: 3, frequency: 479, partOfSpeech: 'noun' },
  { simplified: '物理', pinyin: 'wùlǐ', meaning: 'physics', hskLevel: 3, frequency: 480, partOfSpeech: 'noun' },
  { simplified: '化学', traditional: '化學', pinyin: 'huàxué', meaning: 'chemistry', hskLevel: 3, frequency: 481, partOfSpeech: 'noun' },
  { simplified: '生物', pinyin: 'shēngwù', meaning: 'biology; living thing', hskLevel: 3, frequency: 482, partOfSpeech: 'noun' },
  { simplified: '地理', pinyin: 'dìlǐ', meaning: 'geography', hskLevel: 3, frequency: 483, partOfSpeech: 'noun' },
  { simplified: '音乐', traditional: '音樂', pinyin: 'yīnyuè', meaning: 'music', hskLevel: 3, frequency: 484, partOfSpeech: 'noun' },
  { simplified: '美术', traditional: '美術', pinyin: 'měishù', meaning: 'fine arts; art', hskLevel: 3, frequency: 485, partOfSpeech: 'noun' },
  { simplified: '体育', traditional: '體育', pinyin: 'tǐyù', meaning: 'physical education; sports', hskLevel: 3, frequency: 486, partOfSpeech: 'noun' },
  { simplified: '知识', traditional: '知識', pinyin: 'zhīshi', meaning: 'knowledge', hskLevel: 3, frequency: 487, partOfSpeech: 'noun' },
  { simplified: '文章', pinyin: 'wénzhāng', meaning: 'article; essay', hskLevel: 3, frequency: 488, partOfSpeech: 'noun' },
  { simplified: '故事', pinyin: 'gùshi', meaning: 'story; tale', hskLevel: 3, frequency: 489, partOfSpeech: 'noun' },
  { simplified: '消息', pinyin: 'xiāoxi', meaning: 'news; message', hskLevel: 3, frequency: 490, partOfSpeech: 'noun' },
  { simplified: '新闻', traditional: '新聞', pinyin: 'xīnwén', meaning: 'news', hskLevel: 3, frequency: 491, partOfSpeech: 'noun' },
  { simplified: '广告', traditional: '廣告', pinyin: 'guǎnggào', meaning: 'advertisement', hskLevel: 3, frequency: 492, partOfSpeech: 'noun' },
  { simplified: '演出', pinyin: 'yǎnchū', meaning: 'performance; show', hskLevel: 3, frequency: 493, partOfSpeech: 'noun' },
  { simplified: '比赛', traditional: '比賽', pinyin: 'bǐsài', meaning: 'competition; match', hskLevel: 3, frequency: 494, partOfSpeech: 'noun' },
  { simplified: '成绩', traditional: '成績', pinyin: 'chéngjì', meaning: 'grade; score; achievement', hskLevel: 3, frequency: 495, partOfSpeech: 'noun' },
  { simplified: '毕业', traditional: '畢業', pinyin: 'bìyè', meaning: 'to graduate', hskLevel: 3, frequency: 496, partOfSpeech: 'verb' },
  { simplified: '专业', traditional: '專業', pinyin: 'zhuānyè', meaning: 'major; specialty; professional', hskLevel: 3, frequency: 497, partOfSpeech: 'noun' },
  { simplified: '职业', traditional: '職業', pinyin: 'zhíyè', meaning: 'occupation; profession', hskLevel: 3, frequency: 498, partOfSpeech: 'noun' },
  { simplified: '经理', traditional: '經理', pinyin: 'jīnglǐ', meaning: 'manager', hskLevel: 3, frequency: 499, partOfSpeech: 'noun' },
  { simplified: '老板', pinyin: 'lǎobǎn', meaning: 'boss', hskLevel: 3, frequency: 500, partOfSpeech: 'noun' },
  { simplified: '同事', pinyin: 'tóngshì', meaning: 'colleague; coworker', hskLevel: 3, frequency: 501, partOfSpeech: 'noun' },
  { simplified: '客人', pinyin: 'kèrén', meaning: 'guest; visitor', hskLevel: 3, frequency: 502, partOfSpeech: 'noun' },
  { simplified: '邻居', traditional: '鄰居', pinyin: 'línjū', meaning: 'neighbor', hskLevel: 3, frequency: 503, partOfSpeech: 'noun' },
  { simplified: '爷爷', traditional: '爺爺', pinyin: 'yéye', meaning: 'grandfather (father\'s side)', hskLevel: 3, frequency: 504, partOfSpeech: 'noun' },
  { simplified: '奶奶', pinyin: 'nǎinai', meaning: 'grandmother (father\'s side)', hskLevel: 3, frequency: 505, partOfSpeech: 'noun' },
  { simplified: '叔叔', pinyin: 'shūshu', meaning: 'uncle (father\'s younger brother)', hskLevel: 3, frequency: 506, partOfSpeech: 'noun' },
  { simplified: '阿姨', pinyin: 'āyí', meaning: 'aunt; auntie', hskLevel: 3, frequency: 507, partOfSpeech: 'noun' },
  { simplified: '表演', pinyin: 'biǎoyǎn', meaning: 'to perform; performance', hskLevel: 3, frequency: 508, partOfSpeech: 'verb/noun' },
  { simplified: '打算', pinyin: 'dǎsuàn', meaning: 'to plan; to intend', hskLevel: 3, frequency: 509, partOfSpeech: 'verb' },
  { simplified: '放弃', traditional: '放棄', pinyin: 'fàngqì', meaning: 'to give up; to abandon', hskLevel: 3, frequency: 510, partOfSpeech: 'verb' },
  { simplified: '坚持', traditional: '堅持', pinyin: 'jiānchí', meaning: 'to persist; to insist', hskLevel: 3, frequency: 511, partOfSpeech: 'verb' },
  { simplified: '拒绝', traditional: '拒絕', pinyin: 'jùjué', meaning: 'to refuse; to reject', hskLevel: 3, frequency: 512, partOfSpeech: 'verb' },
  { simplified: '接受', pinyin: 'jiēshòu', meaning: 'to accept; to receive', hskLevel: 3, frequency: 513, partOfSpeech: 'verb' },
  { simplified: '鼓励', traditional: '鼓勵', pinyin: 'gǔlì', meaning: 'to encourage', hskLevel: 3, frequency: 514, partOfSpeech: 'verb' },
  { simplified: '批评', traditional: '批評', pinyin: 'pīpíng', meaning: 'to criticize; criticism', hskLevel: 3, frequency: 515, partOfSpeech: 'verb' },
  { simplified: '道歉', pinyin: 'dàoqiàn', meaning: 'to apologize', hskLevel: 3, frequency: 516, partOfSpeech: 'verb' },
  { simplified: '原谅', traditional: '原諒', pinyin: 'yuánliàng', meaning: 'to forgive', hskLevel: 3, frequency: 517, partOfSpeech: 'verb' },
  { simplified: '尊重', pinyin: 'zūnzhòng', meaning: 'to respect; respect', hskLevel: 3, frequency: 518, partOfSpeech: 'verb' },
  { simplified: '理解', pinyin: 'lǐjiě', meaning: 'to understand; understanding', hskLevel: 3, frequency: 519, partOfSpeech: 'verb' },
  { simplified: '解释', traditional: '解釋', pinyin: 'jiěshì', meaning: 'to explain; explanation', hskLevel: 3, frequency: 520, partOfSpeech: 'verb' },
  { simplified: '翻译', traditional: '翻譯', pinyin: 'fānyì', meaning: 'to translate; translation', hskLevel: 3, frequency: 521, partOfSpeech: 'verb/noun' },
  { simplified: '交流', pinyin: 'jiāoliú', meaning: 'to exchange; to communicate', hskLevel: 3, frequency: 522, partOfSpeech: 'verb' },
  { simplified: '联系', traditional: '聯繫', pinyin: 'liánxì', meaning: 'to contact; connection', hskLevel: 3, frequency: 523, partOfSpeech: 'verb' },
  { simplified: '通知', pinyin: 'tōngzhī', meaning: 'to notify; notice', hskLevel: 3, frequency: 524, partOfSpeech: 'verb/noun' },
  { simplified: '申请', traditional: '申請', pinyin: 'shēnqǐng', meaning: 'to apply; application', hskLevel: 3, frequency: 525, partOfSpeech: 'verb' },
  { simplified: '签名', traditional: '簽名', pinyin: 'qiānmíng', meaning: 'to sign; signature', hskLevel: 3, frequency: 526, partOfSpeech: 'verb/noun' },
  { simplified: '保存', pinyin: 'bǎocún', meaning: 'to save; to preserve', hskLevel: 3, frequency: 527, partOfSpeech: 'verb' },
  { simplified: '修理', pinyin: 'xiūlǐ', meaning: 'to repair; to fix', hskLevel: 3, frequency: 528, partOfSpeech: 'verb' },
  { simplified: '整理', pinyin: 'zhěnglǐ', meaning: 'to organize; to tidy up', hskLevel: 3, frequency: 529, partOfSpeech: 'verb' },
  { simplified: '打扫', traditional: '打掃', pinyin: 'dǎsǎo', meaning: 'to clean; to sweep', hskLevel: 3, frequency: 530, partOfSpeech: 'verb' },
  { simplified: '搬家', pinyin: 'bānjiā', meaning: 'to move (house)', hskLevel: 3, frequency: 531, partOfSpeech: 'verb' },
  { simplified: '装修', traditional: '裝修', pinyin: 'zhuāngxiū', meaning: 'to renovate; renovation', hskLevel: 3, frequency: 532, partOfSpeech: 'verb' },
  { simplified: '熟悉', pinyin: 'shúxī', meaning: 'familiar; to be familiar with', hskLevel: 3, frequency: 533, partOfSpeech: 'verb' },
  { simplified: '陌生', pinyin: 'mòshēng', meaning: 'strange; unfamiliar', hskLevel: 3, frequency: 534, partOfSpeech: 'adjective' },
  { simplified: '温柔', traditional: '溫柔', pinyin: 'wēnróu', meaning: 'gentle; tender', hskLevel: 3, frequency: 535, partOfSpeech: 'adjective' },
  { simplified: '活泼', traditional: '活潑', pinyin: 'huópō', meaning: 'lively; vivacious', hskLevel: 3, frequency: 536, partOfSpeech: 'adjective' },
  { simplified: '诚实', traditional: '誠實', pinyin: 'chéngshí', meaning: 'honest; sincere', hskLevel: 3, frequency: 537, partOfSpeech: 'adjective' },
  { simplified: '勇敢', pinyin: 'yǒnggǎn', meaning: 'brave; courageous', hskLevel: 3, frequency: 538, partOfSpeech: 'adjective' },
  { simplified: '耐心', pinyin: 'nàixīn', meaning: 'patient; patience', hskLevel: 3, frequency: 539, partOfSpeech: 'adjective/noun' },
  { simplified: '幽默', pinyin: 'yōumò', meaning: 'humorous; humor', hskLevel: 3, frequency: 540, partOfSpeech: 'adjective' },
  { simplified: '可爱', traditional: '可愛', pinyin: 'kěài', meaning: 'cute; adorable', hskLevel: 3, frequency: 541, partOfSpeech: 'adjective' },
  { simplified: '帅', traditional: '帥', pinyin: 'shuài', meaning: 'handsome; cool', hskLevel: 3, frequency: 542, partOfSpeech: 'adjective' },
  { simplified: '胖', pinyin: 'pàng', meaning: 'fat; overweight', hskLevel: 3, frequency: 543, partOfSpeech: 'adjective' },
  { simplified: '瘦', pinyin: 'shòu', meaning: 'thin; slim', hskLevel: 3, frequency: 544, partOfSpeech: 'adjective' },
  { simplified: '矮', pinyin: 'ǎi', meaning: 'short (height)', hskLevel: 3, frequency: 545, partOfSpeech: 'adjective' },
  { simplified: '暖和', pinyin: 'nuǎnhuo', meaning: 'warm', hskLevel: 3, frequency: 546, partOfSpeech: 'adjective' },
  { simplified: '凉快', traditional: '涼快', pinyin: 'liángkuai', meaning: 'cool; pleasantly cool', hskLevel: 3, frequency: 547, partOfSpeech: 'adjective' },

  // ═══════════════════════════════════════════
  // HSK 4 Extra (~100 more)
  // ═══════════════════════════════════════════
  { simplified: '乘坐', pinyin: 'chéngzuò', meaning: 'to ride; to take (transport)', hskLevel: 4, frequency: 660, partOfSpeech: 'verb' },
  { simplified: '包括', pinyin: 'bāokuò', meaning: 'to include; including', hskLevel: 4, frequency: 661, partOfSpeech: 'verb' },
  { simplified: '拥有', traditional: '擁有', pinyin: 'yōngyǒu', meaning: 'to own; to possess', hskLevel: 4, frequency: 662, partOfSpeech: 'verb' },
  { simplified: '具备', traditional: '具備', pinyin: 'jùbèi', meaning: 'to possess; to have', hskLevel: 4, frequency: 663, partOfSpeech: 'verb' },
  { simplified: '提供', pinyin: 'tígōng', meaning: 'to provide; to supply', hskLevel: 4, frequency: 664, partOfSpeech: 'verb' },
  { simplified: '创造', traditional: '創造', pinyin: 'chuàngzào', meaning: 'to create; to bring about', hskLevel: 4, frequency: 665, partOfSpeech: 'verb' },
  { simplified: '发现', traditional: '發現', pinyin: 'fāxiàn', meaning: 'to discover; to find', hskLevel: 4, frequency: 666, partOfSpeech: 'verb' },
  { simplified: '发明', traditional: '發明', pinyin: 'fāmíng', meaning: 'to invent; invention', hskLevel: 4, frequency: 667, partOfSpeech: 'verb/noun' },
  { simplified: '实验', traditional: '實驗', pinyin: 'shíyàn', meaning: 'experiment', hskLevel: 4, frequency: 668, partOfSpeech: 'noun' },
  { simplified: '研究', pinyin: 'yánjiū', meaning: 'to research; research', hskLevel: 4, frequency: 669, partOfSpeech: 'verb/noun' },
  { simplified: '调查', traditional: '調查', pinyin: 'diàochá', meaning: 'to investigate; survey', hskLevel: 4, frequency: 670, partOfSpeech: 'verb/noun' },
  { simplified: '分析', pinyin: 'fēnxī', meaning: 'to analyze; analysis', hskLevel: 4, frequency: 671, partOfSpeech: 'verb/noun' },
  { simplified: '总结', traditional: '總結', pinyin: 'zǒngjié', meaning: 'to summarize; summary', hskLevel: 4, frequency: 672, partOfSpeech: 'verb/noun' },
  { simplified: '结论', traditional: '結論', pinyin: 'jiélùn', meaning: 'conclusion', hskLevel: 4, frequency: 673, partOfSpeech: 'noun' },
  { simplified: '观点', traditional: '觀點', pinyin: 'guāndiǎn', meaning: 'viewpoint; opinion', hskLevel: 4, frequency: 674, partOfSpeech: 'noun' },
  { simplified: '意见', traditional: '意見', pinyin: 'yìjiàn', meaning: 'opinion; suggestion', hskLevel: 4, frequency: 675, partOfSpeech: 'noun' },
  { simplified: '印象', pinyin: 'yìnxiàng', meaning: 'impression', hskLevel: 4, frequency: 676, partOfSpeech: 'noun' },
  { simplified: '记忆', traditional: '記憶', pinyin: 'jìyì', meaning: 'memory; to remember', hskLevel: 4, frequency: 677, partOfSpeech: 'noun/verb' },
  { simplified: '想象', pinyin: 'xiǎngxiàng', meaning: 'to imagine; imagination', hskLevel: 4, frequency: 678, partOfSpeech: 'verb/noun' },
  { simplified: '感觉', traditional: '感覺', pinyin: 'gǎnjué', meaning: 'to feel; feeling', hskLevel: 4, frequency: 679, partOfSpeech: 'verb/noun' },
  { simplified: '情感', pinyin: 'qínggǎn', meaning: 'emotion; feeling', hskLevel: 4, frequency: 680, partOfSpeech: 'noun' },
  { simplified: '性格', pinyin: 'xìnggé', meaning: 'personality; character', hskLevel: 4, frequency: 681, partOfSpeech: 'noun' },
  { simplified: '习惯', traditional: '習慣', pinyin: 'xíguàn', meaning: 'habit; to be used to', hskLevel: 4, frequency: 682, partOfSpeech: 'noun/verb' },
  { simplified: '风格', traditional: '風格', pinyin: 'fēnggé', meaning: 'style', hskLevel: 4, frequency: 683, partOfSpeech: 'noun' },
  { simplified: '传统', traditional: '傳統', pinyin: 'chuántǒng', meaning: 'tradition; traditional', hskLevel: 4, frequency: 684, partOfSpeech: 'noun/adjective' },
  { simplified: '现代', traditional: '現代', pinyin: 'xiàndài', meaning: 'modern; contemporary', hskLevel: 4, frequency: 685, partOfSpeech: 'adjective' },
  { simplified: '古代', pinyin: 'gǔdài', meaning: 'ancient times; ancient', hskLevel: 4, frequency: 686, partOfSpeech: 'noun' },
  { simplified: '未来', traditional: '未來', pinyin: 'wèilái', meaning: 'future', hskLevel: 4, frequency: 687, partOfSpeech: 'noun' },
  { simplified: '回忆', traditional: '回憶', pinyin: 'huíyì', meaning: 'to recall; memory', hskLevel: 4, frequency: 688, partOfSpeech: 'verb/noun' },
  { simplified: '经历', traditional: '經歷', pinyin: 'jīnglì', meaning: 'experience; to go through', hskLevel: 4, frequency: 689, partOfSpeech: 'noun/verb' },
  { simplified: '成功', pinyin: 'chénggōng', meaning: 'to succeed; success; successful', hskLevel: 4, frequency: 690, partOfSpeech: 'verb/noun' },
  { simplified: '失败', traditional: '失敗', pinyin: 'shībài', meaning: 'to fail; failure', hskLevel: 4, frequency: 691, partOfSpeech: 'verb/noun' },
  { simplified: '困难', traditional: '困難', pinyin: 'kùnnan', meaning: 'difficulty; difficult', hskLevel: 4, frequency: 692, partOfSpeech: 'noun/adjective' },
  { simplified: '压力', traditional: '壓力', pinyin: 'yālì', meaning: 'pressure; stress', hskLevel: 4, frequency: 693, partOfSpeech: 'noun' },
  { simplified: '挑战', traditional: '挑戰', pinyin: 'tiǎozhàn', meaning: 'challenge; to challenge', hskLevel: 4, frequency: 694, partOfSpeech: 'noun/verb' },
  { simplified: '勇气', traditional: '勇氣', pinyin: 'yǒngqì', meaning: 'courage; bravery', hskLevel: 4, frequency: 695, partOfSpeech: 'noun' },
  { simplified: '信心', pinyin: 'xìnxīn', meaning: 'confidence; faith', hskLevel: 4, frequency: 696, partOfSpeech: 'noun' },
  { simplified: '决心', traditional: '決心', pinyin: 'juéxīn', meaning: 'determination; to be determined', hskLevel: 4, frequency: 697, partOfSpeech: 'noun' },
  { simplified: '梦想', traditional: '夢想', pinyin: 'mèngxiǎng', meaning: 'dream; aspiration', hskLevel: 4, frequency: 698, partOfSpeech: 'noun' },
  { simplified: '目标', traditional: '目標', pinyin: 'mùbiāo', meaning: 'target; goal; objective', hskLevel: 4, frequency: 699, partOfSpeech: 'noun' },
  { simplified: '任务', traditional: '任務', pinyin: 'rènwu', meaning: 'task; mission', hskLevel: 4, frequency: 700, partOfSpeech: 'noun' },
  { simplified: '命运', traditional: '命運', pinyin: 'mìngyùn', meaning: 'fate; destiny', hskLevel: 4, frequency: 701, partOfSpeech: 'noun' },
  { simplified: '永远', traditional: '永遠', pinyin: 'yǒngyuǎn', meaning: 'forever; always', hskLevel: 4, frequency: 702, partOfSpeech: 'adverb' },
  { simplified: '暂时', traditional: '暫時', pinyin: 'zànshí', meaning: 'temporarily; for the time being', hskLevel: 4, frequency: 703, partOfSpeech: 'adverb' },
  { simplified: '偶尔', traditional: '偶爾', pinyin: 'ǒuěr', meaning: 'occasionally; once in a while', hskLevel: 4, frequency: 704, partOfSpeech: 'adverb' },

  // ═══════════════════════════════════════════
  // HSK 5 Extra (~100 more)
  // ═══════════════════════════════════════════
  { simplified: '掌握', pinyin: 'zhǎngwò', meaning: 'to master; to grasp', hskLevel: 5, frequency: 840, partOfSpeech: 'verb' },
  { simplified: '培养', traditional: '培養', pinyin: 'péiyǎng', meaning: 'to cultivate; to train', hskLevel: 5, frequency: 841, partOfSpeech: 'verb' },
  { simplified: '启发', traditional: '啟發', pinyin: 'qǐfā', meaning: 'to inspire; inspiration', hskLevel: 5, frequency: 842, partOfSpeech: 'verb' },
  { simplified: '激励', traditional: '激勵', pinyin: 'jīlì', meaning: 'to motivate; to inspire', hskLevel: 5, frequency: 843, partOfSpeech: 'verb' },
  { simplified: '感激', pinyin: 'gǎnjī', meaning: 'grateful; to feel grateful', hskLevel: 5, frequency: 844, partOfSpeech: 'verb' },
  { simplified: '欣赏', traditional: '欣賞', pinyin: 'xīnshǎng', meaning: 'to appreciate; to enjoy', hskLevel: 5, frequency: 845, partOfSpeech: 'verb' },
  { simplified: '忽视', traditional: '忽視', pinyin: 'hūshì', meaning: 'to ignore; to overlook', hskLevel: 5, frequency: 846, partOfSpeech: 'verb' },
  { simplified: '误解', traditional: '誤解', pinyin: 'wùjiě', meaning: 'to misunderstand; misunderstanding', hskLevel: 5, frequency: 847, partOfSpeech: 'verb/noun' },
  { simplified: '犹豫', traditional: '猶豫', pinyin: 'yóuyù', meaning: 'to hesitate; hesitation', hskLevel: 5, frequency: 848, partOfSpeech: 'verb' },
  { simplified: '抱怨', pinyin: 'bàoyuàn', meaning: 'to complain', hskLevel: 5, frequency: 849, partOfSpeech: 'verb' },
  { simplified: '纠正', traditional: '糾正', pinyin: 'jiūzhèng', meaning: 'to correct; to rectify', hskLevel: 5, frequency: 850, partOfSpeech: 'verb' },
  { simplified: '适应', traditional: '適應', pinyin: 'shìyìng', meaning: 'to adapt; to adjust', hskLevel: 5, frequency: 851, partOfSpeech: 'verb' },
  { simplified: '克服', pinyin: 'kèfú', meaning: 'to overcome; to conquer', hskLevel: 5, frequency: 852, partOfSpeech: 'verb' },
  { simplified: '面临', traditional: '面臨', pinyin: 'miànlín', meaning: 'to face; to be confronted with', hskLevel: 5, frequency: 853, partOfSpeech: 'verb' },
  { simplified: '处理', traditional: '處理', pinyin: 'chǔlǐ', meaning: 'to handle; to deal with', hskLevel: 5, frequency: 854, partOfSpeech: 'verb' },
  { simplified: '承担', traditional: '承擔', pinyin: 'chéngdān', meaning: 'to bear; to undertake', hskLevel: 5, frequency: 855, partOfSpeech: 'verb' },
  { simplified: '维持', traditional: '維持', pinyin: 'wéichí', meaning: 'to maintain; to sustain', hskLevel: 5, frequency: 856, partOfSpeech: 'verb' },
  { simplified: '控制', pinyin: 'kòngzhì', meaning: 'to control; control', hskLevel: 5, frequency: 857, partOfSpeech: 'verb' },
  { simplified: '限制', pinyin: 'xiànzhì', meaning: 'to restrict; restriction', hskLevel: 5, frequency: 858, partOfSpeech: 'verb/noun' },
  { simplified: '扩大', traditional: '擴大', pinyin: 'kuòdà', meaning: 'to expand; to enlarge', hskLevel: 5, frequency: 859, partOfSpeech: 'verb' },
  { simplified: '缩小', traditional: '縮小', pinyin: 'suōxiǎo', meaning: 'to shrink; to reduce', hskLevel: 5, frequency: 860, partOfSpeech: 'verb' },
  { simplified: '集中', pinyin: 'jízhōng', meaning: 'to concentrate; to focus', hskLevel: 5, frequency: 861, partOfSpeech: 'verb' },
  { simplified: '分配', pinyin: 'fēnpèi', meaning: 'to distribute; to allocate', hskLevel: 5, frequency: 862, partOfSpeech: 'verb' },
  { simplified: '消费', traditional: '消費', pinyin: 'xiāofèi', meaning: 'to consume; consumption', hskLevel: 5, frequency: 863, partOfSpeech: 'verb/noun' },
  { simplified: '投资', traditional: '投資', pinyin: 'tóuzī', meaning: 'to invest; investment', hskLevel: 5, frequency: 864, partOfSpeech: 'verb/noun' },
  { simplified: '利润', traditional: '利潤', pinyin: 'lìrùn', meaning: 'profit', hskLevel: 5, frequency: 865, partOfSpeech: 'noun' },
  { simplified: '成本', pinyin: 'chéngběn', meaning: 'cost', hskLevel: 5, frequency: 866, partOfSpeech: 'noun' },
  { simplified: '效率', pinyin: 'xiàolǜ', meaning: 'efficiency', hskLevel: 5, frequency: 867, partOfSpeech: 'noun' },
  { simplified: '创新', traditional: '創新', pinyin: 'chuàngxīn', meaning: 'innovation; to innovate', hskLevel: 5, frequency: 868, partOfSpeech: 'noun/verb' },
  { simplified: '品牌', pinyin: 'pǐnpái', meaning: 'brand', hskLevel: 5, frequency: 869, partOfSpeech: 'noun' },
  { simplified: '产品', traditional: '產品', pinyin: 'chǎnpǐn', meaning: 'product', hskLevel: 5, frequency: 870, partOfSpeech: 'noun' },
  { simplified: '服务', traditional: '服務', pinyin: 'fúwù', meaning: 'service; to serve', hskLevel: 5, frequency: 871, partOfSpeech: 'noun/verb' },
  { simplified: '客户', traditional: '客戶', pinyin: 'kèhù', meaning: 'client; customer', hskLevel: 5, frequency: 872, partOfSpeech: 'noun' },
  { simplified: '合同', pinyin: 'hétóng', meaning: 'contract; agreement', hskLevel: 5, frequency: 873, partOfSpeech: 'noun' },
  { simplified: '项目', traditional: '項目', pinyin: 'xiàngmù', meaning: 'project; item', hskLevel: 5, frequency: 874, partOfSpeech: 'noun' },
  { simplified: '方案', pinyin: 'fāngàn', meaning: 'plan; scheme', hskLevel: 5, frequency: 875, partOfSpeech: 'noun' },
  { simplified: '策略', pinyin: 'cèlüè', meaning: 'strategy; tactic', hskLevel: 5, frequency: 876, partOfSpeech: 'noun' },
  { simplified: '范围', traditional: '範圍', pinyin: 'fànwéi', meaning: 'scope; range', hskLevel: 5, frequency: 877, partOfSpeech: 'noun' },
  { simplified: '程度', pinyin: 'chéngdù', meaning: 'degree; extent; level', hskLevel: 5, frequency: 878, partOfSpeech: 'noun' },
  { simplified: '比例', pinyin: 'bǐlì', meaning: 'ratio; proportion', hskLevel: 5, frequency: 879, partOfSpeech: 'noun' },
  { simplified: '趋势', traditional: '趨勢', pinyin: 'qūshì', meaning: 'trend; tendency', hskLevel: 5, frequency: 880, partOfSpeech: 'noun' },
  { simplified: '现象', traditional: '現象', pinyin: 'xiànxiàng', meaning: 'phenomenon', hskLevel: 5, frequency: 881, partOfSpeech: 'noun' },
  { simplified: '背景', pinyin: 'bèijǐng', meaning: 'background; context', hskLevel: 5, frequency: 882, partOfSpeech: 'noun' },
  { simplified: '因素', pinyin: 'yīnsù', meaning: 'factor; element', hskLevel: 5, frequency: 883, partOfSpeech: 'noun' },
  { simplified: '途径', traditional: '途徑', pinyin: 'tújìng', meaning: 'way; channel; path', hskLevel: 5, frequency: 884, partOfSpeech: 'noun' },
  { simplified: '角度', pinyin: 'jiǎodù', meaning: 'angle; perspective', hskLevel: 5, frequency: 885, partOfSpeech: 'noun' },
  { simplified: '层次', traditional: '層次', pinyin: 'céngcì', meaning: 'level; hierarchy', hskLevel: 5, frequency: 886, partOfSpeech: 'noun' },

  // ═══════════════════════════════════════════
  // HSK 6 Extra (~100 more)
  // ═══════════════════════════════════════════
  { simplified: '渊博', traditional: '淵博', pinyin: 'yuānbó', meaning: 'erudite; learned', hskLevel: 6, frequency: 1050, partOfSpeech: 'adjective' },
  { simplified: '渺小', pinyin: 'miǎoxiǎo', meaning: 'tiny; insignificant', hskLevel: 6, frequency: 1051, partOfSpeech: 'adjective' },
  { simplified: '庞大', traditional: '龐大', pinyin: 'pángdà', meaning: 'huge; enormous', hskLevel: 6, frequency: 1052, partOfSpeech: 'adjective' },
  { simplified: '浩瀚', pinyin: 'hàohàn', meaning: 'vast; boundless', hskLevel: 6, frequency: 1053, partOfSpeech: 'adjective' },
  { simplified: '绚丽', traditional: '絢麗', pinyin: 'xuànlì', meaning: 'gorgeous; magnificent', hskLevel: 6, frequency: 1054, partOfSpeech: 'adjective' },
  { simplified: '朴素', traditional: '樸素', pinyin: 'pǔsù', meaning: 'plain; simple; austere', hskLevel: 6, frequency: 1055, partOfSpeech: 'adjective' },
  { simplified: '端庄', traditional: '端莊', pinyin: 'duānzhuāng', meaning: 'dignified; elegant', hskLevel: 6, frequency: 1056, partOfSpeech: 'adjective' },
  { simplified: '憎恨', pinyin: 'zēnghèn', meaning: 'to hate; to detest', hskLevel: 6, frequency: 1057, partOfSpeech: 'verb' },
  { simplified: '渴望', pinyin: 'kěwàng', meaning: 'to long for; to yearn for', hskLevel: 6, frequency: 1058, partOfSpeech: 'verb' },
  { simplified: '珍惜', pinyin: 'zhēnxī', meaning: 'to cherish; to treasure', hskLevel: 6, frequency: 1059, partOfSpeech: 'verb' },
  { simplified: '领悟', traditional: '領悟', pinyin: 'lǐngwù', meaning: 'to comprehend; to grasp', hskLevel: 6, frequency: 1060, partOfSpeech: 'verb' },
  { simplified: '感悟', pinyin: 'gǎnwù', meaning: 'to perceive; realization', hskLevel: 6, frequency: 1061, partOfSpeech: 'verb/noun' },
  { simplified: '铭记', traditional: '銘記', pinyin: 'míngjì', meaning: 'to engrave in memory; to remember', hskLevel: 6, frequency: 1062, partOfSpeech: 'verb' },
  { simplified: '瞻仰', pinyin: 'zhānyǎng', meaning: 'to look up to with reverence', hskLevel: 6, frequency: 1063, partOfSpeech: 'verb' },
  { simplified: '追溯', pinyin: 'zhuīsù', meaning: 'to trace back; to date back to', hskLevel: 6, frequency: 1064, partOfSpeech: 'verb' },
  { simplified: '凝聚', pinyin: 'níngjù', meaning: 'to condense; to unite', hskLevel: 6, frequency: 1065, partOfSpeech: 'verb' },
  { simplified: '捍卫', traditional: '捍衛', pinyin: 'hànwèi', meaning: 'to defend; to safeguard', hskLevel: 6, frequency: 1066, partOfSpeech: 'verb' },
  { simplified: '驾驭', traditional: '駕馭', pinyin: 'jiàyù', meaning: 'to control; to master', hskLevel: 6, frequency: 1067, partOfSpeech: 'verb' },
  { simplified: '洞察', pinyin: 'dòngchá', meaning: 'to see through; insight', hskLevel: 6, frequency: 1068, partOfSpeech: 'verb' },
  { simplified: '根深蒂固', pinyin: 'gēn shēn dì gù', meaning: 'deep-rooted; ingrained', hskLevel: 6, frequency: 1069, partOfSpeech: 'idiom' },
  { simplified: '潜移默化', traditional: '潛移默化', pinyin: 'qián yí mò huà', meaning: 'to influence subtly', hskLevel: 6, frequency: 1070, partOfSpeech: 'idiom' },
  { simplified: '循序渐进', traditional: '循序漸進', pinyin: 'xún xù jiàn jìn', meaning: 'to proceed step by step', hskLevel: 6, frequency: 1071, partOfSpeech: 'idiom' },
  { simplified: '博大精深', pinyin: 'bó dà jīng shēn', meaning: 'broad and profound', hskLevel: 6, frequency: 1072, partOfSpeech: 'idiom' },
  { simplified: '源远流长', traditional: '源遠流長', pinyin: 'yuán yuǎn liú cháng', meaning: 'to have a long history', hskLevel: 6, frequency: 1073, partOfSpeech: 'idiom' },
  { simplified: '举世闻名', traditional: '舉世聞名', pinyin: 'jǔ shì wén míng', meaning: 'world-renowned', hskLevel: 6, frequency: 1074, partOfSpeech: 'idiom' },
  { simplified: '络绎不绝', traditional: '絡繹不絕', pinyin: 'luò yì bù jué', meaning: 'in an endless stream', hskLevel: 6, frequency: 1075, partOfSpeech: 'idiom' },
  { simplified: '无与伦比', traditional: '無與倫比', pinyin: 'wú yǔ lún bǐ', meaning: 'incomparable; unmatched', hskLevel: 6, frequency: 1076, partOfSpeech: 'idiom' },
  { simplified: '刻不容缓', traditional: '刻不容緩', pinyin: 'kè bù róng huǎn', meaning: 'extremely urgent; brook no delay', hskLevel: 6, frequency: 1077, partOfSpeech: 'idiom' },

  // ═══════════════════════════════════════════
  // Extra: Body parts
  // ═══════════════════════════════════════════
  { simplified: '心', pinyin: 'xīn', meaning: 'heart; mind', frequency: 1600, partOfSpeech: 'noun' },
  { simplified: '肚子', pinyin: 'dùzi', meaning: 'stomach; belly', frequency: 1601, partOfSpeech: 'noun' },
  { simplified: '背', pinyin: 'bèi', meaning: 'back (body)', frequency: 1602, partOfSpeech: 'noun' },
  { simplified: '肩膀', pinyin: 'jiānbǎng', meaning: 'shoulder', frequency: 1603, partOfSpeech: 'noun' },
  { simplified: '膝盖', traditional: '膝蓋', pinyin: 'xīgài', meaning: 'knee', frequency: 1604, partOfSpeech: 'noun' },
  { simplified: '手指', pinyin: 'shǒuzhǐ', meaning: 'finger', frequency: 1605, partOfSpeech: 'noun' },
  { simplified: '耳朵', pinyin: 'ěrduo', meaning: 'ear', frequency: 1606, partOfSpeech: 'noun' },
  { simplified: '鼻子', pinyin: 'bízi', meaning: 'nose', frequency: 1607, partOfSpeech: 'noun' },
  { simplified: '嘴巴', pinyin: 'zuǐba', meaning: 'mouth', frequency: 1608, partOfSpeech: 'noun' },
  { simplified: '牙齿', traditional: '牙齒', pinyin: 'yáchǐ', meaning: 'tooth; teeth', frequency: 1609, partOfSpeech: 'noun' },
  { simplified: '头发', traditional: '頭髮', pinyin: 'tóufa', meaning: 'hair (head)', frequency: 1610, partOfSpeech: 'noun' },
  { simplified: '皮肤', traditional: '皮膚', pinyin: 'pífū', meaning: 'skin', frequency: 1611, partOfSpeech: 'noun' },
  { simplified: '血', pinyin: 'xuè', meaning: 'blood', frequency: 1612, partOfSpeech: 'noun' },
  { simplified: '骨头', traditional: '骨頭', pinyin: 'gǔtou', meaning: 'bone', frequency: 1613, partOfSpeech: 'noun' },

  // ═══════════════════════════════════════════
  // Extra: Professions
  // ═══════════════════════════════════════════
  { simplified: '科学家', traditional: '科學家', pinyin: 'kēxuéjiā', meaning: 'scientist', frequency: 1620, partOfSpeech: 'noun' },
  { simplified: '艺术家', traditional: '藝術家', pinyin: 'yìshùjiā', meaning: 'artist', frequency: 1621, partOfSpeech: 'noun' },
  { simplified: '作家', pinyin: 'zuòjiā', meaning: 'writer; author', frequency: 1622, partOfSpeech: 'noun' },
  { simplified: '记者', traditional: '記者', pinyin: 'jìzhě', meaning: 'journalist; reporter', frequency: 1623, partOfSpeech: 'noun' },
  { simplified: '设计师', traditional: '設計師', pinyin: 'shèjìshī', meaning: 'designer', frequency: 1624, partOfSpeech: 'noun' },
  { simplified: '厨师', traditional: '廚師', pinyin: 'chúshī', meaning: 'cook; chef', frequency: 1625, partOfSpeech: 'noun' },
  { simplified: '司机', traditional: '司機', pinyin: 'sījī', meaning: 'driver', frequency: 1626, partOfSpeech: 'noun' },
  { simplified: '护士', traditional: '護士', pinyin: 'hùshi', meaning: 'nurse', frequency: 1627, partOfSpeech: 'noun' },
  { simplified: '运动员', traditional: '運動員', pinyin: 'yùndòngyuán', meaning: 'athlete', frequency: 1628, partOfSpeech: 'noun' },
  { simplified: '演员', traditional: '演員', pinyin: 'yǎnyuán', meaning: 'actor; actress', frequency: 1629, partOfSpeech: 'noun' },
  { simplified: '歌手', pinyin: 'gēshǒu', meaning: 'singer', frequency: 1630, partOfSpeech: 'noun' },
  { simplified: '导演', traditional: '導演', pinyin: 'dǎoyǎn', meaning: 'director (film)', frequency: 1631, partOfSpeech: 'noun' },
  { simplified: '翻译', traditional: '翻譯', pinyin: 'fānyì', meaning: 'translator; interpreter', frequency: 1632, partOfSpeech: 'noun' },
  { simplified: '商人', pinyin: 'shāngrén', meaning: 'businessman; merchant', frequency: 1633, partOfSpeech: 'noun' },
  { simplified: '农民', traditional: '農民', pinyin: 'nóngmín', meaning: 'farmer; peasant', frequency: 1634, partOfSpeech: 'noun' },
  { simplified: '军人', traditional: '軍人', pinyin: 'jūnrén', meaning: 'military personnel; soldier', frequency: 1635, partOfSpeech: 'noun' },

  // ═══════════════════════════════════════════
  // Extra: Places & geography
  // ═══════════════════════════════════════════
  { simplified: '上海', pinyin: 'Shànghǎi', meaning: 'Shanghai', frequency: 1640, partOfSpeech: 'noun' },
  { simplified: '广州', traditional: '廣州', pinyin: 'Guǎngzhōu', meaning: 'Guangzhou', frequency: 1641, partOfSpeech: 'noun' },
  { simplified: '深圳', pinyin: 'Shēnzhèn', meaning: 'Shenzhen', frequency: 1642, partOfSpeech: 'noun' },
  { simplified: '成都', pinyin: 'Chéngdū', meaning: 'Chengdu', frequency: 1643, partOfSpeech: 'noun' },
  { simplified: '西安', pinyin: 'Xīān', meaning: 'Xi\'an', frequency: 1644, partOfSpeech: 'noun' },
  { simplified: '杭州', pinyin: 'Hángzhōu', meaning: 'Hangzhou', frequency: 1645, partOfSpeech: 'noun' },
  { simplified: '南京', pinyin: 'Nánjīng', meaning: 'Nanjing', frequency: 1646, partOfSpeech: 'noun' },
  { simplified: '长城', traditional: '長城', pinyin: 'Chángchéng', meaning: 'Great Wall', frequency: 1647, partOfSpeech: 'noun' },
  { simplified: '故宫', traditional: '故宮', pinyin: 'Gùgōng', meaning: 'Forbidden City', frequency: 1648, partOfSpeech: 'noun' },
  { simplified: '天安门', traditional: '天安門', pinyin: 'Tiānānmén', meaning: 'Tiananmen', frequency: 1649, partOfSpeech: 'noun' },
  { simplified: '黄河', traditional: '黃河', pinyin: 'Huáng Hé', meaning: 'Yellow River', frequency: 1650, partOfSpeech: 'noun' },
  { simplified: '长江', traditional: '長江', pinyin: 'Cháng Jiāng', meaning: 'Yangtze River', frequency: 1651, partOfSpeech: 'noun' },
  { simplified: '泰山', pinyin: 'Tài Shān', meaning: 'Mount Tai', frequency: 1652, partOfSpeech: 'noun' },
  { simplified: '台湾', traditional: '臺灣', pinyin: 'Táiwān', meaning: 'Taiwan', frequency: 1653, partOfSpeech: 'noun' },
  { simplified: '香港', pinyin: 'Xiānggǎng', meaning: 'Hong Kong', frequency: 1654, partOfSpeech: 'noun' },

  // ═══════════════════════════════════════════
  // Extra: Actions & daily verbs
  // ═══════════════════════════════════════════
  { simplified: '拿', pinyin: 'ná', meaning: 'to take; to hold; to carry', frequency: 1700, partOfSpeech: 'verb' },
  { simplified: '放', pinyin: 'fàng', meaning: 'to put; to release; to let go', frequency: 1701, partOfSpeech: 'verb' },
  { simplified: '拉', pinyin: 'lā', meaning: 'to pull; to drag', frequency: 1702, partOfSpeech: 'verb' },
  { simplified: '推', pinyin: 'tuī', meaning: 'to push', frequency: 1703, partOfSpeech: 'verb' },
  { simplified: '抬', pinyin: 'tái', meaning: 'to lift; to raise', frequency: 1704, partOfSpeech: 'verb' },
  { simplified: '扔', pinyin: 'rēng', meaning: 'to throw; to toss', frequency: 1705, partOfSpeech: 'verb' },
  { simplified: '切', pinyin: 'qiē', meaning: 'to cut; to slice', frequency: 1706, partOfSpeech: 'verb' },
  { simplified: '倒', pinyin: 'dào', meaning: 'to pour; to turn upside down', frequency: 1707, partOfSpeech: 'verb' },
  { simplified: '关', traditional: '關', pinyin: 'guān', meaning: 'to close; to turn off', frequency: 1708, partOfSpeech: 'verb' },
  { simplified: '站', pinyin: 'zhàn', meaning: 'to stand; station', frequency: 1709, partOfSpeech: 'verb/noun' },
  { simplified: '躺', pinyin: 'tǎng', meaning: 'to lie down', frequency: 1710, partOfSpeech: 'verb' },
  { simplified: '蹲', pinyin: 'dūn', meaning: 'to squat; to crouch', frequency: 1711, partOfSpeech: 'verb' },
  { simplified: '跳', pinyin: 'tiào', meaning: 'to jump; to bounce', frequency: 1712, partOfSpeech: 'verb' },
  { simplified: '爬', pinyin: 'pá', meaning: 'to climb; to crawl', frequency: 1713, partOfSpeech: 'verb' },
  { simplified: '游', pinyin: 'yóu', meaning: 'to swim; to travel', frequency: 1714, partOfSpeech: 'verb' },
  { simplified: '飞', traditional: '飛', pinyin: 'fēi', meaning: 'to fly', frequency: 1715, partOfSpeech: 'verb' },
  { simplified: '掉', pinyin: 'diào', meaning: 'to fall; to drop; to lose', frequency: 1716, partOfSpeech: 'verb' },
  { simplified: '碰', pinyin: 'pèng', meaning: 'to touch; to bump into', frequency: 1717, partOfSpeech: 'verb' },
  { simplified: '猜', pinyin: 'cāi', meaning: 'to guess', frequency: 1718, partOfSpeech: 'verb' },
  { simplified: '骗', traditional: '騙', pinyin: 'piàn', meaning: 'to deceive; to cheat', frequency: 1719, partOfSpeech: 'verb' },
  { simplified: '借', pinyin: 'jiè', meaning: 'to borrow; to lend', frequency: 1720, partOfSpeech: 'verb' },
  { simplified: '还', traditional: '還', pinyin: 'huán', meaning: 'to return (something)', frequency: 1721, partOfSpeech: 'verb' },
  { simplified: '换', traditional: '換', pinyin: 'huàn', meaning: 'to change; to exchange', frequency: 1722, partOfSpeech: 'verb' },
  { simplified: '修', pinyin: 'xiū', meaning: 'to fix; to repair; to build', frequency: 1723, partOfSpeech: 'verb' },
  { simplified: '建', pinyin: 'jiàn', meaning: 'to build; to construct', frequency: 1724, partOfSpeech: 'verb' },
  { simplified: '种', traditional: '種', pinyin: 'zhòng', meaning: 'to plant; to grow', frequency: 1725, partOfSpeech: 'verb' },
  { simplified: '养', traditional: '養', pinyin: 'yǎng', meaning: 'to raise; to keep (pets)', frequency: 1726, partOfSpeech: 'verb' },

  // ═══════════════════════════════════════════
  // Extra: Time expressions
  // ═══════════════════════════════════════════
  { simplified: '以前', pinyin: 'yǐqián', meaning: 'before; ago; previously', frequency: 1730, partOfSpeech: 'noun' },
  { simplified: '以后', traditional: '以後', pinyin: 'yǐhòu', meaning: 'after; afterwards; later', frequency: 1731, partOfSpeech: 'noun' },
  { simplified: '刚刚', traditional: '剛剛', pinyin: 'gānggāng', meaning: 'just now; a moment ago', frequency: 1732, partOfSpeech: 'adverb' },
  { simplified: '马上', traditional: '馬上', pinyin: 'mǎshàng', meaning: 'immediately; at once', frequency: 1733, partOfSpeech: 'adverb' },
  { simplified: '后天', traditional: '後天', pinyin: 'hòutiān', meaning: 'day after tomorrow', frequency: 1734, partOfSpeech: 'noun' },
  { simplified: '前天', pinyin: 'qiántiān', meaning: 'day before yesterday', frequency: 1735, partOfSpeech: 'noun' },
  { simplified: '明年', pinyin: 'míngnián', meaning: 'next year', frequency: 1736, partOfSpeech: 'noun' },
  { simplified: '平时', traditional: '平時', pinyin: 'píngshí', meaning: 'usually; ordinarily', frequency: 1737, partOfSpeech: 'adverb' },
  { simplified: '有时候', traditional: '有時候', pinyin: 'yǒu shíhou', meaning: 'sometimes', frequency: 1738, partOfSpeech: 'adverb' },
  { simplified: '从来', traditional: '從來', pinyin: 'cónglái', meaning: 'always; never (with 不/没)', frequency: 1739, partOfSpeech: 'adverb' },
  { simplified: '将来', traditional: '將來', pinyin: 'jiānglái', meaning: 'in the future', frequency: 1740, partOfSpeech: 'noun' },
  { simplified: '最近', pinyin: 'zuìjìn', meaning: 'recently; lately', frequency: 1741, partOfSpeech: 'adverb' },
  { simplified: '永久', pinyin: 'yǒngjiǔ', meaning: 'permanent; everlasting', frequency: 1742, partOfSpeech: 'adjective' },

  // ═══════════════════════════════════════════
  // Extra: Materials & objects
  // ═══════════════════════════════════════════
  { simplified: '铁', traditional: '鐵', pinyin: 'tiě', meaning: 'iron', frequency: 1750, partOfSpeech: 'noun' },
  { simplified: '钢', traditional: '鋼', pinyin: 'gāng', meaning: 'steel', frequency: 1751, partOfSpeech: 'noun' },
  { simplified: '铜', traditional: '銅', pinyin: 'tóng', meaning: 'copper; bronze', frequency: 1752, partOfSpeech: 'noun' },
  { simplified: '木头', traditional: '木頭', pinyin: 'mùtou', meaning: 'wood; log', frequency: 1753, partOfSpeech: 'noun' },
  { simplified: '石头', traditional: '石頭', pinyin: 'shítou', meaning: 'stone; rock', frequency: 1754, partOfSpeech: 'noun' },
  { simplified: '玻璃', pinyin: 'bōli', meaning: 'glass', frequency: 1755, partOfSpeech: 'noun' },
  { simplified: '塑料', pinyin: 'sùliào', meaning: 'plastic', frequency: 1756, partOfSpeech: 'noun' },
  { simplified: '纸', traditional: '紙', pinyin: 'zhǐ', meaning: 'paper', frequency: 1757, partOfSpeech: 'noun' },
  { simplified: '布', pinyin: 'bù', meaning: 'cloth; fabric', frequency: 1758, partOfSpeech: 'noun' },
  { simplified: '丝绸', traditional: '絲綢', pinyin: 'sīchóu', meaning: 'silk', frequency: 1759, partOfSpeech: 'noun' },
  { simplified: '棉花', pinyin: 'miánhua', meaning: 'cotton', frequency: 1760, partOfSpeech: 'noun' },
  { simplified: '钥匙', traditional: '鑰匙', pinyin: 'yàoshi', meaning: 'key', frequency: 1761, partOfSpeech: 'noun' },
  { simplified: '窗户', traditional: '窗戶', pinyin: 'chuānghu', meaning: 'window', frequency: 1762, partOfSpeech: 'noun' },
  { simplified: '墙', traditional: '牆', pinyin: 'qiáng', meaning: 'wall', frequency: 1763, partOfSpeech: 'noun' },
  { simplified: '楼梯', traditional: '樓梯', pinyin: 'lóutī', meaning: 'stairs; staircase', frequency: 1764, partOfSpeech: 'noun' },
  { simplified: '电梯', traditional: '電梯', pinyin: 'diàntī', meaning: 'elevator; lift', frequency: 1765, partOfSpeech: 'noun' },
  { simplified: '厨房', traditional: '廚房', pinyin: 'chúfáng', meaning: 'kitchen', frequency: 1766, partOfSpeech: 'noun' },
  { simplified: '卧室', traditional: '臥室', pinyin: 'wòshì', meaning: 'bedroom', frequency: 1767, partOfSpeech: 'noun' },
  { simplified: '客厅', traditional: '客廳', pinyin: 'kètīng', meaning: 'living room', frequency: 1768, partOfSpeech: 'noun' },
  { simplified: '浴室', pinyin: 'yùshì', meaning: 'bathroom', frequency: 1769, partOfSpeech: 'noun' },
  { simplified: '阳台', traditional: '陽臺', pinyin: 'yángtái', meaning: 'balcony', frequency: 1770, partOfSpeech: 'noun' },
];

// Filter out entries that already exist
const newEntries = entries.filter(e => !existingSet.has(e.simplified));

if (newEntries.length === 0) {
  console.log('⚠️  All entries already exist. Nothing to add.');
  db.close();
  process.exit(0);
}

const insert = db.prepare(`
  INSERT INTO dictionary_entries (simplified, traditional, pinyin, meaning, hsk_level, frequency, part_of_speech)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((rows: DictEntry[]) => {
  for (const r of rows) {
    insert.run(r.simplified, r.traditional ?? null, r.pinyin, r.meaning, r.hskLevel ?? null, r.frequency ?? null, r.partOfSpeech ?? null);
  }
});

console.log(`📚 Adding ${newEntries.length} new entries (${entries.length - newEntries.length} duplicates skipped)...`);
insertMany(newEntries);

const finalCount = db.prepare('SELECT COUNT(*) as count FROM dictionary_entries').get() as { count: number };
console.log(`✅ Done! Total: ${finalCount.count} entries in dictionary_entries.`);

db.close();

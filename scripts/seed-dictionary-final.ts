/**
 * Final push to 1000 entries.
 * Run: npx tsx scripts/seed-dictionary-final.ts
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

const existingRows = db.prepare('SELECT simplified FROM dictionary_entries').all() as { simplified: string }[];
const existingSet = new Set(existingRows.map(r => r.simplified));

const entries: DictEntry[] = [
  // Clothing
  { simplified: '裙子', pinyin: 'qúnzi', meaning: 'skirt; dress', hskLevel: 3, frequency: 1900, partOfSpeech: 'noun' },
  { simplified: '裤子', traditional: '褲子', pinyin: 'kùzi', meaning: 'pants; trousers', hskLevel: 2, frequency: 1901, partOfSpeech: 'noun' },
  { simplified: '帽子', pinyin: 'màozi', meaning: 'hat; cap', hskLevel: 2, frequency: 1902, partOfSpeech: 'noun' },
  { simplified: '鞋子', pinyin: 'xiézi', meaning: 'shoes', hskLevel: 2, frequency: 1903, partOfSpeech: 'noun' },
  { simplified: '袜子', traditional: '襪子', pinyin: 'wàzi', meaning: 'socks', hskLevel: 3, frequency: 1904, partOfSpeech: 'noun' },
  { simplified: '眼镜', traditional: '眼鏡', pinyin: 'yǎnjìng', meaning: 'glasses; spectacles', hskLevel: 3, frequency: 1905, partOfSpeech: 'noun' },
  { simplified: '手表', traditional: '手錶', pinyin: 'shǒubiǎo', meaning: 'wristwatch', hskLevel: 3, frequency: 1906, partOfSpeech: 'noun' },

  // Transportation
  { simplified: '自行车', traditional: '自行車', pinyin: 'zìxíngchē', meaning: 'bicycle', hskLevel: 2, frequency: 1910, partOfSpeech: 'noun' },
  { simplified: '地铁', traditional: '地鐵', pinyin: 'dìtiě', meaning: 'subway; metro', hskLevel: 2, frequency: 1911, partOfSpeech: 'noun' },
  { simplified: '火车', traditional: '火車', pinyin: 'huǒchē', meaning: 'train', hskLevel: 2, frequency: 1912, partOfSpeech: 'noun' },
  { simplified: '飞机', traditional: '飛機', pinyin: 'fēijī', meaning: 'airplane', hskLevel: 2, frequency: 1913, partOfSpeech: 'noun' },
  { simplified: '轮船', traditional: '輪船', pinyin: 'lúnchuán', meaning: 'steamship; ocean liner', hskLevel: 4, frequency: 1914, partOfSpeech: 'noun' },
  { simplified: '出租车', traditional: '出租車', pinyin: 'chūzūchē', meaning: 'taxi', hskLevel: 2, frequency: 1915, partOfSpeech: 'noun' },
  { simplified: '高铁', traditional: '高鐵', pinyin: 'gāotiě', meaning: 'high-speed rail', hskLevel: 4, frequency: 1916, partOfSpeech: 'noun' },

  // Directions & Spatial
  { simplified: '东', traditional: '東', pinyin: 'dōng', meaning: 'east', hskLevel: 2, frequency: 1920, partOfSpeech: 'noun' },
  { simplified: '西', pinyin: 'xī', meaning: 'west', hskLevel: 2, frequency: 1921, partOfSpeech: 'noun' },
  { simplified: '南', pinyin: 'nán', meaning: 'south', hskLevel: 2, frequency: 1922, partOfSpeech: 'noun' },
  { simplified: '北', pinyin: 'běi', meaning: 'north', hskLevel: 2, frequency: 1923, partOfSpeech: 'noun' },
  { simplified: '中间', traditional: '中間', pinyin: 'zhōngjiān', meaning: 'middle; between', hskLevel: 2, frequency: 1924, partOfSpeech: 'noun' },
  { simplified: '对面', traditional: '對面', pinyin: 'duìmiàn', meaning: 'opposite side', hskLevel: 3, frequency: 1925, partOfSpeech: 'noun' },
  { simplified: '附近', pinyin: 'fùjìn', meaning: 'nearby; vicinity', hskLevel: 2, frequency: 1926, partOfSpeech: 'noun' },

  // Colors
  { simplified: '红色', traditional: '紅色', pinyin: 'hóngsè', meaning: 'red', hskLevel: 1, frequency: 1930, partOfSpeech: 'noun' },
  { simplified: '蓝色', traditional: '藍色', pinyin: 'lánsè', meaning: 'blue', hskLevel: 2, frequency: 1931, partOfSpeech: 'noun' },
  { simplified: '绿色', traditional: '綠色', pinyin: 'lǜsè', meaning: 'green', hskLevel: 2, frequency: 1932, partOfSpeech: 'noun' },
  { simplified: '黄色', traditional: '黃色', pinyin: 'huángsè', meaning: 'yellow', hskLevel: 2, frequency: 1933, partOfSpeech: 'noun' },
  { simplified: '白色', pinyin: 'báisè', meaning: 'white', hskLevel: 2, frequency: 1934, partOfSpeech: 'noun' },
  { simplified: '黑色', pinyin: 'hēisè', meaning: 'black', hskLevel: 2, frequency: 1935, partOfSpeech: 'noun' },
  { simplified: '紫色', pinyin: 'zǐsè', meaning: 'purple', hskLevel: 3, frequency: 1936, partOfSpeech: 'noun' },
  { simplified: '粉色', pinyin: 'fěnsè', meaning: 'pink', hskLevel: 3, frequency: 1937, partOfSpeech: 'noun' },
  { simplified: '橙色', pinyin: 'chéngsè', meaning: 'orange (color)', hskLevel: 3, frequency: 1938, partOfSpeech: 'noun' },
  { simplified: '灰色', pinyin: 'huīsè', meaning: 'grey', hskLevel: 3, frequency: 1939, partOfSpeech: 'noun' },

  // Family extra
  { simplified: '爷爷', traditional: '爺爺', pinyin: 'yéye', meaning: 'grandfather (paternal)', hskLevel: 2, frequency: 1940, partOfSpeech: 'noun' },
  { simplified: '奶奶', pinyin: 'nǎinai', meaning: 'grandmother (paternal)', hskLevel: 2, frequency: 1941, partOfSpeech: 'noun' },
  { simplified: '叔叔', pinyin: 'shūshu', meaning: 'uncle (father\'s younger brother)', hskLevel: 3, frequency: 1942, partOfSpeech: 'noun' },
  { simplified: '阿姨', pinyin: 'āyí', meaning: 'aunt; auntie', hskLevel: 2, frequency: 1943, partOfSpeech: 'noun' },
  { simplified: '邻居', traditional: '鄰居', pinyin: 'línjū', meaning: 'neighbor', hskLevel: 3, frequency: 1944, partOfSpeech: 'noun' },

  // Misc useful words
  { simplified: '钥匙', traditional: '鑰匙', pinyin: 'yàoshi', meaning: 'key', hskLevel: 3, frequency: 1950, partOfSpeech: 'noun' },
  { simplified: '雨伞', traditional: '雨傘', pinyin: 'yǔsǎn', meaning: 'umbrella', hskLevel: 3, frequency: 1951, partOfSpeech: 'noun' },
  { simplified: '护照', traditional: '護照', pinyin: 'hùzhào', meaning: 'passport', hskLevel: 3, frequency: 1952, partOfSpeech: 'noun' },
  { simplified: '信用卡', pinyin: 'xìnyòngkǎ', meaning: 'credit card', hskLevel: 3, frequency: 1953, partOfSpeech: 'noun' },
  { simplified: '行李', pinyin: 'xíngli', meaning: 'luggage; baggage', hskLevel: 3, frequency: 1954, partOfSpeech: 'noun' },
  { simplified: '垃圾', pinyin: 'lājī', meaning: 'trash; garbage', hskLevel: 4, frequency: 1955, partOfSpeech: 'noun' },
  { simplified: '空调', traditional: '空調', pinyin: 'kōngtiáo', meaning: 'air conditioning', hskLevel: 3, frequency: 1956, partOfSpeech: 'noun' },
  { simplified: '暖气', traditional: '暖氣', pinyin: 'nuǎnqì', meaning: 'heating', hskLevel: 4, frequency: 1957, partOfSpeech: 'noun' },
  { simplified: '洗衣机', traditional: '洗衣機', pinyin: 'xǐyījī', meaning: 'washing machine', hskLevel: 3, frequency: 1958, partOfSpeech: 'noun' },
  { simplified: '冰箱', pinyin: 'bīngxiāng', meaning: 'refrigerator', hskLevel: 3, frequency: 1959, partOfSpeech: 'noun' },
];

const newEntries = entries.filter(e => !existingSet.has(e.simplified));

if (newEntries.length === 0) {
  console.log('⚠️  All entries already exist.');
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

console.log(`📚 Adding ${newEntries.length} entries...`);
insertMany(newEntries);

const finalCount = db.prepare('SELECT COUNT(*) as count FROM dictionary_entries').get() as { count: number };
console.log(`✅ Done! Total: ${finalCount.count} entries in dictionary_entries.`);

db.close();

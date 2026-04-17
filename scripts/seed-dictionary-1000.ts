/**
 * Final top-up seed: pushes dictionary to 1000+ entries.
 * Run: npx tsx scripts/seed-dictionary-1000.ts
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
  // Animals
  { simplified: '猫', traditional: '貓', pinyin: 'māo', meaning: 'cat', hskLevel: 2, frequency: 1800, partOfSpeech: 'noun' },
  { simplified: '狗', pinyin: 'gǒu', meaning: 'dog', hskLevel: 2, frequency: 1801, partOfSpeech: 'noun' },
  { simplified: '鸟', traditional: '鳥', pinyin: 'niǎo', meaning: 'bird', hskLevel: 3, frequency: 1802, partOfSpeech: 'noun' },
  { simplified: '鱼', traditional: '魚', pinyin: 'yú', meaning: 'fish', hskLevel: 1, frequency: 1803, partOfSpeech: 'noun' },
  { simplified: '马', traditional: '馬', pinyin: 'mǎ', meaning: 'horse', hskLevel: 2, frequency: 1804, partOfSpeech: 'noun' },
  { simplified: '牛', pinyin: 'niú', meaning: 'cow; ox; cattle', hskLevel: 3, frequency: 1805, partOfSpeech: 'noun' },
  { simplified: '羊', pinyin: 'yáng', meaning: 'sheep; goat', hskLevel: 3, frequency: 1806, partOfSpeech: 'noun' },
  { simplified: '猪', traditional: '豬', pinyin: 'zhū', meaning: 'pig', hskLevel: 3, frequency: 1807, partOfSpeech: 'noun' },
  { simplified: '鸡', traditional: '雞', pinyin: 'jī', meaning: 'chicken', hskLevel: 3, frequency: 1808, partOfSpeech: 'noun' },
  { simplified: '蛇', pinyin: 'shé', meaning: 'snake', hskLevel: 4, frequency: 1809, partOfSpeech: 'noun' },
  { simplified: '兔子', pinyin: 'tùzi', meaning: 'rabbit', hskLevel: 3, frequency: 1810, partOfSpeech: 'noun' },
  { simplified: '老虎', pinyin: 'lǎohǔ', meaning: 'tiger', hskLevel: 4, frequency: 1811, partOfSpeech: 'noun' },
  { simplified: '熊猫', traditional: '熊貓', pinyin: 'xióngmāo', meaning: 'panda', hskLevel: 3, frequency: 1812, partOfSpeech: 'noun' },
  { simplified: '蝴蝶', pinyin: 'húdié', meaning: 'butterfly', hskLevel: 4, frequency: 1813, partOfSpeech: 'noun' },

  // Weather & Nature
  { simplified: '太阳', traditional: '太陽', pinyin: 'tàiyáng', meaning: 'sun', hskLevel: 2, frequency: 1820, partOfSpeech: 'noun' },
  { simplified: '月亮', pinyin: 'yuèliang', meaning: 'moon', hskLevel: 2, frequency: 1821, partOfSpeech: 'noun' },
  { simplified: '星星', pinyin: 'xīngxing', meaning: 'star', hskLevel: 3, frequency: 1822, partOfSpeech: 'noun' },
  { simplified: '风', traditional: '風', pinyin: 'fēng', meaning: 'wind', hskLevel: 2, frequency: 1823, partOfSpeech: 'noun' },
  { simplified: '雨', pinyin: 'yǔ', meaning: 'rain', hskLevel: 2, frequency: 1824, partOfSpeech: 'noun' },
  { simplified: '雪', pinyin: 'xuě', meaning: 'snow', hskLevel: 2, frequency: 1825, partOfSpeech: 'noun' },
  { simplified: '云', traditional: '雲', pinyin: 'yún', meaning: 'cloud', hskLevel: 3, frequency: 1826, partOfSpeech: 'noun' },
  { simplified: '雷', pinyin: 'léi', meaning: 'thunder', hskLevel: 4, frequency: 1827, partOfSpeech: 'noun' },
  { simplified: '彩虹', pinyin: 'cǎihóng', meaning: 'rainbow', hskLevel: 4, frequency: 1828, partOfSpeech: 'noun' },
  { simplified: '海', pinyin: 'hǎi', meaning: 'sea; ocean', hskLevel: 2, frequency: 1829, partOfSpeech: 'noun' },
  { simplified: '山', pinyin: 'shān', meaning: 'mountain; hill', hskLevel: 2, frequency: 1830, partOfSpeech: 'noun' },
  { simplified: '湖', pinyin: 'hú', meaning: 'lake', hskLevel: 3, frequency: 1831, partOfSpeech: 'noun' },
  { simplified: '森林', pinyin: 'sēnlín', meaning: 'forest', hskLevel: 4, frequency: 1832, partOfSpeech: 'noun' },
  { simplified: '沙漠', pinyin: 'shāmò', meaning: 'desert', hskLevel: 5, frequency: 1833, partOfSpeech: 'noun' },
  { simplified: '草', pinyin: 'cǎo', meaning: 'grass', hskLevel: 3, frequency: 1834, partOfSpeech: 'noun' },
  { simplified: '花', pinyin: 'huā', meaning: 'flower', hskLevel: 2, frequency: 1835, partOfSpeech: 'noun' },

  // Food & Drink
  { simplified: '米饭', traditional: '米飯', pinyin: 'mǐfàn', meaning: 'cooked rice', hskLevel: 1, frequency: 1840, partOfSpeech: 'noun' },
  { simplified: '面条', traditional: '麵條', pinyin: 'miàntiáo', meaning: 'noodles', hskLevel: 2, frequency: 1841, partOfSpeech: 'noun' },
  { simplified: '饺子', traditional: '餃子', pinyin: 'jiǎozi', meaning: 'dumplings', hskLevel: 2, frequency: 1842, partOfSpeech: 'noun' },
  { simplified: '包子', pinyin: 'bāozi', meaning: 'steamed bun', hskLevel: 3, frequency: 1843, partOfSpeech: 'noun' },
  { simplified: '豆腐', pinyin: 'dòufu', meaning: 'tofu', hskLevel: 3, frequency: 1844, partOfSpeech: 'noun' },
  { simplified: '鸡蛋', traditional: '雞蛋', pinyin: 'jīdàn', meaning: 'egg', hskLevel: 2, frequency: 1845, partOfSpeech: 'noun' },
  { simplified: '蔬菜', pinyin: 'shūcài', meaning: 'vegetables', hskLevel: 3, frequency: 1846, partOfSpeech: 'noun' },
  { simplified: '水果', pinyin: 'shuǐguǒ', meaning: 'fruit', hskLevel: 2, frequency: 1847, partOfSpeech: 'noun' },
  { simplified: '糖', pinyin: 'táng', meaning: 'sugar; candy', hskLevel: 3, frequency: 1848, partOfSpeech: 'noun' },
  { simplified: '盐', traditional: '鹽', pinyin: 'yán', meaning: 'salt', hskLevel: 3, frequency: 1849, partOfSpeech: 'noun' },
  { simplified: '醋', pinyin: 'cù', meaning: 'vinegar', hskLevel: 4, frequency: 1850, partOfSpeech: 'noun' },
  { simplified: '酱油', traditional: '醬油', pinyin: 'jiàngyóu', meaning: 'soy sauce', hskLevel: 4, frequency: 1851, partOfSpeech: 'noun' },
  { simplified: '面包', traditional: '麵包', pinyin: 'miànbāo', meaning: 'bread', hskLevel: 2, frequency: 1852, partOfSpeech: 'noun' },
  { simplified: '蛋糕', pinyin: 'dàngāo', meaning: 'cake', hskLevel: 3, frequency: 1853, partOfSpeech: 'noun' },
  { simplified: '冰淇淋', pinyin: 'bīngqílín', meaning: 'ice cream', hskLevel: 3, frequency: 1854, partOfSpeech: 'noun' },
  { simplified: '啤酒', pinyin: 'píjiǔ', meaning: 'beer', hskLevel: 2, frequency: 1855, partOfSpeech: 'noun' },
  { simplified: '葡萄酒', pinyin: 'pútáojiǔ', meaning: 'wine', hskLevel: 4, frequency: 1856, partOfSpeech: 'noun' },
  { simplified: '果汁', pinyin: 'guǒzhī', meaning: 'juice', hskLevel: 3, frequency: 1857, partOfSpeech: 'noun' },

  // Emotions & States
  { simplified: '害怕', pinyin: 'hàipà', meaning: 'to be afraid; scared', hskLevel: 3, frequency: 1860, partOfSpeech: 'verb' },
  { simplified: '着急', traditional: '著急', pinyin: 'zháojí', meaning: 'anxious; worried', hskLevel: 3, frequency: 1861, partOfSpeech: 'adjective' },
  { simplified: '孤独', traditional: '孤獨', pinyin: 'gūdú', meaning: 'lonely; solitary', hskLevel: 5, frequency: 1862, partOfSpeech: 'adjective' },
  { simplified: '骄傲', traditional: '驕傲', pinyin: 'jiāoào', meaning: 'proud; arrogant', hskLevel: 4, frequency: 1863, partOfSpeech: 'adjective' },
  { simplified: '惊讶', traditional: '驚訝', pinyin: 'jīngyà', meaning: 'surprised; amazed', hskLevel: 4, frequency: 1864, partOfSpeech: 'adjective' },
  { simplified: '满意', traditional: '滿意', pinyin: 'mǎnyì', meaning: 'satisfied; pleased', hskLevel: 4, frequency: 1865, partOfSpeech: 'adjective' },
  { simplified: '失望', pinyin: 'shīwàng', meaning: 'disappointed', hskLevel: 4, frequency: 1866, partOfSpeech: 'adjective' },
  { simplified: '兴奋', traditional: '興奮', pinyin: 'xīngfèn', meaning: 'excited', hskLevel: 4, frequency: 1867, partOfSpeech: 'adjective' },
  { simplified: '紧张', traditional: '緊張', pinyin: 'jǐnzhāng', meaning: 'nervous; tense', hskLevel: 3, frequency: 1868, partOfSpeech: 'adjective' },
  { simplified: '感动', traditional: '感動', pinyin: 'gǎndòng', meaning: 'moved; touched', hskLevel: 4, frequency: 1869, partOfSpeech: 'adjective' },

  // Technology
  { simplified: '电脑', traditional: '電腦', pinyin: 'diànnǎo', meaning: 'computer', hskLevel: 2, frequency: 1870, partOfSpeech: 'noun' },
  { simplified: '手机', traditional: '手機', pinyin: 'shǒujī', meaning: 'cellphone; mobile phone', hskLevel: 2, frequency: 1871, partOfSpeech: 'noun' },
  { simplified: '网络', traditional: '網絡', pinyin: 'wǎngluò', meaning: 'network; internet', hskLevel: 4, frequency: 1872, partOfSpeech: 'noun' },
  { simplified: '软件', traditional: '軟件', pinyin: 'ruǎnjiàn', meaning: 'software', hskLevel: 5, frequency: 1873, partOfSpeech: 'noun' },
  { simplified: '数据', traditional: '數據', pinyin: 'shùjù', meaning: 'data', hskLevel: 5, frequency: 1874, partOfSpeech: 'noun' },
  { simplified: '密码', traditional: '密碼', pinyin: 'mìmǎ', meaning: 'password', hskLevel: 4, frequency: 1875, partOfSpeech: 'noun' },
  { simplified: '下载', traditional: '下載', pinyin: 'xiàzǎi', meaning: 'to download', hskLevel: 4, frequency: 1876, partOfSpeech: 'verb' },
  { simplified: '网站', traditional: '網站', pinyin: 'wǎngzhàn', meaning: 'website', hskLevel: 4, frequency: 1877, partOfSpeech: 'noun' },
  { simplified: '搜索', pinyin: 'sōusuǒ', meaning: 'to search (online)', hskLevel: 4, frequency: 1878, partOfSpeech: 'verb' },
  { simplified: '人工智能', pinyin: 'réngōng zhìnéng', meaning: 'artificial intelligence; AI', hskLevel: 6, frequency: 1879, partOfSpeech: 'noun' },
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

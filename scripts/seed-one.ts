import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'local.db'));
db.prepare(
  `INSERT INTO dictionary_entries (simplified, traditional, pinyin, meaning, hsk_level, frequency, part_of_speech) VALUES (?, ?, ?, ?, ?, ?, ?)`
).run('电梯', '電梯', 'diàntī', 'elevator; lift', 3, 1960, 'noun');

const c = db.prepare('SELECT COUNT(*) as count FROM dictionary_entries').get() as { count: number };
console.log('✅ Total:', c.count);
db.close();

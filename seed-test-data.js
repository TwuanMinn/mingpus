const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'local.db');
const db = new Database(dbPath);

console.log('Seeding test data for the user...');

const user = db.prepare('SELECT id FROM user LIMIT 1').get();
if (!user) {
  console.log('No user found! Please register/login first.');
  process.exit();
}

const userId = user.id;

// Create Decks
const insertDeck = db.prepare('INSERT INTO decks (user_id, title, description, created_at) VALUES (?, ?, ?, ?) RETURNING id');
const hsk1Deck = insertDeck.get(userId, 'HSK 1 Vocabulary', 'Basic Chinese characters for beginners', Date.now());
const radicalsDeck = insertDeck.get(userId, 'Common Radicals', 'Essential building blocks of characters', Date.now());

const insertCard = db.prepare('INSERT INTO flashcards (deck_id, character, pinyin, meaning, strokes, hsk_level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id');

const cards = [
  // HSK 1
  [hsk1Deck.id, '学', 'xué', 'to study; to learn', 8, 1],
  [hsk1Deck.id, '人', 'rén', 'person; people', 2, 1],
  [hsk1Deck.id, '大', 'dà', 'big; large', 3, 1],
  [hsk1Deck.id, '中', 'zhōng', 'middle; center', 4, 1],
  [hsk1Deck.id, '好', 'hǎo', 'good; well', 6, 1],
  [hsk1Deck.id, '天', 'tiān', 'sky; day', 4, 1],

  // Radicals
  [radicalsDeck.id, '水', 'shuǐ', 'water (radical: 氵)', 4, 1],
  [radicalsDeck.id, '心', 'xīn', 'heart (radical: 忄)', 4, 1],
  [radicalsDeck.id, '火', 'huǒ', 'fire (radical: 灬)', 4, 1],
  [radicalsDeck.id, '日', 'rì', 'sun; day', 4, 1],
  [radicalsDeck.id, '月', 'yuè', 'moon; month', 4, 1]
];

const insertCardStmt = db.transaction((cards) => {
  for (const card of cards) {
    insertCard.get(...card, Date.now());
  }
});

insertCardStmt(cards);

console.log('✅ Test decks and flashcards have been seeded!');
db.close();

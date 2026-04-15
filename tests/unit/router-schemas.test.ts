import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Tests the tRPC router input validation schemas in isolation.
 * These test the Zod schemas used by each endpoint without needing
 * a database or auth context, verifying contract enforcement.
 *
 * Schemas mirror the router files in src/server/routers/*.ts
 */

// ─── Deck Router Schemas ───
const createDeckSchema = z.object({ title: z.string().min(1).max(200), description: z.string().max(1000).optional() });
const deleteDeckSchema = z.object({ id: z.number() });

// ─── Flashcard Router Schemas ───
const getCardsForDeckSchema = z.object({ deckId: z.number() });
const addCardSchema = z.object({
  deckId: z.number(),
  character: z.string().min(1).max(50),
  pinyin: z.string().min(1).max(200),
  meaning: z.string().min(1).max(500),
  strokes: z.number().optional(),
  hskLevel: z.number().optional(),
});
const deleteCardSchema = z.object({ id: z.number() });

// ─── Practice Router Schemas ───
const getDueCardsSchema = z.object({ limit: z.number().min(1).max(100).default(20) });
const submitReviewSchema = z.object({
  progressId: z.number(),
  quality: z.number().min(0).max(5),
});

// ─── Dictionary Router Schemas ───
const searchSchema = z.object({ query: z.string().max(100), hskLevel: z.number().optional() });

// ─── Quiz Router Schemas ───
const quizSchema = z.object({ count: z.number().min(1).max(50).default(10), hskLevel: z.number().optional() });
const submitQuizAnswerSchema = z.object({
  flashcardId: z.number(),
  selectedAnswer: z.string(),
});

// ─── Import Router Schemas ───
const importCardsSchema = z.object({
  deckId: z.number(),
  cards: z.array(z.object({
    character: z.string().min(1).max(50),
    pinyin: z.string().min(1).max(200),
    meaning: z.string().min(1).max(500),
    strokes: z.number().optional(),
    hskLevel: z.number().optional(),
  })).max(500),
});

describe('tRPC Router — Input Schema Validation', () => {

  describe('createDeck', () => {
    it('accepts valid title + description', () => {
      expect(createDeckSchema.parse({ title: 'HSK 1', description: 'Beginner' }))
        .toEqual({ title: 'HSK 1', description: 'Beginner' });
    });

    it('accepts title without description', () => {
      expect(createDeckSchema.parse({ title: 'My Deck' }))
        .toEqual({ title: 'My Deck' });
    });

    it('rejects empty title', () => {
      expect(() => createDeckSchema.parse({ title: '' })).toThrow();
    });

    it('rejects missing title', () => {
      expect(() => createDeckSchema.parse({})).toThrow();
    });

    it('rejects title exceeding 200 characters', () => {
      expect(() => createDeckSchema.parse({ title: 'a'.repeat(201) })).toThrow();
    });

    it('rejects description exceeding 1000 characters', () => {
      expect(() => createDeckSchema.parse({ title: 'ok', description: 'x'.repeat(1001) })).toThrow();
    });
  });

  describe('deleteDeck', () => {
    it('accepts valid id', () => {
      expect(deleteDeckSchema.parse({ id: 42 })).toEqual({ id: 42 });
    });

    it('rejects string id', () => {
      expect(() => deleteDeckSchema.parse({ id: 'abc' })).toThrow();
    });

    it('rejects missing id', () => {
      expect(() => deleteDeckSchema.parse({})).toThrow();
    });
  });

  describe('addCard', () => {
    it('accepts valid card with all fields', () => {
      const card = { deckId: 1, character: '学', pinyin: 'xué', meaning: 'study', strokes: 8, hskLevel: 1 };
      expect(addCardSchema.parse(card)).toEqual(card);
    });

    it('accepts card without optional fields', () => {
      const card = { deckId: 1, character: '学', pinyin: 'xué', meaning: 'study' };
      expect(addCardSchema.parse(card)).toEqual(card);
    });

    it('rejects empty character', () => {
      expect(() => addCardSchema.parse({ deckId: 1, character: '', pinyin: 'a', meaning: 'b' })).toThrow();
    });

    it('rejects empty pinyin', () => {
      expect(() => addCardSchema.parse({ deckId: 1, character: '学', pinyin: '', meaning: 'b' })).toThrow();
    });

    it('rejects empty meaning', () => {
      expect(() => addCardSchema.parse({ deckId: 1, character: '学', pinyin: 'x', meaning: '' })).toThrow();
    });

    it('rejects missing deckId', () => {
      expect(() => addCardSchema.parse({ character: '学', pinyin: 'x', meaning: 'y' })).toThrow();
    });

    it('rejects character exceeding 50 chars', () => {
      expect(() => addCardSchema.parse({ deckId: 1, character: '字'.repeat(51), pinyin: 'x', meaning: 'y' })).toThrow();
    });

    it('rejects meaning exceeding 500 chars', () => {
      expect(() => addCardSchema.parse({ deckId: 1, character: '字', pinyin: 'x', meaning: 'y'.repeat(501) })).toThrow();
    });
  });

  describe('submitReview', () => {
    it('accepts valid quality values (0-5)', () => {
      for (let q = 0; q <= 5; q++) {
        const result = submitReviewSchema.parse({ progressId: 1, quality: q });
        expect(result.quality).toBe(q);
      }
    });

    it('rejects quality below 0', () => {
      expect(() => submitReviewSchema.parse({ progressId: 1, quality: -1 })).toThrow();
    });

    it('rejects quality above 5', () => {
      expect(() => submitReviewSchema.parse({ progressId: 1, quality: 6 })).toThrow();
    });

    it('rejects non-numeric quality', () => {
      expect(() => submitReviewSchema.parse({ progressId: 1, quality: 'good' })).toThrow();
    });

    it('rejects missing progressId', () => {
      expect(() => submitReviewSchema.parse({ quality: 3 })).toThrow();
    });
  });

  describe('getDueCards', () => {
    it('defaults limit to 20 when not provided', () => {
      expect(getDueCardsSchema.parse({})).toEqual({ limit: 20 });
    });

    it('accepts custom limit', () => {
      expect(getDueCardsSchema.parse({ limit: 50 })).toEqual({ limit: 50 });
    });

    it('rejects limit below 1', () => {
      expect(() => getDueCardsSchema.parse({ limit: 0 })).toThrow();
    });

    it('rejects limit above 100', () => {
      expect(() => getDueCardsSchema.parse({ limit: 101 })).toThrow();
    });
  });

  describe('searchCharacters', () => {
    it('accepts query with hskLevel filter', () => {
      expect(searchSchema.parse({ query: '学', hskLevel: 1 }))
        .toEqual({ query: '学', hskLevel: 1 });
    });

    it('accepts query without hskLevel', () => {
      expect(searchSchema.parse({ query: 'water' })).toEqual({ query: 'water' });
    });

    it('accepts empty query string', () => {
      expect(searchSchema.parse({ query: '' })).toEqual({ query: '' });
    });

    it('rejects missing query', () => {
      expect(() => searchSchema.parse({})).toThrow();
    });

    it('rejects query exceeding 100 characters', () => {
      expect(() => searchSchema.parse({ query: 'x'.repeat(101) })).toThrow();
    });
  });

  describe('getQuizQuestions', () => {
    it('defaults count to 10', () => {
      expect(quizSchema.parse({})).toEqual({ count: 10 });
    });

    it('accepts custom count and hskLevel', () => {
      expect(quizSchema.parse({ count: 20, hskLevel: 3 }))
        .toEqual({ count: 20, hskLevel: 3 });
    });

    it('rejects count below 1', () => {
      expect(() => quizSchema.parse({ count: 0 })).toThrow();
    });

    it('rejects count above 50', () => {
      expect(() => quizSchema.parse({ count: 51 })).toThrow();
    });
  });

  describe('submitQuizAnswer', () => {
    it('accepts valid flashcardId and selectedAnswer', () => {
      expect(submitQuizAnswerSchema.parse({ flashcardId: 42, selectedAnswer: 'study' }))
        .toEqual({ flashcardId: 42, selectedAnswer: 'study' });
    });

    it('rejects missing flashcardId', () => {
      expect(() => submitQuizAnswerSchema.parse({ selectedAnswer: 'study' })).toThrow();
    });

    it('rejects missing selectedAnswer', () => {
      expect(() => submitQuizAnswerSchema.parse({ flashcardId: 42 })).toThrow();
    });

    it('rejects non-numeric flashcardId', () => {
      expect(() => submitQuizAnswerSchema.parse({ flashcardId: 'abc', selectedAnswer: 'study' })).toThrow();
    });
  });

  describe('importCards', () => {
    it('accepts valid import payload', () => {
      const payload = {
        deckId: 1,
        cards: [
          { character: '你', pinyin: 'nǐ', meaning: 'you' },
          { character: '好', pinyin: 'hǎo', meaning: 'good', strokes: 6, hskLevel: 1 },
        ],
      };
      expect(importCardsSchema.parse(payload)).toEqual(payload);
    });

    it('accepts empty cards array', () => {
      expect(importCardsSchema.parse({ deckId: 1, cards: [] }))
        .toEqual({ deckId: 1, cards: [] });
    });

    it('rejects missing deckId', () => {
      expect(() => importCardsSchema.parse({ cards: [] })).toThrow();
    });

    it('rejects invalid card shape inside array', () => {
      expect(() => importCardsSchema.parse({
        deckId: 1,
        cards: [{ invalid: true }],
      })).toThrow();
    });

    it('handles large import batches up to 500', () => {
      const cards = Array.from({ length: 500 }, (_, i) => ({
        character: `字${i}`,
        pinyin: `zì${i}`,
        meaning: `meaning ${i}`,
      }));
      const result = importCardsSchema.parse({ deckId: 1, cards });
      expect(result.cards.length).toBe(500);
    });

    it('rejects batches exceeding 500 cards', () => {
      const cards = Array.from({ length: 501 }, (_, i) => ({
        character: `字${i}`,
        pinyin: `zì${i}`,
        meaning: `meaning ${i}`,
      }));
      expect(() => importCardsSchema.parse({ deckId: 1, cards })).toThrow();
    });

    it('rejects cards with character exceeding max length', () => {
      expect(() => importCardsSchema.parse({
        deckId: 1,
        cards: [{ character: '字'.repeat(51), pinyin: 'zì', meaning: 'character' }],
      })).toThrow();
    });
  });
});

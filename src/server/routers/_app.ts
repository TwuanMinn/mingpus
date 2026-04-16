import { t } from '../trpc';
import { dashboardRouter } from './dashboard';
import { deckRouter } from './deck';
import { flashcardRouter } from './flashcard';
import { practiceRouter } from './practice';
import { dictionaryRouter } from './dictionary';
import { quizRouter } from './quiz';
import { importRouter } from './import';
import { analyticsRouter } from './analytics';
import { featuresRouter } from './features';
import { gamificationRouter } from './gamification';

// mergeRouters keeps a flat namespace so all existing client calls
// (e.g. trpc.getDecks, trpc.submitReview) continue to work unchanged.
export const appRouter = t.mergeRouters(
  dashboardRouter,
  deckRouter,
  flashcardRouter,
  practiceRouter,
  dictionaryRouter,
  quizRouter,
  importRouter,
  analyticsRouter,
  featuresRouter,
  gamificationRouter,
);

export type AppRouter = typeof appRouter;



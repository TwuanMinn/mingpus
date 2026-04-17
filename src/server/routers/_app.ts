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
import { communityRouter } from './community';

// Nested router structure — each router gets its own namespace to prevent
// silent procedure name collisions as the codebase grows.
export const appRouter = t.router({
  dashboard: dashboardRouter,
  deck: deckRouter,
  flashcard: flashcardRouter,
  practice: practiceRouter,
  dictionary: dictionaryRouter,
  quiz: quizRouter,
  import: importRouter,
  analytics: analyticsRouter,
  features: featuresRouter,
  gamification: gamificationRouter,
  community: communityRouter,
});

export type AppRouter = typeof appRouter;

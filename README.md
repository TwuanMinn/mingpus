# Digital Calligrapher 书法

A premium **Chinese language learning** platform built with Next.js 16, featuring spaced repetition (SM-2), interactive flashcards, stroke practice, quizzes, and a built-in dictionary — all powered by a local SQLite database.

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| **Framework** | Next.js 16 (App Router) · React 19              |
| **API**       | tRPC 11 (type-safe RPC)                         |
| **Database**  | SQLite (better-sqlite3) · Drizzle ORM           |
| **Auth**      | better-auth (email/password)                    |
| **State**     | Zustand · TanStack React Query                  |
| **Styling**   | Tailwind CSS 4 · Framer Motion                  |
| **Testing**   | Vitest (unit) · Playwright (E2E)                |

## Features

- **Dashboard** — overview of decks, cards due, daily progress
- **Practice** — spaced repetition reviews using the SM-2 algorithm
- **Flashcards** — 3D flip-card study with Framer Motion animations
- **Decks** — CRUD management for card collections
- **Dictionary** — search by character, pinyin, or English meaning
- **Quiz** — multiple-choice knowledge tests with auto-distractors
- **Strokes** — handwriting/radical order practice canvas
- **Import** — bulk card import into existing decks
- **Discover** — explore new characters by HSK level

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Setup

```bash
# Install dependencies
npm install

# Create and seed the local database
node setup-db.js
node seed-data.js

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

### Environment Variables

Create a `.env` file in the project root:

```env
BETTER_AUTH_SECRET=<your-secret>
```

## Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start Next.js dev server          |
| `npm run build`     | Production build                  |
| `npm run test`      | Run Vitest unit tests             |
| `npm run test:e2e`  | Run Playwright E2E tests          |
| `npm run lint`      | ESLint check                      |

## Project Structure

```
src/
├── app/                   # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── page.tsx       # Dashboard home
│   │   ├── practice/      # SM-2 practice session
│   │   ├── flashcards/    # Card study view
│   │   ├── decks/         # Deck management
│   │   ├── dictionary/    # Character search
│   │   ├── quiz/          # Quiz mode
│   │   ├── strokes/       # Stroke practice
│   │   ├── import/        # Bulk import
│   │   └── discover/      # Character discovery
│   └── login/             # Auth page
├── components/            # Shared UI components
├── db/                    # Drizzle schema & connection
├── lib/                   # Utilities (SM-2 algo, auth config)
├── server/                # tRPC server
│   ├── trpc.ts            # tRPC init & middleware
│   └── routers/           # Domain-split routers
│       ├── _app.ts        # Root merge
│       ├── dashboard.ts
│       ├── deck.ts
│       ├── flashcard.ts
│       ├── practice.ts
│       ├── dictionary.ts
│       ├── quiz.ts
│       └── import.ts
├── store/                 # Zustand stores
└── trpc/                  # tRPC React client
tests/
├── unit/                  # Vitest unit tests
└── e2e/                   # Playwright E2E tests
```

## License

Private project.

import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// ─── In-memory rate limiter ───────────────────────────────────────────────────
// Limits each user to MAX_REQUESTS per WINDOW_MS to prevent XP farming / spam.
//
// ⚠️ SERVERLESS CAVEAT: This Map-based limiter works for a single long-lived
// server process (e.g., Node.js on a VM or container). On serverless platforms
// (Vercel, AWS Lambda), each cold start creates a fresh Map — making the limiter
// ineffective. Migrate to Redis or Upstash-based rate limiting before deploying
// to serverless infrastructure.
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 120; // generous for normal study use

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please slow down.',
    });
  }
}

// Prune stale entries every 5 minutes to avoid unbounded memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, 5 * 60_000);
}
// ─────────────────────────────────────────────────────────────────────────────

export const protectedProcedure = t.procedure.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }

  checkRateLimit(session.user.id);

  return next({
    ctx: { session },
  });
});

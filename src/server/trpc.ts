import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }

  return next({
    ctx: { session },
  });
});

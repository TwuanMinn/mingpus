import { createAuthClient } from "better-auth/react";

const appURL = process.env.NEXT_PUBLIC_APP_URL;

// Warn at module load — throw only at runtime so builds succeed without the var.
if (!appURL && process.env.NODE_ENV === 'production') {
  console.warn('[auth-client] NEXT_PUBLIC_APP_URL is not set. Auth will not work in production.');
}

export const authClient = createAuthClient({
  baseURL: appURL ?? "http://localhost:3000",
});

export const { signIn, signUp, useSession } = authClient;

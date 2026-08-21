import * as Sentry from "@sentry/node";
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from "superjson";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return {};
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(sentryMiddleware);

// Authenticated procedure - calls auth() only when needed
export const authProcedure = baseProcedure.use(async ({ next }) => {
  let userId: string | null | undefined;
  let orgId: string | null | undefined;

  try {
    const authData = await auth();
    userId = authData.userId;
    orgId = authData.orgId;
  } catch (err) {
    console.warn("Clerk auth() threw in authProcedure:", err);
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session. Please sign in again." });
  }

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const effectiveOrgId = orgId || userId;

  return next({
    ctx: { userId, orgId: effectiveOrgId },
  });
});

// Organization procedure - requires userId and supports personal/team orgId
export const orgProcedure = baseProcedure.use(async ({ next }) => {
  let userId: string | null | undefined;
  let orgId: string | null | undefined;

  try {
    const authData = await auth();
    userId = authData.userId;
    orgId = authData.orgId;
  } catch (err) {
    console.warn("Clerk auth() threw in orgProcedure:", err);
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session. Please sign in again." });
  }

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const effectiveOrgId = orgId || userId;

  return next({ ctx: { userId, orgId: effectiveOrgId } });
});

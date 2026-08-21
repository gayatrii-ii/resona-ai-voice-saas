import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { TRPCError } from "@trpc/server";
import { chatterbox } from "@/lib/chatterbox-client";
import { prisma } from "@/lib/db";
import { uploadAudio, getSignedAudioUrl } from "@/lib/r2";
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";
import { synthesizeSpeechFree } from "@/lib/free-tts";
import { createTRPCRouter, orgProcedure } from "../init";

export const generationsRouter = createTRPCRouter({
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const generation = await prisma.generation.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        omit: {
          orgId: true,
          r2ObjectKey: true,
        },
      });

      if (!generation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        ...generation,
        audioUrl: `/api/audio/${generation.id}`,
      };
    }),
  
  getAll: orgProcedure.query(async ({ ctx }) => {
    const generations = await prisma.generation.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      omit: {
        orgId: true,
        r2ObjectKey: true,
      },
    });

    return generations;
  }),

  create: orgProcedure
    .input(
      z.object({
        text: z.string().min(1).max(TEXT_MAX_LENGTH),
        voiceId: z.string().min(1),
        temperature: z.number().min(0).max(2).default(0.8),
        topP: z.number().min(0).max(1).default(0.95),
        topK: z.number().min(1).max(10000).default(1000),
        repetitionPenalty: z.number().min(1).max(2).default(1.2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check for active subscription before generation (bypass in dev if token is placeholder)
      if (env.POLAR_ACCESS_TOKEN !== "placeholder") {
        try {
          const customerState = await polar.customers.getStateExternal({
            externalId: ctx.orgId,
          });
          const hasActiveSubscription =
            (customerState.activeSubscriptions ?? []).length > 0;
          if (!hasActiveSubscription) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "SUBSCRIPTION_REQUIRED",
            });
          }
        } catch (err) {
          if (err instanceof TRPCError) throw err;
          // Customer doesn't exist in Polar yet -> no subscription
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "SUBSCRIPTION_REQUIRED",
          });
        }
      }

      const voice = await prisma.voice.findUnique({
        where: {
          id: input.voiceId,
          OR: [
            { variant: "SYSTEM" },
            { variant: "CUSTOM", orgId: ctx.orgId, }
          ],
        },
        select: {
          id: true,
          name: true,
          r2ObjectKey: true,
        },
      });

      if (!voice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      if (!voice.r2ObjectKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voice audio not available",
        });
      }

      let buffer: Buffer | null = null;

      // 1. Try Modal GPU Synthesis first
      try {
        const signedVoiceUrl = await getSignedAudioUrl(voice.r2ObjectKey);
        const { data, error } = await chatterbox.POST("/generate", {
          body: {
            prompt: input.text,
            voice_key: signedVoiceUrl,
            temperature: input.temperature,
            top_p: input.topP,
            top_k: input.topK,
            repetition_penalty: input.repetitionPenalty,
            norm_loudness: true,
          },
          parseAs: "arrayBuffer",
        });

        if (!error && data instanceof ArrayBuffer && data.byteLength > 0) {
          buffer = Buffer.from(data);
        } else {
          console.warn("Modal GPU unavailable, falling back to Free Neural TTS Engine:", error);
        }
      } catch (modalErr) {
        console.warn("Modal GPU threw error, falling back to Free Neural TTS Engine:", modalErr);
      }

      // 2. Seamless Fallback to 100% Free Neural TTS Engine (No credit card or external GPU needed)
      if (!buffer) {
        try {
          buffer = await synthesizeSpeechFree({
            text: input.text,
            voiceName: voice.name,
          });
        } catch (freeErr) {
          console.error("Neural TTS synthesis error:", freeErr);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate audio from voice engine",
          });
        }
      }

      let generationId: string | null = null;
      let r2ObjectKey: string | null = null;

      try {
        const generation = await prisma.generation.create({
          data: {
            orgId: ctx.orgId,
            text: input.text,
            voiceName: voice.name,
            voiceId: voice.id,
            temperature: input.temperature,
            topP: input.topP,
            topK: input.topK,
            repetitionPenalty: input.repetitionPenalty,
          },
          select: {
            id: true,
          },
        });

        generationId = generation.id;
        r2ObjectKey = `generations/orgs/${ctx.orgId}/${generation.id}.wav`;

        await uploadAudio({ buffer, key: r2ObjectKey, contentType: "audio/wav" });

        await prisma.generation.update({
          where: {
            id: generation.id,
          },
          data: {
            r2ObjectKey,
          },
        });

        Sentry.logger.info("Audio generated", {
          orgId: ctx.orgId,
          generationId: generation.id,
        });
      } catch (err: any) {
        console.error("Storage/Database generation error:", err);
        if (generationId) {
          await prisma.generation
            .delete({
              where: {
                id: generationId,
              },
            })
            .catch(() => {});
        }

        Sentry.logger.error("Generation failed", {
          orgId: ctx.orgId,
          voiceId: input.voiceId,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? `Failed to store audio: ${err.message}` : "Failed to store generated audio",
        });
      }

      if (!generationId || !r2ObjectKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      // Ingest usage event to Polar (fire-and-forget, don't block response)
      polar.events
        .ingest({
          events: [
            {
              name: env.POLAR_METER_TTS_GENERATION,
              externalCustomerId: ctx.orgId,
              metadata: { [env.POLAR_METER_TTS_PROPERTY]: input.text.length },
              timestamp: new Date(),
            },
          ],
        })
        .catch(() => {
          // Silently fail - don't break the user experience for metering errors
        });

      return {
        id: generationId,
      };
    }),
});

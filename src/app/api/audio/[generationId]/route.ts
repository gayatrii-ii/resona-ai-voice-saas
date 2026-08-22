import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { fetchAudioStream } from "@/lib/r2";

export const maxDuration = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ generationId: string }> },
) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const effectiveOrgId = orgId || userId;
  const { generationId } = await params;

  const generation = await prisma.generation.findUnique({
    where: { id: generationId, orgId: effectiveOrgId },
  });

  if (!generation) {
    return new Response("Not found", { status: 404 });
  }

  if (!generation.r2ObjectKey) {
    return new Response("Audio is not available yet", { status: 409 });
  }

  const audioResponse = await fetchAudioStream(generation.r2ObjectKey);

  if (!audioResponse.ok) {
    return new Response("Failed to fetch audio", { status: 502 });
  }

  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

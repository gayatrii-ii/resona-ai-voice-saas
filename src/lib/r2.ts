import { env } from "./env";

const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder.supabase.co"
).replace(/\/+$/, "");

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "placeholder";

const bucket = env.SUPABASE_STORAGE_BUCKET || "resona-audio";

type UploadAudioOptions = {
  buffer: Buffer;
  key: string;
  contentType?: string;
};

export async function uploadAudio({
  buffer,
  key,
  contentType = "audio/wav",
}: UploadAudioOptions): Promise<void> {
  const cleanKey = key.replace(/^\/+/, "");
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${cleanKey}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Supabase Storage REST Upload Error:", res.status, errorText);
    throw new Error(`Storage upload failed (${res.status}): ${errorText}`);
  }
}

export async function deleteAudio(key: string): Promise<void> {
  const cleanKey = key.replace(/^\/+/, "");
  const deleteUrl = `${supabaseUrl}/storage/v1/object/${bucket}`;

  const res = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [cleanKey] }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.warn("Supabase Storage REST Delete Warning:", res.status, errorText);
  }
}

export async function getSignedAudioUrl(key: string): Promise<string> {
  const cleanKey = key.replace(/^\/+/, "");

  try {
    const signUrl = `${supabaseUrl}/storage/v1/object/sign/${bucket}/${cleanKey}`;
    const res = await fetch(signUrl, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.signedURL) {
        return `${supabaseUrl}/storage/v1${data.signedURL}`;
      }
    }
  } catch (err) {
    console.warn("Signed URL generation warning, using public URL fallback:", err);
  }

  // Fallback to public URL
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanKey}`;
}


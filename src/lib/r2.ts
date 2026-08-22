import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client() {
  const baseUrl = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).replace(/\/+$/, "");

  const endpoint = baseUrl ? `${baseUrl}/storage/v1/s3` : undefined;

  const accessKeyId =
    process.env.SUPABASE_S3_ACCESS_KEY_ID || "";

  const secretAccessKey =
    process.env.SUPABASE_S3_SECRET_ACCESS_KEY || "";

  return new S3Client({
    region: "ap-northeast-2",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "resona-audio";

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
  const client = getS3Client();
  const cleanKey = key.replace(/^\/+/, "");

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

export async function deleteAudio(key: string): Promise<void> {
  const client = getS3Client();
  const cleanKey = key.replace(/^\/+/, "");

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      })
    );
  } catch (err) {
    console.warn("Delete audio warning:", err);
  }
}

export async function getSignedAudioUrl(key: string): Promise<string> {
  const client = getS3Client();
  const cleanKey = key.replace(/^\/+/, "");

  try {
    const signedUrl = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      }),
      { expiresIn: 3600 }
    );
    return signedUrl;
  } catch (err) {
    console.warn("Presigned URL generation fallback:", err);
    const baseUrl = (
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      ""
    ).replace(/\/+$/, "");
    return `${baseUrl}/storage/v1/object/public/${bucket}/${cleanKey}`;
  }
}


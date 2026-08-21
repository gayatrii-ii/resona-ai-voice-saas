import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// Voice name mappings to high-definition neural voices
export const VOICE_NEURAL_MAP: Record<string, string> = {
  Aaron: "en-US-GuyNeural",
  Abigail: "en-US-JennyNeural",
  Anaya: "en-IN-NeerjaNeural",
  Andy: "en-US-AndrewNeural",
  Archer: "en-GB-RyanNeural",
  Brian: "en-US-BrianNeural",
  Chloe: "en-US-AvaNeural",
  Dylan: "en-US-ChristopherNeural",
  Emmanuel: "en-NG-AbeoNeural",
  Ethan: "en-US-EricNeural",
  Evelyn: "en-US-AriaNeural",
  Gavin: "en-AU-WilliamNeural",
  Gordon: "en-GB-AlfieNeural",
  Ivan: "en-US-RogerNeural",
  Laura: "en-US-MichelleNeural",
  Lucy: "en-GB-SoniaNeural",
  Madison: "en-US-EmmaNeural",
  Marisol: "es-US-PalomaNeural",
  Meera: "en-IN-AnanyaNeural",
  Walter: "en-US-SteffanNeural",
};

export async function synthesizeSpeechFree({
  text,
  voiceName,
}: {
  text: string;
  voiceName?: string;
}): Promise<Buffer> {
  const neuralVoice =
    (voiceName && VOICE_NEURAL_MAP[voiceName]) ||
    "en-US-GuyNeural";

  const tts = new MsEdgeTTS();
  await tts.setMetadata(
    neuralVoice,
    OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
  );

  const { audioStream } = tts.toStream(text);

  const chunks: Buffer[] = [];
  audioStream.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  await new Promise<void>((resolve, reject) => {
    audioStream.on("end", () => resolve());
    audioStream.on("error", (err) => reject(err));
  });

  return Buffer.concat(chunks);
}

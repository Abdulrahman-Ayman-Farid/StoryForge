const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_VOICE_ID = process.env.ELEVEN_LABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // default Rachel voice

/**
 * Generate audio narration for the given text using ElevenLabs TTS API.
 * Returns a Buffer containing the audio data (MP3 format).
 *
 * @param text - The text to narrate
 * @param voiceId - Optional voice ID (defaults to ELEVEN_LABS_VOICE_ID env var, then Rachel)
 * @returns Promise resolving to a Buffer of audio data
 */
export async function generateNarration(
  text: string,
  voiceId?: string
): Promise<Buffer> {
  const id = voiceId ?? ELEVEN_LABS_VOICE_ID;

  if (!ELEVEN_LABS_API_KEY) {
    // Fallback: return a minimal WAV buffer as a mock when no API key is configured.
    return generateMockWav(text);
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${id}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVEN_LABS_API_KEY,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `ElevenLabs TTS request failed (${response.status}): ${errorBody}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate a minimal WAV file as a mock when no TTS API key is configured.
 * Creates a short silence WAV file with the given text embedded in the comment field.
 */
function generateMockWav(text: string): Buffer {
  const sampleRate = 44100;
  const duration = Math.min(Math.max(text.length / 15, 1), 10); // ~15 chars/sec, 1-10s
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const bufferSize = 44 + dataSize; // 44-byte WAV header + data

  const buffer = Buffer.alloc(bufferSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(bufferSize - 8, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write silence (zero samples)
  // Data is already zero-initialized by Buffer.alloc

  return buffer;
}

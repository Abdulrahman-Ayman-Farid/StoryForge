import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import type { StoryAnalysis } from "../types/story";

// Initialize the Gemini client with the API key from environment variables.
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GOOGLE_GENERATIVE_AI_API_KEY is not set. " +
      "Set it in your .env.local file. " +
      "Get one at https://aistudio.google.com/app/apikey"
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const SYSTEM_PROMPT = `You are an atmospheric creative writing assistant. Analyze the provided image for mood, sensory details, and implied worldbuilding. Return a JSON object with keys: 'mood' (string), 'sensoryPalette' (array of strings), 'worldbuilding' (string), 'openingParagraph' (string). The opening paragraph should be a literary, immersive story opening based on the image. Return ONLY valid JSON — no markdown fences, no explanation text.`;

/**
 * Analyze an image buffer using Google Gemini 1.5 Flash.
 * Returns a StoryAnalysis object containing mood, sensory palette, worldbuilding,
 * and a literary opening paragraph inspired by the image.
 *
 * @param imageBuffer - Raw image bytes (JPEG, PNG, etc.)
 * @returns Promise resolving to a StoryAnalysis object
 */
export async function analyzeImage(
  imageBuffer: Buffer
): Promise<StoryAnalysis> {
  // Convert the buffer to a base64 data URI compatible with Gemini's API.
  const base64Image = imageBuffer.toString("base64");
  const mimeType = detectMimeType(imageBuffer);
  const imagePart: import("@google/generative-ai").Part = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const result = await model.generateContent([
    SYSTEM_PROMPT,
    imagePart,
  ]);

  const response = result.response;
  const text = response.text();

  // Parse the response text as JSON.
  // Gemini may wrap JSON in markdown code fences; strip them if present.
  const cleaned = text
    .replace(/```json\s*/i, "")
    .replace(/```/g, "")
    .trim();

  try {
    const analysis: StoryAnalysis = JSON.parse(cleaned);
    return analysis;
  } catch {
    throw new Error(
      `Failed to parse Gemini response as JSON. Raw response: ${cleaned.slice(0, 500)}`
    );
  }
}

/**
 * Detect the MIME type of an image buffer by inspecting its magic bytes.
 */
function detectMimeType(buffer: Buffer): string {
  // JPEG: FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  // WebP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  // Default to JPEG
  return "image/jpeg";
}

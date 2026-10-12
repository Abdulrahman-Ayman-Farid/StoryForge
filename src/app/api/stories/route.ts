import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "../../../lib/gemini";
import { generateNarration } from "../../../lib/audio";
import type { StoryAnalysis } from "../../../types/story";

/**
 * POST /api/stories
 * Accepts a multipart/form-data request with an image file and optional voiceId.
 * Analyzes the image with Gemini, generates a story opening, and creates audio narration.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const voiceId = (formData.get("voiceId") as string) || undefined;

    if (!imageFile) {
      return NextResponse.json(
        { error: "Missing required field: image" },
        { status: 400 }
      );
    }

    // Validate image MIME type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          error: `Unsupported image type: ${imageFile.type}. Allowed: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (imageFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image file too large. Maximum size is 10 MB." },
        { status: 400 }
      );
    }

    // Convert image to Buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // Step 1: Analyze image with Gemini
    const analysis: StoryAnalysis = await analyzeImage(imageBuffer);

    // Step 2: Generate audio narration for the opening paragraph
    const audioBuffer = await generateNarration(analysis.openingParagraph, voiceId);
    const audioBase64 = audioBuffer.toString("base64");

    // Step 3: Return the result
    return NextResponse.json({
      success: true,
      data: {
        openingParagraph: analysis.openingParagraph,
        mood: analysis.mood,
        sensoryPalette: analysis.sensoryPalette,
        worldbuilding: analysis.worldbuilding,
        audioData: audioBase64,
        audioFormat: "wav",
      },
    });
  } catch (error) {
    console.error("[Stories API] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stories
 * Accepts a multipart/form-data request with an image file and optional voice.
 * Analyzes the image with Gemini, generates a story opening, and creates audio narration.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const voice = (formData.get("voice") as string) || undefined;

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

    // Step 1: Analyze image with Gemini (lazy import to avoid build-time failures)
    let analyzeImage: (buffer: Buffer) => Promise<unknown>;
    try {
      const gemini = await import("../../../lib/gemini");
      analyzeImage = gemini.analyzeImage;
    } catch {
      throw new Error("lib/gemini is not available. Please implement analyzeImage.");
    }

    const analysis = (await analyzeImage(imageBuffer)) as {
      openingParagraph: string;
      mood: string;
      sensoryPalette: string[];
      worldbuilding: string;
    };

    // Step 2: Generate audio narration for the opening paragraph (lazy import)
    let generateNarration: (text: string, voice?: string) => Promise<Buffer>;
    try {
      const audio = await import("../../../lib/audio");
      generateNarration = audio.generateNarration;
    } catch {
      throw new Error("lib/audio is not available. Please implement generateNarration.");
    }

    const audioBuffer = await generateNarration(analysis.openingParagraph, voice);
    const audioBase64 = audioBuffer.toString("base64");

    // Step 3: Return the result
    return NextResponse.json({
      openingParagraph: analysis.openingParagraph,
      mood: analysis.mood,
      sensoryPalette: analysis.sensoryPalette,
      worldbuilding: analysis.worldbuilding,
      audioBase64,
      audioMimeType: "audio/mpeg",
    });
  } catch (error) {
    console.error("[Stories API] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

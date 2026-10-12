import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CoWritingRequest, CoWritingResponse } from "../../../types/story";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GOOGLE_GENERATIVE_AI_API_KEY is not set. " +
      "Set it in your .env.local file. " +
      "Get one at https://aistudio.google.com/app/apikey"
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

const CO_WRITING_SYSTEM_PROMPT =
  "You are a co-writing companion for an atmospheric creative writing atelier. " +
  "Continue the story based on the user's input and the provided context. " +
  "Keep the tone atmospheric, immersive, and literary. " +
  "Write in a vivid, sensory-rich style that draws the reader into the world. " +
  "Do not break character or add meta-commentary. " +
  "Return only the story continuation text, no preamble or explanation.";

/**
 * POST /api/co-writing
 * Accepts a JSON body with a message and story context.
 * Returns an AI-generated story continuation using Gemini 1.5 Flash.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CoWritingRequest;

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid field: message (must be a string)" },
        { status: 400 }
      );
    }

    if (!body.context || typeof body.context !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid field: context (must be a string)" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      CO_WRITING_SYSTEM_PROMPT,
      `Context (previous story):\n${body.context}\n\nUser input:\n${body.message}`,
    ]);

    const response = result.response;
    const text = response.text();

    const cleaned = text
      .replace(/```[a-z]*\s*/i, "")
      .replace(/```/g, "")
      .trim();

    const data: CoWritingResponse = { continuation: cleaned };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[Co-writing API] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const body = await request.json();

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid field: message (must be a string)" },
        { status: 400 }
      );
    }

    if (!body.context || !Array.isArray(body.context)) {
      return NextResponse.json(
        { error: "Missing or invalid field: context (must be an array of {role, content} objects)" },
        { status: 400 }
      );
    }

    // Build context string from the array of { role, content } objects
    const contextString = body.context
      .map((entry: { role: string; content: string }) => {
        const label = entry.role === "user" ? "User" : "Assistant";
        return `${label}: ${entry.content}`;
      })
      .join("\n\n");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      CO_WRITING_SYSTEM_PROMPT,
      `Context (previous story):\n${contextString}\n\nUser input:\n${body.message}`,
    ]);

    const response = result.response;
    const text = response.text();

    const cleaned = text
      .replace(/```[a-z]*\s*/i, "")
      .replace(/```/g, "")
      .trim();

    return NextResponse.json({ response: cleaned });
  } catch (error) {
    console.error("[Co-writing API] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

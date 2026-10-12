/**
 * Result of analyzing an image through the Gemini multimodal vision model.
 * Contains the mood, sensory palette, worldbuilding context, and a literary opening paragraph.
 */
export interface StoryAnalysis {
  /** The overall emotional tone or mood of the image (e.g., "melancholic", "ethereal", "tense") */
  mood: string;
  /** Array of sensory descriptors extracted from the image (e.g., ["crimson light", "damp earth", "faint chimes"]) */
  sensoryPalette: string[];
  /** A brief description of the implied worldbuilding setting */
  worldbuilding: string;
  /** A literary, immersive story opening paragraph inspired by the image */
  openingParagraph: string;
}

/**
 * Request body for the co-writing companion endpoint.
 */
export interface CoWritingRequest {
  /** The user's input message or continuation prompt */
  message: string;
  /** The accumulated story context (previous story parts) for the AI to continue from */
  context: string;
}

/**
 * Response body from the co-writing companion endpoint.
 */
export interface CoWritingResponse {
  /** The AI-generated story continuation */
  continuation: string;
}

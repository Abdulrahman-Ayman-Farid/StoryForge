"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Upload,
  Sparkles,
  Music,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storyFormSchema = z.object({
  image: z
    .instanceof(File, { message: "Please select an image file." })
    .refine(
      (file) => ACCEPTED_TYPES.includes(file.type),
      "Only JPG, PNG, WebP, and GIF files are accepted."
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File size must not exceed 10 MB."
    ),
  voice: z.string({
    required_error: "Please select a voice actor.",
  }).min(1, "Please select a voice actor."),
});

type StoryFormValues = z.infer<typeof storyFormSchema>;

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

interface StoryResponse {
  openingParagraph: string;
  mood: string;
  sensoryPalette: string[];
  worldbuilding: string;
  audioBase64: string;
  audioMimeType: string;
}

// ---------------------------------------------------------------------------
// Voice actor options
// ---------------------------------------------------------------------------

const VOICE_OPTIONS = [
  { label: "Narrator", value: "Narrator" },
  { label: "Storyteller", value: "Storyteller" },
  { label: "Poet", value: "Poet" },
  { label: "Dramatic", value: "Dramatic" },
];

// ---------------------------------------------------------------------------
// Result sub-component (kept small to respect the ~300-line rule)
// ---------------------------------------------------------------------------

const resultMotionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

function ResultCard({ result }: { result: StoryResponse }) {
  return (
    <motion.div
      variants={resultMotionVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">Your Story Opening</CardTitle>
          </div>
          <CardDescription>
            Crafted from your artwork by Gemini
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Opening paragraph — literary styling */}
          <div className="rounded-lg bg-muted/40 p-6">
            <p className="font-serif text-lg leading-relaxed italic text-foreground">
              &ldquo;{result.openingParagraph}&rdquo;
            </p>
          </div>

          {/* Mood badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Mood:
            </span>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {result.mood}
            </Badge>
          </div>

          {/* Sensory palette */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Sensory Palette
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.sensoryPalette.map((sense) => (
                <Badge
                  key={sense}
                  variant="outline"
                  className="border-border/60"
                >
                  {sense}
                </Badge>
              ))}
            </div>
          </div>

          {/* Worldbuilding */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Worldbuilding
            </h3>
            <p className="text-sm leading-7 text-foreground">
              {result.worldbuilding}
            </p>
          </div>

          {/* Audio player */}
          {result.audioBase64 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Music className="h-4 w-4" />
                Narrated Audio
              </div>
              <audio
                controls
                className="w-full"
                aria-label="Generated story narration"
              >
                <source
                  src={`data:${result.audioMimeType};base64,${result.audioBase64}`}
                  type={result.audioMimeType}
                />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * StoryUpload — Upload visual artwork and generate a story opening via Gemini.
 *
 * @remarks
 * This is a client component that manages a drag-and-drop image upload,
 * voice-actor selection, API submission, and result display.
 */
export function StoryUpload() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    mode: "onChange",
    defaultValues: { voice: "" },
  });

  // --- File handling -------------------------------------------------------

  const setFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setValue("image", file, { shouldValidate: true });
      setError(null);
      setResult(null);
    },
    [setValue]
  );

  const clearFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setValue("image", undefined as unknown as File, { shouldValidate: true });
  }, [previewUrl, setValue]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setFile(file);
    },
    [setFile]
  );

  // --- Drag-and-drop -------------------------------------------------------

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) setFile(file);
    },
    [setFile]
  );

  // --- Submit --------------------------------------------------------------

  const onSubmit = useCallback(
    async (data: StoryFormValues) => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append("image", data.image);
        formData.append("voice", data.voice);

        const response = await fetch("/api/stories", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(
            body || `API returned status ${response.status}`
          );
        }

        const json: StoryResponse = await response.json();
        setResult(json);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // --- Cleanup on unmount --------------------------------------------------

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-12 sm:py-16">
      {/* ---- Header ---- */}
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Transform Art into Story
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload a visual artwork and let Gemini craft a vivid story opening
          inspired by its mood, colours, and atmosphere.
        </p>
      </div>

      {/* ---- Upload Card ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-primary" />
            Upload Your Artwork
          </CardTitle>
          <CardDescription>
            Drag and drop an image, or click to browse. JPG, PNG, WebP, or GIF
            (max 10 MB).
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Image upload area */}
            <div className="space-y-2">
              <Label>Image</Label>

              <div
                role="button"
                tabIndex={0}
                aria-label="Upload image file"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    document.getElementById("story-upload-input")?.click();
                  }
                }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors duration-200",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/60 hover:bg-muted/30",
                  previewUrl && "border-border"
                )}
              >
                <input
                  id="story-upload-input"
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  {...register("image")}
                  onChange={handleFileInput}
                  className="sr-only"
                  aria-label="Select image file"
                />

                {previewUrl ? (
                  <div className="relative w-full">
                    <Image
                      src={previewUrl}
                      alt="Preview of uploaded artwork"
                      width={512}
                      height={512}
                      className="mx-auto max-h-64 w-auto rounded-md object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-muted-foreground shadow-sm transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Remove uploaded image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {isDragging
                          ? "Drop your image here"
                          : "Drag & drop an image here"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                  </>
                )}
              </div>

              {errors.image && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.image.message}
                </p>
              )}
            </div>

            {/* Voice selection */}
            <div className="space-y-2">
              <Label htmlFor="voice-select">Voice Actor</Label>
              <Select
                value={watch("voice")}
                onValueChange={(value) => {
                  setValue("voice", value, { shouldValidate: true });
                }}
              >
                <SelectTrigger id="voice-select" className="w-full">
                  <SelectValue placeholder="Select a voice actor" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.voice && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.voice.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Analyzing image and generating story...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Story
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* ---- Error state ---- */}
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ---- Result state ---- */}
      {result && <ResultCard result={result} />}
    </div>
  );
}

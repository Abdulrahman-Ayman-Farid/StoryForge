import { Sparkles, PenLine } from "lucide-react";
import { StoryUpload } from "@/components/StoryUpload";
import { CoWritingChat } from "@/components/CoWritingChat";

/**
 * Stories page — the StoryForge creative writing atelier.
 *
 * A Server Component that renders two client components:
 * 1. StoryUpload — image upload and story generation
 * 2. CoWritingChat — AI co-writing chat interface
 *
 * The page uses a subtle atmospheric gradient to evoke a writer's studio,
 * with semantic token-only colours and the 4-point spacing rhythm.
 */
export default function StoriesPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Decorative radial glow — behind all content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_60%)]"
      />

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <header className="px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-10 lg:px-8 lg:pt-20 lg:pb-12">
        <div className="mx-auto max-w-4xl text-center">
          {/* Icon badge */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>

          {/* Title with gradient accent */}
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Create a{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Story
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Upload an image to spark a story opening, then co-write with your AI
            companion to shape the narrative together.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <PenLine className="h-3.5 w-3.5" />
              AI Co-Writing
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Image-to-Story
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <PenLine className="h-3.5 w-3.5" />
              Narrated Audio
            </span>
          </div>
        </div>
      </header>

      {/* ── Upload Section ──────────────────────────────────────────── */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8" aria-label="Story upload">
        <div className="mx-auto max-w-4xl">
          <StoryUpload />
        </div>
      </section>

      {/* ── Visual Separator ────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center py-8">
          <div className="flex-grow border-t border-border/40" />
          <span className="mx-4 flex-shrink-0 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Continue Writing
          </span>
          <div className="flex-grow border-t border-border/40" />
        </div>
      </div>

      {/* ── Co-Writing Chat Section ─────────────────────────────────── */}
      <section
        className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
        aria-label="Co-writing chat"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Co-Writing Companion
            </h2>
            <p className="text-sm text-muted-foreground">
              Share your thoughts, refine your story, and let the AI help you
              find the next words.
            </p>
          </div>
          <CoWritingChat />
        </div>
      </section>
    </div>
  );
}

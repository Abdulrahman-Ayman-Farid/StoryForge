import Link from "next/link";
import { PenLine } from "lucide-react";

/**
 * StoriesLayout — sticky top-bar shell for the stories section.
 *
 * Provides a glassmorphic header with the StoryForge brand, navigation
 * links, and a scrollable main area that wraps its children in a
 * constrained container.
 *
 * Accessibility:
 *  - Semantic <header> + <main> landmarks
 *  - Skip-to-content link for keyboard users
 *  - aria-current="page" on the active nav link
 *  - All interactive elements have visible focus-visible rings
 *
 * Responsive:
 *  - Header collapses gracefully on small screens
 *  - Main content uses max-w-7xl with responsive horizontal padding
 */
export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Skip-to-content link for keyboard accessibility */}
      <a
        href="#stories-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to content
      </a>

      {/* ── Sticky Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand / Logo */}
          <Link
            href="/stories"
            className="flex items-center gap-2 font-bold text-lg text-foreground transition-colors hover:text-primary focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="StoryForge home"
          >
            <PenLine className="h-5 w-5 text-primary" />
            <span>StoryForge</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            <Link
              href="/stories"
              className="rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-current="page"
            >
              Create
            </Link>
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main
        id="stories-main"
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        {children}
      </main>
    </div>
  );
}

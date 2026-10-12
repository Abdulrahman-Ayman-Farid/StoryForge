"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CoWritingApiResponse {
  response: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Three bouncing dots typing indicator */
function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-4 py-3"
      role="status"
      aria-label="AI is typing"
    >
      <Bot className="h-4 w-4 text-muted-foreground" />
      <div className="flex gap-1">
        <span
          className="block h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="block h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="block h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

/** Single message bubble */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar — left side for AI, right side for user */}
      {!isUser && (
        <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center">
          <Bot className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-secondary text-secondary-foreground rounded-bl-sm"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p
          className={cn(
            "mt-1.5 text-[11px]",
            isUser
              ? "text-primary-foreground/60"
              : "text-muted-foreground/70"
          )}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>

      {/* Avatar — right side for user */}
      {isUser && (
        <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}

/** Empty state shown when no messages exist */
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Start co-writing your story</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Share your opening paragraph and the AI will help you continue.
        </p>
      </div>
    </div>
  );
}

/** Error banner shown when an API call fails */
function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="mx-4 mb-3 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-destructive hover:text-destructive"
        onClick={onRetry}
      >
        <RotateCcw className="h-3 w-3" />
        Retry
      </Button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

/**
 * CoWritingChat — A chat-style interface for co-writing stories with an AI
 * companion.
 *
 * Features:
 * - Message list with user (right) and AI (left) bubbles
 * - Auto-submit on Enter, newlines on Shift+Enter
 * - Typing indicator while waiting for AI response
 * - Empty state, error state with retry, and clear-chat action
 * - Context window of the last 10 messages sent to the API
 */
export function CoWritingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const viewport = scrollRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Build context: last 10 messages
    const context = messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/co-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, context }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data: CoWritingApiResponse = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleRetry = () => {
    setError(null);
    // Re-send the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setInput(lastUserMsg.content);
    }
  };

  return (
    <Card className="flex h-[min(720px,85vh)] w-full flex-col overflow-hidden border-border/60 shadow-sm">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">
            Co-Writing Companion
          </h2>
          <Badge variant="secondary" className="text-xs">
            AI
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-destructive"
          onClick={handleClear}
          disabled={messages.length === 0}
          aria-label="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <Separator />

      {/* ── Message Area ────────────────────────────────────────────── */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
        {messages.length === 0 && !isLoading && <EmptyState />}

        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* ── Error Banner ────────────────────────────────────────────── */}
      {error && <ErrorBanner message={error} onRetry={handleRetry} />}

      {/* ── Input Area ──────────────────────────────────────────────── */}
      <div className="border-t border-border/40 p-4">
        <div className="mx-auto max-w-2xl space-y-2">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Continue the story…"
              disabled={isLoading}
              rows={1}
              className={cn(
                "min-h-[44px] max-h-[160px] resize-none text-sm leading-relaxed",
                "flex-1"
              )}
              aria-label="Type your message"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="flex-shrink-0 h-11 w-11"
            >
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to send,{" "}
            <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </Card>
  );
}

"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import {
  Bot,
  CircleAlert,
  LoaderCircle,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import type {
  AdvisorContext,
  AdvisorDraftAnswer,
} from "@/lib/advisor-types";
import {
  createAdvisorDraftAnswer,
  createAdvisorQuestion,
} from "@/lib/advisor";
import type {
  AdvisorApiResponse,
} from "@/lib/advisor-api";

type AdvisorChatProps = {
  context: AdvisorContext;
};

type ChatEntry =
  | {
      id: string;
      role: "user";
      text: string;
    }
  | {
      id: string;
      role: "advisor-ai";
      text: string;
    }
  | {
      id: string;
      role: "advisor-local";
      answer: AdvisorDraftAnswer;
      reason: string;
    };

const suggestedQuestions = [
  "Can I afford a €2,000 holiday?",
  "Should I invest more each month?",
  "How can I make faster progress toward my savings goal?",
  "How healthy is my current cash flow?",
] as const;

async function requestAdvisorAnswer(
  question: string,
  context: AdvisorContext
): Promise<AdvisorApiResponse> {
  try {
    const response = await fetch(
      "/api/advisor",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          question,
          context,
        }),
      }
    );

    let body: AdvisorApiResponse;

    try {
      body =
        (await response.json()) as AdvisorApiResponse;
    } catch {
      return {
        ok: false,
        error:
          "The advisor returned an unreadable response.",
      };
    }

    if (!response.ok) {
      return body.ok
        ? {
            ok: false,
            error:
              "The advisor request could not be completed.",
          }
        : body;
    }

    return body;
  } catch {
    return {
      ok: false,
      error:
        "The AI service could not be reached.",
    };
  }
}

export default function AdvisorChat({
  context,
}: AdvisorChatProps) {
  const [question, setQuestion] =
    useState("");

  const [entries, setEntries] =
    useState<ChatEntry[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState<string | null>(null);

  const hasConversation =
    entries.length > 0;

  const questionPlaceholder = useMemo(
    () =>
      hasConversation
        ? "Ask a follow-up question..."
        : "Ask anything about your finances...",
    [hasConversation]
  );

  async function askQuestion(
    rawText: string
  ) {
    if (isLoading) {
      return;
    }

    const trimmed = rawText.trim();

    if (!trimmed) {
      return;
    }

    let parsedQuestion;

    try {
      parsedQuestion =
        createAdvisorQuestion(trimmed);
    } catch {
      return;
    }

    const userEntry: ChatEntry = {
      id: crypto.randomUUID(),
      role: "user",
      text: parsedQuestion.text,
    };

    setEntries((current) => [
      ...current,
      userEntry,
    ]);

    setQuestion("");
    setStatusMessage(null);
    setIsLoading(true);

    const response =
      await requestAdvisorAnswer(
        parsedQuestion.text,
        context
      );

    if (response.ok) {
      const aiEntry: ChatEntry = {
        id: crypto.randomUUID(),
        role: "advisor-ai",
        text: response.answer,
      };

      setEntries((current) => [
        ...current,
        aiEntry,
      ]);

      setIsLoading(false);
      return;
    }

    const fallbackAnswer =
      createAdvisorDraftAnswer(
        parsedQuestion,
        context
      );

    const fallbackEntry: ChatEntry = {
      id: crypto.randomUUID(),
      role: "advisor-local",
      answer: fallbackAnswer,
      reason: response.error,
    };

    setEntries((current) => [
      ...current,
      fallbackEntry,
    ]);

    setStatusMessage(
      "AI response unavailable. Finovo used the local planning fallback instead."
    );

    setIsLoading(false);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    void askQuestion(question);
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl shadow-black/20">
      <div className="border-b border-white/10 px-6 py-6 sm:px-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
          <Sparkles size={17} />
          <span>AI Financial Advisor</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ask Finovo about your finances.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Finovo sends a compact financial context to the secure advisor
          endpoint. If AI is unavailable, the local planning engine is used
          as a fallback.
        </p>
      </div>

      {statusMessage && (
        <div className="border-b border-white/10 bg-amber-500/[0.06] px-6 py-3 sm:px-8">
          <div className="flex items-start gap-2 text-sm text-amber-200">
            <CircleAlert
              size={16}
              className="mt-0.5 shrink-0"
            />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      <div className="min-h-[30rem] px-6 py-6 sm:px-8">
        {!hasConversation ? (
          <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Bot size={28} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">
              Start with a question
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
              Finovo uses your liquidity, cash flow, forecast, financial
              health and goal progress to structure the answer.
            </p>

            <div className="mt-7 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
              {suggestedQuestions.map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      void askQuestion(
                        suggestion
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 text-left text-sm font-medium text-zinc-300 transition hover:border-blue-500/30 hover:bg-blue-500/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {entries.map((entry) => {
              if (
                entry.role === "user"
              ) {
                return (
                  <div
                    key={entry.id}
                    className="flex justify-end"
                  >
                    <div className="max-w-2xl rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white">
                      <div className="mb-1 flex items-center justify-end gap-2 text-xs font-semibold text-blue-100">
                        <UserRound
                          size={14}
                        />
                        You
                      </div>

                      {entry.text}
                    </div>
                  </div>
                );
              }

              if (
                entry.role ===
                "advisor-ai"
              ) {
                return (
                  <div
                    key={entry.id}
                    className="flex justify-start"
                  >
                    <article className="max-w-3xl rounded-2xl rounded-bl-md border border-blue-500/20 bg-blue-500/[0.04] px-5 py-5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">
                        <Bot size={15} />
                        Finovo Advisor
                      </div>

                      <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                        {entry.text}
                      </div>

                      <p className="mt-5 text-xs leading-5 text-zinc-600">
                        AI-generated planning support based on the
                        financial context currently available in Finovo.
                        It is not personal financial advice.
                      </p>
                    </article>
                  </div>
                );
              }

              return (
                <div
                  key={entry.id}
                  className="flex justify-start"
                >
                  <article className="max-w-3xl rounded-2xl rounded-bl-md border border-amber-500/15 bg-amber-500/[0.03] px-5 py-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-400">
                      <Bot size={15} />
                      Local Finovo fallback
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-white">
                      {
                        entry.answer
                          .headline
                      }
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {
                        entry.answer
                          .summary
                      }
                    </p>

                    <div className="mt-5 space-y-2">
                      {entry.answer.supportingPoints.map(
                        (point) => (
                          <div
                            key={point}
                            className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-300"
                          >
                            {point}
                          </div>
                        )
                      )}
                    </div>

                    <p className="mt-5 text-xs leading-5 text-zinc-600">
                      {entry.answer.disclaimer}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-amber-500/70">
                      AI unavailable:{" "}
                      {entry.reason}
                    </p>
                  </article>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-3 rounded-2xl rounded-bl-md border border-white/10 bg-zinc-950/70 px-5 py-4 text-sm text-zinc-400"
                >
                  <LoaderCircle
                    size={18}
                    className="animate-spin text-blue-400"
                  />
                  Finovo is thinking…
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-zinc-950/50 p-4 sm:p-5"
      >
        <div className="flex items-end gap-3">
          <textarea
            value={question}
            disabled={isLoading}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !isLoading
              ) {
                event.preventDefault();
                void askQuestion(
                  question
                );
              }
            }}
            rows={1}
            maxLength={2_000}
            placeholder={
              questionPlaceholder
            }
            className="min-h-12 max-h-32 flex-1 resize-y rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={
              isLoading ||
              question.trim().length === 0
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Ask Finovo"
          >
            {isLoading ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 px-1">
          <p className="text-xs text-zinc-600">
            Press Enter to send. Shift + Enter adds a new line.
          </p>

          <p className="text-xs text-zinc-700">
            {question.length}/2000
          </p>
        </div>
      </form>
    </section>
  );
}

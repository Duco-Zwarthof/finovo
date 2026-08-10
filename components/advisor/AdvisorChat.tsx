"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import {
  Bot,
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
      role: "advisor";
      answer: AdvisorDraftAnswer;
    };

const suggestedQuestions = [
  "Can I afford a €2,000 holiday?",
  "Should I invest more each month?",
  "How can I make faster progress toward my savings goal?",
  "How healthy is my current cash flow?",
] as const;

export default function AdvisorChat({
  context,
}: AdvisorChatProps) {
  const [question, setQuestion] =
    useState("");

  const [entries, setEntries] =
    useState<ChatEntry[]>([]);

  const hasConversation =
    entries.length > 0;

  const questionPlaceholder = useMemo(
    () =>
      hasConversation
        ? "Ask a follow-up question..."
        : "Ask anything about your finances...",
    [hasConversation]
  );

  function askQuestion(rawText: string) {
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

    const answer =
      createAdvisorDraftAnswer(
        parsedQuestion,
        context
      );

    setEntries((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: parsedQuestion.text,
      },
      {
        id: crypto.randomUUID(),
        role: "advisor",
        answer,
      },
    ]);

    setQuestion("");
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    askQuestion(question);
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
          This first advisor version answers locally from the financial
          context already stored in Finovo. No external AI service is used yet.
        </p>
      </div>

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
              Finovo will use your liquidity, cash flow, forecast,
              financial health and goal progress to structure the answer.
            </p>

            <div className="mt-7 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
              {suggestedQuestions.map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      askQuestion(
                        suggestion
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 text-left text-sm font-medium text-zinc-300 transition hover:border-blue-500/30 hover:bg-blue-500/[0.06] hover:text-white"
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

              return (
                <div
                  key={entry.id}
                  className="flex justify-start"
                >
                  <article className="max-w-3xl rounded-2xl rounded-bl-md border border-white/10 bg-zinc-950/70 px-5 py-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">
                      <Bot size={15} />
                      Finovo Advisor
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
                      {
                        entry.answer
                          .disclaimer
                      }
                    </p>
                  </article>
                </div>
              );
            })}
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
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                askQuestion(question);
              }
            }}
            rows={1}
            placeholder={
              questionPlaceholder
            }
            className="min-h-12 max-h-32 flex-1 resize-y rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={
              question.trim().length === 0
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Ask Finovo"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="mt-2 px-1 text-xs text-zinc-600">
          Press Enter to send. Shift + Enter adds a new line.
        </p>
      </form>
    </section>
  );
}

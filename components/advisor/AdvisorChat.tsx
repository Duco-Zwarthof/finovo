"use client";

import Link from "next/link";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CircleDollarSign,
  Gauge,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import type {
  AdvisorContext,
} from "@/lib/advisor-types";
import type {
  LocalAdvisorAnswer,
} from "@/lib/smart-advisor-local-types";
import {
  answerLocalAdvisorQuestion,
} from "@/lib/smart-advisor-local";

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
      answer: LocalAdvisorAnswer;
    };

const suggestedQuestions = [
  "Can I afford a €2,000 holiday?",
  "What if I invest €250 per month extra?",
  "How can I make faster progress toward my savings goal?",
  "How healthy is my current cash flow?",
] as const;

function getToneClasses(
  tone: LocalAdvisorAnswer["tone"]
) {
  switch (tone) {
    case "positive":
      return {
        article:
          "border-emerald-500/20 bg-emerald-500/[0.04]",
        label: "text-emerald-400",
      };

    case "caution":
      return {
        article:
          "border-amber-500/20 bg-amber-500/[0.04]",
        label: "text-amber-400",
      };

    default:
      return {
        article:
          "border-blue-500/20 bg-blue-500/[0.04]",
        label: "text-blue-400",
      };
  }
}

function getVerdictPresentation(
  verdict: LocalAdvisorAnswer["assessment"]["verdict"]
) {
  switch (verdict) {
    case "safe":
      return {
        label: "Safe",
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        Icon: ShieldCheck,
      };

    case "tight":
      return {
        label: "Tight",
        className:
          "border-amber-500/20 bg-amber-500/10 text-amber-300",
        Icon: Gauge,
      };

    case "risky":
      return {
        label: "Risky",
        className:
          "border-red-500/20 bg-red-500/10 text-red-300",
        Icon: TriangleAlert,
      };

    default:
      return {
        label: "Info",
        className:
          "border-blue-500/20 bg-blue-500/10 text-blue-300",
        Icon: Bot,
      };
  }
}

function formatMonthlyRoom(
  amountMinor: number
) {
  return new Intl.NumberFormat(
    "en-IE",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(amountMinor / 100);
}

function getPrimaryRisk(
  answer: LocalAdvisorAnswer
) {
  const highPriority =
    answer.actions.find(
      (action) =>
        action.priority === "high"
    );

  if (highPriority) {
    return highPriority.title;
  }

  if (
    answer.assessment.verdict ===
    "tight"
  ) {
    return "Limited financial margin";
  }

  if (
    answer.assessment.verdict ===
    "risky"
  ) {
    return "Cash flow or buffer pressure";
  }

  return "No major risk flagged";
}

function getBestNextAction(
  answer: LocalAdvisorAnswer
) {
  return (
    answer.actions[0]?.title ??
    "Keep your financial data updated"
  );
}

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
        : "Ask about spending, saving, investing or cash flow...",
    [hasConversation]
  );

  function askQuestion(
    rawText: string
  ) {
    const trimmed = rawText.trim();

    if (!trimmed) {
      return;
    }

    let answer: LocalAdvisorAnswer;

    try {
      answer =
        answerLocalAdvisorQuestion(
          trimmed,
          context
        );
    } catch {
      return;
    }

    setEntries((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: trimmed,
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
          <span>Smart Financial Advisor</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ask Finovo about your finances.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Finovo turns your stored financial data into a local planning
          assessment, concrete actions and scenario-aware guidance. No external
          AI service or API key is required.
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
              Finovo can compare your liquidity, monthly cash flow,
              forecast, financial health and goal progress.
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
            {(() => {
              const latestAdvisorEntry =
                [...entries]
                  .reverse()
                  .find(
                    (entry) =>
                      entry.role ===
                      "advisor"
                  );

              if (
                !latestAdvisorEntry ||
                latestAdvisorEntry.role !==
                  "advisor"
              ) {
                return null;
              }

              const latestAnswer =
                latestAdvisorEntry.answer;

              const verdict =
                getVerdictPresentation(
                  latestAnswer.assessment
                    .verdict
                );

              const VerdictIcon =
                verdict.Icon;

              return (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      <VerdictIcon
                        size={14}
                      />
                      Current position
                    </div>

                    <div
                      className={`mt-3 inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${verdict.className}`}
                    >
                      {verdict.label}
                    </div>

                    <p className="mt-2 text-xs text-zinc-600">
                      Fit score{" "}
                      {
                        latestAnswer
                          .assessment
                          .score
                      }
                      /100
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      <CircleDollarSign
                        size={14}
                      />
                      Monthly room
                    </div>

                    <p className="mt-3 text-xl font-bold text-white">
                      {formatMonthlyRoom(
                        latestAnswer
                          .assessment
                          .estimatedMonthlyRoomMinor
                      )}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Recorded surplus
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      <TriangleAlert
                        size={14}
                      />
                      Main risk
                    </div>

                    <p className="mt-3 text-sm font-semibold leading-5 text-white">
                      {getPrimaryRisk(
                        latestAnswer
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-400">
                      <BarChart3
                        size={14}
                      />
                      Best next action
                    </div>

                    <p className="mt-3 text-sm font-semibold leading-5 text-white">
                      {getBestNextAction(
                        latestAnswer
                      )}
                    </p>

                    {latestAnswer.actions[0] && (
                      <Link
                        href={
                          latestAnswer
                            .actions[0]
                            .href
                        }
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                      >
                        {
                          latestAnswer
                            .actions[0]
                            .ctaLabel
                        }
                        <ArrowRight
                          size={13}
                        />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })()}

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

              const toneClasses =
                getToneClasses(
                  entry.answer.tone
                );

              const verdict =
                getVerdictPresentation(
                  entry.answer.assessment.verdict
                );

              const VerdictIcon =
                verdict.Icon;

              return (
                <div
                  key={entry.id}
                  className="flex justify-start"
                >
                  <article
                    className={`max-w-3xl rounded-2xl rounded-bl-md border px-5 py-5 ${toneClasses.article}`}
                  >
                    <div
                      className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${toneClasses.label}`}
                    >
                      <Bot size={15} />
                      Finovo Advisor
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${verdict.className}`}
                      >
                        <VerdictIcon size={14} />
                        {verdict.label}
                      </div>

                      <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
                        Fit score{" "}
                        <span className="font-semibold text-white">
                          {
                            entry.answer
                              .assessment
                              .score
                          }
                          /100
                        </span>
                      </div>

                      <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
                        {
                          entry.answer
                            .assessment
                            .label
                        }
                      </div>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
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
<div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                        Recommended actions
                      </p>

                      <div className="mt-2 space-y-2">
                        {entry.answer.actions.map((action) => (
                          <div
                            key={action.id}
                            className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3"
                          >
                            <div className="flex items-start gap-3">
                              <ArrowRight
                                size={15}
                                className="mt-0.5 shrink-0 text-blue-400"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-white">
                                    {action.title}
                                  </p>

                                  <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                      action.priority === "high"
                                        ? "border-red-500/20 bg-red-500/10 text-red-300"
                                        : action.priority === "medium"
                                          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                                          : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                                    }`}
                                  >
                                    {action.priority}
                                  </span>
                                </div>

                                <p className="mt-1 text-sm leading-6 text-zinc-400">
                                  {action.detail}
                                </p>

                                <Link
                                  href={action.href}
                                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                                >
                                  {action.ctaLabel}
                                  <ArrowRight
                                    size={13}
                                  />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="mt-5 text-xs leading-5 text-zinc-600">
                      Monthly room is based on recorded surplus and does not include
                      unrecorded or unexpected costs.
                    </p>

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
            maxLength={2_000}
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

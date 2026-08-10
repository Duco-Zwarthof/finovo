"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Info,
  Sparkles,
} from "lucide-react";

import type {
  FinancialInsight,
  InsightLevel,
} from "@/lib/insight-types";

type SmartInsightsOverviewProps = {
  insights: readonly FinancialInsight[];
  maxItems?: number;
};

const levelStyles: Record<
  InsightLevel,
  {
    icon: typeof CheckCircle2;
    iconClassName: string;
    containerClassName: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-400",
    containerClassName:
      "border-emerald-500/15 bg-emerald-500/[0.04]",
  },
  warning: {
    icon: CircleAlert,
    iconClassName: "text-amber-400",
    containerClassName:
      "border-amber-500/15 bg-amber-500/[0.04]",
  },
  info: {
    icon: Info,
    iconClassName: "text-blue-400",
    containerClassName:
      "border-blue-500/15 bg-blue-500/[0.04]",
  },
};

export default function SmartInsightsOverview({
  insights,
  maxItems = 4,
}: SmartInsightsOverviewProps) {
  const visibleInsights = insights.slice(
    0,
    maxItems
  );

  return (
    <section className="h-full rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Sparkles size={17} />
            <span>Financial intelligence</span>
          </div>

          <h2 className="mt-3 text-xl font-bold tracking-tight text-white">
            What deserves your attention
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Your highest-priority insights from forecast,
            cash flow, goals and financial health.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-500">
          {insights.length}
        </span>
      </div>

      {visibleInsights.length === 0 ? (
        <div className="mt-7 flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
          <div>
            <p className="text-sm font-semibold text-white">
              No insights available yet
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Add financial data to let Finovo build useful insights.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          {visibleInsights.map((insight) => {
            const style =
              levelStyles[insight.level];
            const Icon = style.icon;

            const content = (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950/70">
                  <Icon
                    size={17}
                    className={
                      style.iconClassName
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">
                      {insight.title}
                    </p>

                    <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                      {insight.priority}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500">
                    {insight.description}
                  </p>
                </div>

                {insight.actionHref && (
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-blue-400"
                  />
                )}
              </>
            );

            if (
              insight.actionHref &&
              insight.actionLabel
            ) {
              return (
                <Link
                  key={insight.id}
                  href={insight.actionHref}
                  className={`group flex items-start gap-3 rounded-2xl border p-4 transition hover:border-blue-500/25 ${style.containerClassName}`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <article
                key={insight.id}
                className={`flex items-start gap-3 rounded-2xl border p-4 ${style.containerClassName}`}
              >
                {content}
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-6 border-t border-white/10 pt-5">
        <Link
          href="/net-worth"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
        >
          View all insights
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

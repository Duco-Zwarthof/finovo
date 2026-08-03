"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  Sparkles,
} from "lucide-react";

import type {
  FinancialInsight,
  InsightLevel,
} from "@/lib/insight-types";

type FinancialInsightsProps = {
  insights: readonly FinancialInsight[];
};

type InsightFilter = "all" | InsightLevel;

const filters: Array<{
  key: InsightFilter;
  label: string;
}> = [
  { key: "all", label: "All" },
  { key: "warning", label: "Warnings" },
  { key: "info", label: "Info" },
  { key: "success", label: "Success" },
];

const levelStyles: Record<
  InsightLevel,
  {
    icon: typeof CheckCircle2;
    iconClassName: string;
    borderClassName: string;
    backgroundClassName: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-400",
    borderClassName: "border-emerald-500/15",
    backgroundClassName: "bg-emerald-500/[0.04]",
  },
  warning: {
    icon: CircleAlert,
    iconClassName: "text-amber-400",
    borderClassName: "border-amber-500/15",
    backgroundClassName: "bg-amber-500/[0.04]",
  },
  info: {
    icon: Info,
    iconClassName: "text-blue-400",
    borderClassName: "border-blue-500/15",
    backgroundClassName: "bg-blue-500/[0.04]",
  },
};

export default function FinancialInsights({
  insights,
}: FinancialInsightsProps) {
  const [activeFilter, setActiveFilter] =
    useState<InsightFilter>("all");

  const counts = useMemo(
    () => ({
      all: insights.length,
      warning: insights.filter(
        (insight) =>
          insight.level === "warning"
      ).length,
      info: insights.filter(
        (insight) => insight.level === "info"
      ).length,
      success: insights.filter(
        (insight) =>
          insight.level === "success"
      ).length,
    }),
    [insights]
  );

  const visibleInsights = useMemo(
    () =>
      insights
        .filter(
          (insight) =>
            activeFilter === "all" ||
            insight.level === activeFilter
        )
        .slice(0, 5),
    [activeFilter, insights]
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Sparkles size={17} />
            <span>Financial insights</span>
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
            What deserves your attention
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Insights are generated locally from your current Finovo data
            and ordered by priority.
          </p>
        </div>

        <span className="w-fit rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-400">
          {insights.length} total
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Filter financial insights"
        className="mt-7 flex flex-wrap gap-2"
      >
        {filters.map((filter) => {
          const isActive =
            activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() =>
                setActiveFilter(filter.key)
              }
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "border border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {filter.label}
              <span
                className={`ml-2 ${
                  isActive
                    ? "text-blue-100"
                    : "text-zinc-600"
                }`}
              >
                {counts[filter.key]}
              </span>
            </button>
          );
        })}
      </div>

      {visibleInsights.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
          <p className="text-sm font-semibold text-white">
            No insights in this category
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Choose another filter to view the available insights.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {visibleInsights.map((insight) => {
            const style =
              levelStyles[insight.level];
            const Icon = style.icon;

            return (
              <article
                key={insight.id}
                className={`rounded-2xl border p-5 ${style.borderClassName} ${style.backgroundClassName}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950/70">
                    <Icon
                      size={19}
                      className={
                        style.iconClassName
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {insight.title}
                      </h3>

                      <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                        {insight.priority}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {insight.description}
                    </p>

                    {insight.actionLabel &&
                      insight.actionHref && (
                        <Link
                          href={
                            insight.actionHref
                          }
                          className="mt-4 inline-flex text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                        >
                          {insight.actionLabel}
                        </Link>
                      )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs leading-5 text-zinc-600">
        These insights are informational and rule-based. They are not
        financial advice.
      </p>
    </section>
  );
}

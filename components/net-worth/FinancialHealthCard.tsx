import {
  CircleGauge,
  ShieldCheck,
} from "lucide-react";

import type { FinancialHealthResult } from "@/lib/financial-health-types";

type FinancialHealthCardProps = {
  result: FinancialHealthResult;
};

const ratingLabels = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  "needs-attention": "Needs attention",
} as const;

const ratingDescriptions = {
  excellent:
    "Your current cash flow, buffer and goal progress form a strong financial foundation.",
  good:
    "Your finances are in a healthy position, with some room to strengthen one or more areas.",
  fair:
    "Your financial position is developing, but a few areas deserve closer attention.",
  "needs-attention":
    "Your current data points to financial pressure or missing foundations that should be addressed first.",
} as const;

export default function FinancialHealthCard({
  result,
}: FinancialHealthCardProps) {
  const progressDegrees =
    Math.min(Math.max(result.score, 0), 100) *
    3.6;

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <CircleGauge size={17} />
            <span>Financial health</span>
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
            {ratingLabels[result.rating]}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            {ratingDescriptions[result.rating]}
          </p>
        </div>

        <div
          className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(rgb(37 99 235) ${progressDegrees}deg, rgb(39 39 42) ${progressDegrees}deg)`,
          }}
        >
          <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-zinc-950">
            <span className="text-2xl font-bold text-white">
              {result.score}
            </span>

            <span className="text-xs text-zinc-500">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {result.factors.map((factor) => {
          const percentage =
            factor.maximumScore === 0
              ? 0
              : (factor.score /
                  factor.maximumScore) *
                100;

          return (
            <article
              key={factor.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={15}
                      className="text-blue-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      {factor.label}
                    </h3>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {factor.summary}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold text-white">
                  {factor.score} /{" "}
                  {factor.maximumScore}
                </p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      percentage,
                      100
                    )}%`,
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-xs leading-5 text-zinc-600">
        This score is an informational summary based on the financial
        data currently stored in Finovo. It is not financial advice.
      </p>
    </section>
  );
}

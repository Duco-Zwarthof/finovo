import {
  AlertTriangle,
  CircleCheck,
  Landmark,
  Link2Off,
  ShieldAlert,
} from "lucide-react";

import type {
  CashflowForecastAnalysis,
  ForecastAccountProjection,
} from "@/lib/cashflow-forecast-analysis";
import {
  formatCurrency,
} from "@/lib/money";
import {
  minorUnitsToEuroAmount,
} from "@/lib/transaction-amount";

type AccountForecastsProps = {
  analysis: CashflowForecastAnalysis;
};

function formatMinorCurrency(
  amountMinor: number
) {
  return formatCurrency(
    minorUnitsToEuroAmount(
      amountMinor
    ) ?? 0
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }
  ).format(
    new Date(
      `${value}T00:00:00Z`
    )
  );
}

function AccountProjectionCard({
  projection,
}: {
  projection: ForecastAccountProjection;
}) {
  const atRisk =
    projection.firstNegativeDate !==
    null;

  const isDeclining =
    projection.projectedChangeMinor <
    0;

  return (
    <article
      className={`rounded-2xl border p-4 ${
        atRisk
          ? "border-red-500/20 bg-red-500/[0.05]"
          : "border-white/10 bg-zinc-950/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Landmark
              size={15}
              className={
                atRisk
                  ? "text-red-400"
                  : "text-blue-400"
              }
            />

            <p className="truncate text-sm font-semibold text-white">
              {
                projection.accountName
              }
            </p>
          </div>

          <p className="mt-1 text-xs text-zinc-600">
            {
              projection.eventCount
            }{" "}
            assigned forecast events
          </p>
        </div>

        {atRisk && (
          <span className="rounded-full border border-red-500/20 bg-red-500/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-300">
            At risk
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
            Expected
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            {formatMinorCurrency(
              projection.endingBalanceMinor
            )}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
            Lowest
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              projection.lowestBalanceMinor <
              0
                ? "text-red-400"
                : "text-white"
            }`}
          >
            {formatMinorCurrency(
              projection.lowestBalanceMinor
            )}
          </p>
        </div>
      </div>

      <p
        className={`mt-3 text-xs ${
          isDeclining
            ? "text-amber-300"
            : "text-zinc-600"
        }`}
      >
        {atRisk
          ? `Projected below €0 on ${formatDate(
              projection.firstNegativeDate ??
                projection.lowestBalanceDate
            )}.`
          : `Lowest projected balance on ${formatDate(
              projection.lowestBalanceDate
            )}.`}
      </p>
    </article>
  );
}

export default function AccountForecasts({
  analysis,
}: AccountForecastsProps) {
  const riskAccountCount =
    analysis.accountProjections.filter(
      (projection) =>
        projection.firstNegativeDate !==
        null
    ).length;

  const status =
    analysis.riskLevel ===
    "risk"
      ? {
          icon: ShieldAlert,
          title:
            "Cashflow risk detected",
          detail:
            riskAccountCount >
            0
              ? `${riskAccountCount} liquid account${
                  riskAccountCount ===
                  1
                    ? ""
                    : "s"
                } could fall below €0 in this forecast window.`
              : "Your total projected liquid balance could fall below €0.",
          style:
            "border-red-500/20 bg-red-500/[0.06] text-red-300",
        }
      : analysis.riskLevel ===
          "watch"
        ? {
            icon:
              AlertTriangle,
            title:
              "Forecast needs attention",
            detail:
              analysis.unassignedRecurringCount >
              0
                ? `${analysis.unassignedRecurringCount} active recurring item${
                    analysis.unassignedRecurringCount ===
                    1
                      ? " is"
                      : "s are"
                  } not assigned to a liquid account, so account-level warnings are incomplete.`
                : "Your projected liquid balance is declining over this period.",
            style:
              "border-amber-500/20 bg-amber-500/[0.06] text-amber-300",
          }
        : {
            icon:
              CircleCheck,
            title:
              "Forecast looks healthy",
            detail:
              "No liquid account is projected below €0 in the selected period.",
            style:
              "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300",
          };

  const StatusIcon =
    status.icon;

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Account forecast
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
            Recurring items assigned to a checking, savings or cash account are projected against that specific balance.
          </p>
        </div>

        <div
          className={`flex max-w-lg items-start gap-3 rounded-2xl border px-4 py-3 ${status.style}`}
        >
          <StatusIcon
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="text-sm font-semibold">
              {status.title}
            </p>

            <p className="mt-1 text-xs leading-5 opacity-80">
              {status.detail}
            </p>
          </div>
        </div>
      </div>

      {analysis.unassignedRecurringCount >
        0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <Link2Off
            size={17}
            className="mt-0.5 shrink-0 text-zinc-500"
          />

          <div>
            <p className="text-sm font-semibold text-zinc-300">
              Improve account-level accuracy
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Assign accounts to recurring items on the Recurring page. Total cashflow still includes unassigned recurring income and expenses, but specific account warnings cannot.
            </p>
          </div>
        </div>
      )}

      {analysis.accountProjections.length >
      0 ? (
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {analysis.accountProjections.map(
            (projection) => (
              <AccountProjectionCard
                key={
                  projection.accountId
                }
                projection={
                  projection
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-zinc-950/40 p-6 text-center">
          <p className="text-sm font-semibold text-white">
            No liquid accounts available
          </p>

          <p className="mt-1 text-sm text-zinc-600">
            Add a checking, savings or cash account to get account-level forecasts.
          </p>
        </div>
      )}
    </section>
  );
}

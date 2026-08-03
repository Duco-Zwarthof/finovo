import { ChartNoAxesCombined } from "lucide-react";

import type { PortfolioCoverage } from "@/lib/net-worth-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type PortfolioCoverageCardProps = {
  coverage: PortfolioCoverage;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function PortfolioCoverageCard({
  coverage,
}: PortfolioCoverageCardProps) {
  const percentage =
    coverage.coveragePercentage ?? 0;

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Portfolio coverage
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Compares your entered holdings with the balances of included investment accounts.
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <ChartNoAxesCombined size={20} />
        </div>
      </div>

      {coverage.investmentAccountsMinor === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
          <p className="text-sm font-semibold text-white">
            No included investment account
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Add an investment account to compare its balance with your tracked holdings.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">
                Coverage
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                {Math.round(percentage * 10) / 10}%
              </p>
            </div>

            <p className="text-right text-sm text-zinc-400">
              {formatMinorCurrency(
                coverage.trackedHoldingsMinor
              )}
              <br />
              <span className="text-zinc-600">
                of{" "}
                {formatMinorCurrency(
                  coverage.investmentAccountsMinor
                )}
              </span>
            </p>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${Math.min(percentage, 100)}%`,
              }}
            />
          </div>

          <p className="mt-5 text-sm leading-6 text-zinc-500">
            Difference:{" "}
            <span className="font-semibold text-zinc-300">
              {formatMinorCurrency(
                coverage.differenceMinor
              )}
            </span>
          </p>
        </>
      )}
    </section>
  );
}

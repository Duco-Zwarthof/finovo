import {
  Bitcoin,
  ChartNoAxesCombined,
  Coins,
  Landmark,
  Package,
  TrendingUp,
} from "lucide-react";

import type {
  InvestmentAssetType,
  InvestmentHolding,
} from "@/lib/investment-types";
import {
  calculateHoldingGainMinor,
  calculateHoldingGainPercentage,
  calculateHoldingValueMinor,
} from "@/lib/investments";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type HoldingCardProps = {
  holding: InvestmentHolding;
  onEdit?: (holdingId: string) => void;
};

const assetTypeLabels: Record<InvestmentAssetType, string> = {
  etf: "ETF",
  stock: "Stock",
  crypto: "Crypto",
  bond: "Bond",
  fund: "Fund",
  other: "Other",
};

const assetTypeIcons = {
  etf: ChartNoAxesCombined,
  stock: TrendingUp,
  crypto: Bitcoin,
  bond: Landmark,
  fund: Coins,
  other: Package,
} satisfies Record<
  InvestmentAssetType,
  typeof TrendingUp
>;

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "Not available";
  }

  const rounded = Math.round(value * 10) / 10;
  const prefix = rounded > 0 ? "+" : "";

  return `${prefix}${rounded}%`;
}

export default function HoldingCard({
  holding,
  onEdit,
}: HoldingCardProps) {
  const Icon = assetTypeIcons[holding.assetType];
  const valueMinor =
    calculateHoldingValueMinor(holding);
  const gainMinor =
    calculateHoldingGainMinor(holding);
  const gainPercentage =
    calculateHoldingGainPercentage(holding);
  const isNegative = gainMinor < 0;

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Icon size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white">
              {holding.name}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              {holding.symbol.toUpperCase()} ·{" "}
              {assetTypeLabels[holding.assetType]}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-zinc-400">
          {holding.quantity}
        </span>
      </div>

      <div className="mt-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
            Current value
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {formatMinorCurrency(valueMinor)}
          </p>
        </div>

        <div className="text-right">
          <p
            className={`text-sm font-semibold ${
              isNegative
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            {formatMinorCurrency(gainMinor)}
          </p>

          <p
            className={`mt-1 text-xs ${
              isNegative
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            {formatPercentage(gainPercentage)}
          </p>
        </div>
      </div>
    </>
  );

  if (!onEdit) {
    return (
      <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
        {content}
      </article>
    );
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition hover:border-blue-500/25 hover:bg-zinc-900/90">
      <button
        type="button"
        onClick={() => onEdit(holding.id)}
        aria-label={`Edit ${holding.name}`}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900"
      >
        {content}
      </button>
    </article>
  );
}

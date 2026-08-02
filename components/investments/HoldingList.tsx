import type { InvestmentHolding } from "@/lib/investment-types";

import HoldingCard from "./HoldingCard";

type HoldingListProps = {
  holdings: readonly InvestmentHolding[];
  onEditHolding?: (holdingId: string) => void;
};

export default function HoldingList({
  holdings,
  onEditHolding,
}: HoldingListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {holdings.map((holding) => (
        <HoldingCard
          key={holding.id}
          holding={holding}
          onEdit={onEditHolding}
        />
      ))}
    </div>
  );
}

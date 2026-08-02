import {
  INVESTMENT_ASSET_TYPES,
  type InvestmentAssetType,
  type InvestmentHolding,
} from "./investment-types";
import { isValidAmountMinor } from "./transaction-amount";

export function isInvestmentAssetType(
  value: unknown
): value is InvestmentAssetType {
  return (
    typeof value === "string" &&
    INVESTMENT_ASSET_TYPES.includes(
      value as InvestmentAssetType
    )
  );
}

export function isValidInvestmentQuantity(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

export function isValidInvestmentHolding(
  value: unknown
): value is InvestmentHolding {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const holding = value as Record<string, unknown>;

  return (
    typeof holding.id === "string" &&
    holding.id.trim().length > 0 &&
    typeof holding.name === "string" &&
    holding.name.trim().length > 0 &&
    typeof holding.symbol === "string" &&
    holding.symbol.trim().length > 0 &&
    isInvestmentAssetType(holding.assetType) &&
    isValidInvestmentQuantity(holding.quantity) &&
    isValidAmountMinor(holding.averageBuyPriceMinor) &&
    isValidAmountMinor(holding.currentPriceMinor)
  );
}

function multiplyMinorByQuantity(
  amountMinor: number,
  quantity: number
): number {
  const result = Math.round(amountMinor * quantity);

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Investment value exceeds the safe minor-unit range"
    );
  }

  return result;
}

function addMinorUnits(
  first: number,
  second: number
): number {
  const result = first + second;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Investment total exceeds the safe minor-unit range"
    );
  }

  return result;
}

export function calculateHoldingCostMinor(
  holding: InvestmentHolding
): number {
  if (!isValidInvestmentHolding(holding)) {
    throw new TypeError(
      "Cannot calculate an invalid investment holding"
    );
  }

  return multiplyMinorByQuantity(
    holding.averageBuyPriceMinor,
    holding.quantity
  );
}

export function calculateHoldingValueMinor(
  holding: InvestmentHolding
): number {
  if (!isValidInvestmentHolding(holding)) {
    throw new TypeError(
      "Cannot calculate an invalid investment holding"
    );
  }

  return multiplyMinorByQuantity(
    holding.currentPriceMinor,
    holding.quantity
  );
}

export function calculateHoldingGainMinor(
  holding: InvestmentHolding
): number {
  return (
    calculateHoldingValueMinor(holding) -
    calculateHoldingCostMinor(holding)
  );
}

export function calculateHoldingGainPercentage(
  holding: InvestmentHolding
): number | null {
  const costMinor =
    calculateHoldingCostMinor(holding);

  if (costMinor === 0) {
    return null;
  }

  return (
    calculateHoldingGainMinor(holding) /
    costMinor
  ) * 100;
}

export function calculatePortfolioCostMinor(
  holdings: readonly InvestmentHolding[]
): number {
  return holdings.reduce(
    (total, holding) =>
      addMinorUnits(
        total,
        calculateHoldingCostMinor(holding)
      ),
    0
  );
}

export function calculatePortfolioValueMinor(
  holdings: readonly InvestmentHolding[]
): number {
  return holdings.reduce(
    (total, holding) =>
      addMinorUnits(
        total,
        calculateHoldingValueMinor(holding)
      ),
    0
  );
}

export function calculatePortfolioGainMinor(
  holdings: readonly InvestmentHolding[]
): number {
  return (
    calculatePortfolioValueMinor(holdings) -
    calculatePortfolioCostMinor(holdings)
  );
}

export function calculatePortfolioGainPercentage(
  holdings: readonly InvestmentHolding[]
): number | null {
  const costMinor =
    calculatePortfolioCostMinor(holdings);

  if (costMinor === 0) {
    return null;
  }

  return (
    calculatePortfolioGainMinor(holdings) /
    costMinor
  ) * 100;
}

export function addInvestmentHolding(
  holdings: readonly InvestmentHolding[],
  holding: InvestmentHolding
): InvestmentHolding[] {
  if (!isValidInvestmentHolding(holding)) {
    throw new TypeError(
      "Cannot add an invalid investment holding"
    );
  }

  if (
    holdings.some(
      (existing) => existing.id === holding.id
    )
  ) {
    throw new Error(
      "Investment holding already exists"
    );
  }

  return [...holdings, { ...holding }];
}

export function updateInvestmentHolding(
  holdings: readonly InvestmentHolding[],
  holding: InvestmentHolding
): InvestmentHolding[] {
  if (!isValidInvestmentHolding(holding)) {
    throw new TypeError(
      "Cannot update an invalid investment holding"
    );
  }

  if (
    !holdings.some(
      (existing) => existing.id === holding.id
    )
  ) {
    throw new Error(
      "Cannot update an investment holding that does not exist"
    );
  }

  return holdings.map((existing) =>
    existing.id === holding.id
      ? { ...holding }
      : { ...existing }
  );
}

export function deleteInvestmentHolding(
  holdings: readonly InvestmentHolding[],
  holdingId: string
): InvestmentHolding[] {
  return holdings
    .filter((holding) => holding.id !== holdingId)
    .map((holding) => ({ ...holding }));
}

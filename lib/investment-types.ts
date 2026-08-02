export const INVESTMENT_ASSET_TYPES = [
  "etf",
  "stock",
  "crypto",
  "bond",
  "fund",
  "other",
] as const;

export type InvestmentAssetType =
  (typeof INVESTMENT_ASSET_TYPES)[number];

export type InvestmentHolding = {
  id: string;
  name: string;
  symbol: string;
  assetType: InvestmentAssetType;
  quantity: number;
  averageBuyPriceMinor: number;
  currentPriceMinor: number;
};

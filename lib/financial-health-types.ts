export type FinancialHealthRating =
  | "excellent"
  | "good"
  | "fair"
  | "needs-attention";

export type FinancialHealthFactor = {
  id: "cash-flow" | "emergency-buffer" | "goal-progress";
  label: string;
  score: number;
  maximumScore: number;
  summary: string;
};

export type FinancialHealthResult = {
  score: number;
  rating: FinancialHealthRating;
  factors: FinancialHealthFactor[];
};

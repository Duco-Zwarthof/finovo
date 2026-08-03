import type {
  FinancialHealthFactor,
  FinancialHealthRating,
  FinancialHealthResult,
} from "./financial-health-types";
import type { FinancialOverview } from "./net-worth-types";

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getFinancialHealthRating(
  score: number
): FinancialHealthRating {
  if (score >= 85) {
    return "excellent";
  }

  if (score >= 70) {
    return "good";
  }

  if (score >= 50) {
    return "fair";
  }

  return "needs-attention";
}

export function calculateCashFlowFactor(
  overview: FinancialOverview
): FinancialHealthFactor {
  const maximumScore = 40;

  if (overview.monthlyIncomeMinor <= 0) {
    return {
      id: "cash-flow",
      label: "Monthly cash flow",
      score: 0,
      maximumScore,
      summary:
        "Add monthly income to evaluate your cash-flow position.",
    };
  }

  const surplusRate =
    overview.monthlySurplusMinor /
    overview.monthlyIncomeMinor;

  const score = roundScore(
    clamp(
      surplusRate / 0.2,
      0,
      1
    ) * maximumScore
  );

  return {
    id: "cash-flow",
    label: "Monthly cash flow",
    score,
    maximumScore,
    summary:
      surplusRate >= 0.2
        ? "Your monthly surplus is at least 20% of income."
        : surplusRate > 0
          ? "Your cash flow is positive, but the surplus is below 20% of income."
          : "Your monthly expenses currently meet or exceed income.",
  };
}

export function calculateEmergencyBufferFactor(
  overview: FinancialOverview
): FinancialHealthFactor {
  const maximumScore = 35;

  if (overview.monthlyExpensesMinor <= 0) {
    return {
      id: "emergency-buffer",
      label: "Emergency buffer",
      score:
        overview.liquidAssetsMinor > 0
          ? maximumScore
          : 0,
      maximumScore,
      summary:
        overview.liquidAssetsMinor > 0
          ? "Liquid assets are available, but monthly expenses are not yet recorded."
          : "Add liquid assets and monthly expenses to evaluate your buffer.",
    };
  }

  const monthsCovered =
    overview.liquidAssetsMinor /
    overview.monthlyExpensesMinor;

  const score = roundScore(
    clamp(
      monthsCovered / 6,
      0,
      1
    ) * maximumScore
  );

  return {
    id: "emergency-buffer",
    label: "Emergency buffer",
    score,
    maximumScore,
    summary:
      monthsCovered >= 6
        ? "Liquid assets cover at least six months of current expenses."
        : monthsCovered >= 3
          ? "Liquid assets cover between three and six months of expenses."
          : "Liquid assets cover fewer than three months of current expenses.",
  };
}

export function calculateGoalProgressFactor(
  overview: FinancialOverview
): FinancialHealthFactor {
  const maximumScore = 25;

  if (
    overview.goalProgressPercentage === null
  ) {
    return {
      id: "goal-progress",
      label: "Goal progress",
      score: maximumScore / 2,
      maximumScore,
      summary:
        "No savings goals are available, so this factor is scored neutrally.",
    };
  }

  const score = roundScore(
    clamp(
      overview.goalProgressPercentage / 100,
      0,
      1
    ) * maximumScore
  );

  return {
    id: "goal-progress",
    label: "Goal progress",
    score,
    maximumScore,
    summary:
      overview.goalProgressPercentage >= 75
        ? "Your savings goals are well advanced."
        : overview.goalProgressPercentage >= 25
          ? "You are making measurable progress toward your savings goals."
          : "Your savings goals are still in an early stage.",
  };
}

export function calculateFinancialHealth(
  overview: FinancialOverview
): FinancialHealthResult {
  const factors = [
    calculateCashFlowFactor(overview),
    calculateEmergencyBufferFactor(overview),
    calculateGoalProgressFactor(overview),
  ];

  const score = Math.round(
    factors.reduce(
      (total, factor) =>
        total + factor.score,
      0
    )
  );

  return {
    score,
    rating:
      getFinancialHealthRating(score),
    factors,
  };
}

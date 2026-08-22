import type {
  AdvisorContext,
} from "./advisor-types";

export type AdvisorVerdict =
  | "safe"
  | "tight"
  | "risky"
  | "informational";

export type AdvisorAssessment = {
  verdict: AdvisorVerdict;
  score: number;
  label: string;
  estimatedMonthlyRoomMinor: number;
};

const BUFFER_MONTHS = 3;

function clampScore(
  score: number
) {
  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

export function calculateEstimatedMonthlyRoomMinor(
  context: AdvisorContext
) {
  return Math.max(
    0,
    context.monthlySurplusMinor
  );
}

export function assessCurrentFinancialPosition(
  context: AdvisorContext
): AdvisorAssessment {
  const estimatedMonthlyRoomMinor =
    calculateEstimatedMonthlyRoomMinor(
      context
    );

  const targetBufferMinor =
    Math.max(
      0,
      context.monthlyExpensesMinor *
        BUFFER_MONTHS
    );

  const hasTargetBuffer =
    targetBufferMinor === 0 ||
    context.liquidAssetsMinor >=
      targetBufferMinor;

  const forecastPositive =
    context.forecastLowestBalanceMinor >=
    0;

  const surplusPositive =
    context.monthlySurplusMinor > 0;

  let score = 0;

  score += surplusPositive ? 40 : 0;
  score += hasTargetBuffer ? 35 : 0;
  score += forecastPositive ? 25 : 0;

  const finalScore =
    clampScore(score);

  if (
    surplusPositive &&
    hasTargetBuffer &&
    forecastPositive
  ) {
    return {
      verdict: "safe",
      score: finalScore,
      label: "Healthy room",
      estimatedMonthlyRoomMinor,
    };
  }

  if (
    context.monthlySurplusMinor >= 0 &&
    forecastPositive
  ) {
    return {
      verdict: "tight",
      score: finalScore,
      label: "Limited room",
      estimatedMonthlyRoomMinor,
    };
  }

  return {
    verdict: "risky",
    score: finalScore,
    label: "Needs attention",
    estimatedMonthlyRoomMinor,
  };
}

export function assessMonthlyCommitment(
  contributionMinor: number,
  context: AdvisorContext
): AdvisorAssessment {
  const base =
    assessCurrentFinancialPosition(
      context
    );

  const room =
    base.estimatedMonthlyRoomMinor;

  if (room <= 0) {
    return {
      ...base,
      verdict: "risky",
      score: 0,
      label: "Exceeds monthly room",
    };
  }

  const shareOfRoom =
    contributionMinor / room;

  if (
    shareOfRoom <= 0.6 &&
    base.verdict === "safe"
  ) {
    return {
      ...base,
      verdict: "safe",
      score: clampScore(
        base.score -
          shareOfRoom * 20
      ),
      label: "Comfortable fit",
    };
  }

  if (shareOfRoom <= 1) {
    return {
      ...base,
      verdict: "tight",
      score: clampScore(
        Math.min(
          base.score,
          70 -
            shareOfRoom * 20
        )
      ),
      label: "Fits, but uses most of your room",
    };
  }

  return {
    ...base,
    verdict: "risky",
    score: clampScore(
      35 -
        (shareOfRoom - 1) * 20
    ),
    label: "Above current monthly room",
  };
}

export function assessOneOffPurchase(
  purchaseMinor: number,
  context: AdvisorContext
): AdvisorAssessment {
  const afterPurchaseMinor =
    context.liquidAssetsMinor -
    purchaseMinor;

  const adjustedForecastLowMinor =
    context.forecastLowestBalanceMinor -
    purchaseMinor;

  const targetBufferMinor =
    Math.max(
      0,
      context.monthlyExpensesMinor *
        BUFFER_MONTHS
    );

  const keepsTargetBuffer =
    targetBufferMinor === 0 ||
    afterPurchaseMinor >=
      targetBufferMinor;

  const keepsCashPositive =
    afterPurchaseMinor >= 0 &&
    adjustedForecastLowMinor >= 0;

  const base =
    assessCurrentFinancialPosition(
      context
    );

  if (
    keepsCashPositive &&
    keepsTargetBuffer
  ) {
    return {
      ...base,
      verdict: "safe",
      score: clampScore(
        Math.max(
          75,
          base.score
        )
      ),
      label: "Buffer preserved",
    };
  }

  if (keepsCashPositive) {
    return {
      ...base,
      verdict: "tight",
      score: clampScore(
        Math.min(
          base.score,
          60
        )
      ),
      label: "Affordable, but buffer gets tight",
    };
  }

  return {
    ...base,
    verdict: "risky",
    score: clampScore(
      Math.min(
        base.score,
        25
      )
    ),
    label: "Cash position would be pressured",
  };
}

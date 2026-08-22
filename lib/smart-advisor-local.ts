import type { AdvisorContext } from "./advisor-types";
import {
  classifyAdvisorQuestion,
  createAdvisorQuestion,
} from "./advisor";
import type { LocalAdvisorAnswer } from "./smart-advisor-local-types";
import {
  assessCurrentFinancialPosition,
  assessMonthlyCommitment,
  assessOneOffPurchase,
} from "./advisor-assessment";
import { formatCurrency } from "./money";
import { amountMinorToEuroAmount } from "./transaction-amount";

const MINIMUM_BUFFER_MONTHS = 3;

function createScenarioSupportingPoint(
  context: AdvisorContext
): string | null {
  if (!context.scenario) {
    return null;
  }

  return `Saved ${context.scenario.years}-year scenario: bear ${formatMinorCurrency(
    context.scenario.bearEndingNetWorthMinor
  )}, base ${formatMinorCurrency(
    context.scenario.baseEndingNetWorthMinor
  )}, bull ${formatMinorCurrency(
    context.scenario.bullEndingNetWorthMinor
  )} ending net worth.`;
}


function formatMinorCurrency(
  amountMinor: number
): string {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

function normalizeLocalizedMoneyNumber(
  rawValue: string
): number | null {
  const compact = rawValue.replace(/\s/g, "");

  const commaCount =
    (compact.match(/,/g) ?? []).length;
  const dotCount =
    (compact.match(/\./g) ?? []).length;

  let normalized = compact;

  if (commaCount > 0 && dotCount > 0) {
    const lastComma =
      compact.lastIndexOf(",");
    const lastDot =
      compact.lastIndexOf(".");

    if (lastComma > lastDot) {
      normalized = compact
        .replace(/\./g, "")
        .replace(",", ".");
    } else {
      normalized = compact.replace(/,/g, "");
    }
  } else if (commaCount > 0) {
    const parts = compact.split(",");
    const lastPart =
      parts[parts.length - 1];

    const looksLikeDecimal =
      commaCount === 1 &&
      lastPart.length >= 1 &&
      lastPart.length <= 2;

    normalized = looksLikeDecimal
      ? compact.replace(",", ".")
      : compact.replace(/,/g, "");
  } else if (dotCount > 0) {
    const parts = compact.split(".");
    const lastPart =
      parts[parts.length - 1];

    const looksLikeDecimal =
      dotCount === 1 &&
      lastPart.length >= 1 &&
      lastPart.length <= 2;

    normalized = looksLikeDecimal
      ? compact
      : compact.replace(/\./g, "");
  }

  const amount = Number(normalized);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return null;
  }

  return amount;
}

function parseMoneyAmountMinor(
  text: string
): number | null {
  const match = text.match(
    /€\s*([0-9][0-9.,\s]*)/
  );

  if (!match) {
    return null;
  }

  const euroAmount =
    normalizeLocalizedMoneyNumber(
      match[1].trim()
    );

  if (euroAmount === null) {
    return null;
  }

  return Math.round(euroAmount * 100);
}

function createAffordabilityAnswer(
  question: string,
  context: AdvisorContext
): LocalAdvisorAnswer {
  const purchaseMinor =
    parseMoneyAmountMinor(question);

  if (purchaseMinor === null) {
    return {
      category: "affordability",
      tone: "neutral",
      headline:
        "Add a purchase amount for a more useful affordability check.",
      summary:
        "Finovo can compare a planned purchase with your liquid assets, monthly surplus and projected low balance.",
      supportingPoints: [
        `Current liquid assets: ${formatMinorCurrency(
          context.liquidAssetsMinor
        )}.`,
        `Current monthly surplus: ${formatMinorCurrency(
          context.monthlySurplusMinor
        )}.`,
        `Lowest projected balance: ${formatMinorCurrency(
          context.forecastLowestBalanceMinor
        )} on ${context.forecastLowestBalanceDate}.`,
      ],
      recommendation:
        "Try a question such as “Can I afford a €2,000 holiday?”",
      disclaimer:
        "This is an informational planning calculation based only on data currently stored in Finovo.",
      assessment:
        assessCurrentFinancialPosition(
          context
        ),
    };
  }

  const liquidAssetsAfterPurchaseMinor =
    context.liquidAssetsMinor - purchaseMinor;

  const adjustedForecastLowMinor =
    context.forecastLowestBalanceMinor -
    purchaseMinor;

  const expenseCoverageMonths =
    context.monthlyExpensesMinor > 0
      ? liquidAssetsAfterPurchaseMinor /
        context.monthlyExpensesMinor
      : null;

  const keepsCashPositive =
    liquidAssetsAfterPurchaseMinor >= 0 &&
    adjustedForecastLowMinor >= 0;

  const keepsRecommendedBuffer =
    expenseCoverageMonths === null ||
    expenseCoverageMonths >=
      MINIMUM_BUFFER_MONTHS;

  const affordable =
    keepsCashPositive &&
    keepsRecommendedBuffer;

  const headline = affordable
    ? "This purchase appears affordable within your current Finovo data."
    : keepsCashPositive
      ? "You could cover this purchase, but it would weaken your cash buffer."
      : "This purchase would put meaningful pressure on your current cash position.";

  const supportingPoints = [
    `Purchase amount: ${formatMinorCurrency(
      purchaseMinor
    )}.`,
    `Liquid assets after purchase: ${formatMinorCurrency(
      liquidAssetsAfterPurchaseMinor
    )}.`,
    `Adjusted lowest forecast balance: ${formatMinorCurrency(
      adjustedForecastLowMinor
    )}.`,
    `Current monthly surplus: ${formatMinorCurrency(
      context.monthlySurplusMinor
    )}.`,
    `Financial Health Score: ${context.financialHealthScore}/100.`,
  ];

  if (expenseCoverageMonths !== null) {
    supportingPoints.push(
      `Estimated expense coverage after purchase: ${Math.max(
        0,
        Math.round(expenseCoverageMonths * 10) /
          10
      )} months.`
    );
  }

  return {
    category: "affordability",
    tone: affordable
      ? "positive"
      : "caution",
    headline,
    summary: `After a ${formatMinorCurrency(
      purchaseMinor
    )} purchase, estimated liquid assets would be ${formatMinorCurrency(
      liquidAssetsAfterPurchaseMinor
    )}. Your adjusted lowest forecast balance would be ${formatMinorCurrency(
      adjustedForecastLowMinor
    )}.`,
    supportingPoints,
    recommendation: affordable
      ? "Check whether the purchase conflicts with a near-term goal or one-off expense that is not yet recorded in Finovo."
      : "Consider reducing the amount or delaying the purchase until your forecast and cash buffer are stronger.",
    disclaimer:
      "This is an informational planning calculation based only on data currently stored in Finovo.",
    assessment:
      assessOneOffPurchase(
        purchaseMinor,
        context
      ),
  };
}

function createInvestingAnswer(
  question: string,
  context: AdvisorContext
): LocalAdvisorAnswer {
  const contributionMinor =
    parseMoneyAmountMinor(question);

  if (contributionMinor === null) {
    return {
      category: "investing",
      tone: "neutral",
      headline:
        "Add a monthly amount so Finovo can test it against your cash flow.",
      summary:
        "The advisor can compare a proposed monthly contribution with your current monthly surplus and projected cash position.",
      supportingPoints: [
        `Current monthly surplus: ${formatMinorCurrency(
          context.monthlySurplusMinor
        )}.`,
        `Current investment assets: ${formatMinorCurrency(
          context.investmentAssetsMinor
        )}.`,
        `Lowest projected balance: ${formatMinorCurrency(
          context.forecastLowestBalanceMinor
        )}.`,
      ],
      recommendation:
        "Try “What if I invest €250 per month extra?”",
      disclaimer:
        "No investment return is assumed here and this is not investment advice.",
      assessment:
        assessCurrentFinancialPosition(
          context
        ),
    };
  }

  const remainingSurplusMinor =
    context.monthlySurplusMinor -
    contributionMinor;

  const annualContributionMinor =
    contributionMinor * 12;

  const sustainable =
    remainingSurplusMinor >= 0 &&
    context.forecastLowestBalanceMinor >= 0;

  return {
    category: "investing",
    tone: sustainable
      ? "positive"
      : "caution",
    headline: sustainable
      ? "This monthly contribution fits within your current recorded surplus."
      : "This monthly contribution would exceed or heavily reduce your current recorded surplus.",
    summary: `An extra ${formatMinorCurrency(
      contributionMinor
    )} per month equals ${formatMinorCurrency(
      annualContributionMinor
    )} of additional contributions over 12 months, before investment returns.`,
    supportingPoints: [
      `Current monthly surplus: ${formatMinorCurrency(
        context.monthlySurplusMinor
      )}.`,
      `Surplus after extra investing: ${formatMinorCurrency(
        remainingSurplusMinor
      )}.`,
      `Additional 12-month contributions: ${formatMinorCurrency(
        annualContributionMinor
      )}.`,
      `Current investment assets: ${formatMinorCurrency(
        context.investmentAssetsMinor
      )}.`,
      ...(createScenarioSupportingPoint(
        context
      )
        ? [
            createScenarioSupportingPoint(
              context
            ) as string,
          ]
        : []),
    ],
    recommendation: sustainable
      ? context.scenario
        ? `Your saved Scenario Planner assumptions use ${context.scenario.bearReturnPercent}% / ${context.scenario.baseReturnPercent}% / ${context.scenario.bullReturnPercent}% bear-base-bull returns over ${context.scenario.years} years. Review the full range before changing your contribution.`
        : "Use the Scenario Planner to test the long-term effect with your own time horizon and return assumption."
      : "A smaller monthly contribution would fit your current cash flow more comfortably.",
    disclaimer:
      "This calculation models contributions only and does not predict or guarantee investment returns.",
    assessment:
      assessMonthlyCommitment(
        contributionMinor,
        context
      ),
  };
}

function createSavingAnswer(
  context: AdvisorContext
): LocalAdvisorAnswer {
  const hasPositiveSurplus =
    context.monthlySurplusMinor > 0;

  return {
    category: "saving",
    tone: hasPositiveSurplus
      ? "positive"
      : "caution",
    headline: hasPositiveSurplus
      ? "Your current cash flow provides room to keep funding savings goals."
      : "Your current recorded cash flow makes additional saving difficult.",
    summary:
      context.goalProgressPercentage === null
        ? "No combined goal progress is currently available."
        : `Your combined recorded goal progress is ${
            Math.round(
              context.goalProgressPercentage * 10
            ) / 10
          }%.`,
    supportingPoints: [
      `Monthly surplus: ${formatMinorCurrency(
        context.monthlySurplusMinor
      )}.`,
      `Liquid assets: ${formatMinorCurrency(
        context.liquidAssetsMinor
      )}.`,
      `Lowest forecast balance: ${formatMinorCurrency(
        context.forecastLowestBalanceMinor
      )}.`,
      ...(createScenarioSupportingPoint(
        context
      )
        ? [
            createScenarioSupportingPoint(
              context
            ) as string,
          ]
        : []),
    ],
    recommendation: hasPositiveSurplus
      ? "Use Goals and the Scenario Planner to test a specific monthly contribution before changing your plan."
      : "Focus first on restoring positive monthly cash flow before increasing goal contributions.",
    disclaimer:
      "This is informational planning support based on the data currently stored in Finovo.",
    assessment:
      assessCurrentFinancialPosition(
        context
      ),
  };
}

function createCashflowAnswer(
  context: AdvisorContext
): LocalAdvisorAnswer {
  const healthy =
    context.monthlySurplusMinor >= 0 &&
    context.forecastLowestBalanceMinor >= 0;

  return {
    category: "cashflow",
    tone: healthy
      ? "positive"
      : "caution",
    headline: healthy
      ? "Your recorded cash-flow position is currently positive."
      : "Your recorded cash-flow position deserves attention.",
    summary: `Monthly income is ${formatMinorCurrency(
      context.monthlyIncomeMinor
    )}, monthly expenses are ${formatMinorCurrency(
      context.monthlyExpensesMinor
    )}, and monthly surplus is ${formatMinorCurrency(
      context.monthlySurplusMinor
    )}.`,
    supportingPoints: [
      `30-day forecast ending balance: ${formatMinorCurrency(
        context.forecastEndingBalanceMinor
      )}.`,
      `Lowest projected balance: ${formatMinorCurrency(
        context.forecastLowestBalanceMinor
      )} on ${context.forecastLowestBalanceDate}.`,
      `Financial Health Score: ${context.financialHealthScore}/100.`,
      ...(createScenarioSupportingPoint(
        context
      )
        ? [
            createScenarioSupportingPoint(
              context
            ) as string,
          ]
        : []),
    ],
    recommendation: healthy
      ? "Review recurring expenses and budget categories if you want to increase your monthly surplus further."
      : "Review recurring payments and flexible budget categories first.",
    disclaimer:
      "Forecasts depend on the transactions and recurring items currently recorded in Finovo.",
    assessment:
      assessCurrentFinancialPosition(
        context
      ),
  };
}

function createGeneralAnswer(
  context: AdvisorContext
): LocalAdvisorAnswer {
  return {
    category: "general",
    tone: "neutral",
    headline:
      "Ask about spending, saving, investing or cash flow for a more specific calculation.",
    summary:
      "Finovo's Smart Advisor uses deterministic financial calculations rather than a paid external AI service.",
    supportingPoints: [
      `Net worth: ${formatMinorCurrency(
        context.netWorthMinor
      )}.`,
      `Liquid assets: ${formatMinorCurrency(
        context.liquidAssetsMinor
      )}.`,
      `Monthly surplus: ${formatMinorCurrency(
        context.monthlySurplusMinor
      )}.`,
      `Financial Health Score: ${context.financialHealthScore}/100.`,
    ],
    recommendation:
      "For example, ask whether you can afford a specific purchase or whether a monthly investment fits your cash flow.",
    disclaimer:
      "This is informational planning support, not personal financial advice.",
    assessment:
      assessCurrentFinancialPosition(
        context
      ),
  };
}

export function answerLocalAdvisorQuestion(
  text: string,
  context: AdvisorContext
): LocalAdvisorAnswer {
  const question =
    createAdvisorQuestion(text);

  const category =
    classifyAdvisorQuestion(
      question.text
    );

  switch (category) {
    case "affordability":
      return createAffordabilityAnswer(
        question.text,
        context
      );

    case "investing":
      return createInvestingAnswer(
        question.text,
        context
      );

    case "saving":
      return createSavingAnswer(
        context
      );

    case "cashflow":
      return createCashflowAnswer(
        context
      );

    default:
      return createGeneralAnswer(
        context
      );
  }
}

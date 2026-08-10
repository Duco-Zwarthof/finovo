import type { AdvisorContext } from "./advisor-types";

export type AdvisorApiRequest = {
  question: string;
  context: AdvisorContext;
};

export type AdvisorApiSuccess = {
  ok: true;
  answer: string;
};

export type AdvisorApiFailure = {
  ok: false;
  error: string;
};

export type AdvisorApiResponse =
  | AdvisorApiSuccess
  | AdvisorApiFailure;

export function parseAdvisorApiRequest(
  value: unknown
): AdvisorApiRequest {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    throw new TypeError("Invalid advisor request");
  }

  const candidate = value as Partial<AdvisorApiRequest>;

  if (
    typeof candidate.question !== "string" ||
    candidate.question.trim().length === 0 ||
    candidate.question.length > 2_000
  ) {
    throw new TypeError(
      "Advisor question must contain between 1 and 2000 characters"
    );
  }

  if (
    typeof candidate.context !== "object" ||
    candidate.context === null
  ) {
    throw new TypeError("Advisor context is required");
  }

  const context =
    candidate.context as Partial<AdvisorContext>;

  const requiredNumbers: Array<
    keyof AdvisorContext
  > = [
    "netWorthMinor",
    "liquidAssetsMinor",
    "investmentAssetsMinor",
    "monthlyIncomeMinor",
    "monthlyExpensesMinor",
    "monthlySurplusMinor",
    "financialHealthScore",
    "forecastEndingBalanceMinor",
    "forecastLowestBalanceMinor",
  ];

  for (const key of requiredNumbers) {
    if (
      typeof context[key] !== "number" ||
      !Number.isFinite(context[key])
    ) {
      throw new TypeError(
        `Advisor context field ${key} must be a finite number`
      );
    }
  }

  if (
    typeof context.forecastLowestBalanceDate !== "string"
  ) {
    throw new TypeError(
      "Advisor forecast date is required"
    );
  }

  if (
    context.goalProgressPercentage !== null &&
    (typeof context.goalProgressPercentage !== "number" ||
      !Number.isFinite(
        context.goalProgressPercentage
      ))
  ) {
    throw new TypeError(
      "Advisor goal progress must be a finite number or null"
    );
  }

  if (!Array.isArray(context.topInsights)) {
    throw new TypeError(
      "Advisor top insights must be an array"
    );
  }

  return {
    question: candidate.question.trim(),
    context: candidate.context as AdvisorContext,
  };
}

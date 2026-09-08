import type {
  Account,
} from "./account-types";
import type {
  BudgetActualInsight,
} from "./budget-actual";
import type {
  CashflowForecastAnalysis,
} from "./cashflow-forecast-analysis";
import type {
  RecurringTransaction,
} from "./recurring-transaction-types";

export type DashboardFinancialStatus =
  | "strong"
  | "stable"
  | "watch"
  | "risk";

export type DashboardFinancialOverview = {
  status: DashboardFinancialStatus;
  headline: string;
  focusLabel: string;
  focusHref: string;
  liquidBalanceMinor: number;
  netWorthMinor: number;
  includedAccountCount: number;
  monthlyIncomeMinor: number;
  monthlyExpensesMinor: number;
  monthlySurplusMinor: number;
  surplusRate: number | null;
  budgetStatus: BudgetActualInsight["status"];
  budgetPlannedMinor: number;
  budgetActualMinor: number;
  budgetVarianceMinor: number;
  budgetUsagePercentage: number | null;
  unbudgetedSpentMinor: number;
  forecastEndingBalanceMinor: number;
  forecastChangeMinor: number;
  forecastRecurringIncomeMinor: number;
  forecastRecurringExpensesMinor: number;
  forecastRiskAccountCount: number;
  activeRecurringCount: number;
  assignedRecurringCount: number;
  unassignedRecurringCount: number;
  recurringCoveragePercentage: number | null;
  nextRecurringTitle: string | null;
  nextRecurringDate: string | null;
  nextRecurringAmountMinor: number | null;
  nextRecurringType: "income" | "expense" | null;
};

export type DashboardFinancialOverviewInput = {
  accounts: readonly Account[];
  recurringItems: readonly RecurringTransaction[];
  netWorthMinor: number;
  monthlyIncomeMinor: number;
  monthlyExpensesMinor: number;
  monthlySurplusMinor: number;
  budgetActual: BudgetActualInsight;
  forecastAnalysis: CashflowForecastAnalysis;
};

function calculatePercent(
  numerator: number,
  denominator: number
) {
  if (
    denominator === 0
  ) {
    return null;
  }

  return (
    numerator /
    denominator
  ) * 100;
}

function addMinorUnits(
  first: number,
  second: number
) {
  const result =
    first + second;

  if (
    !Number.isSafeInteger(
      result
    )
  ) {
    throw new RangeError(
      "Dashboard financial overview exceeds the safe minor-unit range"
    );
  }

  return result;
}

function getStatus(
  monthlySurplusMinor: number,
  budgetActual: BudgetActualInsight,
  forecastAnalysis: CashflowForecastAnalysis
): DashboardFinancialStatus {
  const hasForecastRisk =
    forecastAnalysis.riskLevel ===
      "risk" ||
    forecastAnalysis.accountProjections.some(
      (projection) =>
        projection.firstNegativeDate !==
        null
    );

  if (
    hasForecastRisk
  ) {
    return "risk";
  }

  const hasPressure =
    monthlySurplusMinor < 0 ||
    budgetActual.status ===
      "over-budget" ||
    forecastAnalysis.riskLevel ===
      "watch";

  if (hasPressure) {
    return "watch";
  }

  const looksStrong =
    monthlySurplusMinor > 0 &&
    (
      budgetActual.status ===
        "on-track" ||
      budgetActual.status ===
        "no-budget"
    ) &&
    forecastAnalysis.riskLevel ===
      "healthy" &&
    forecastAnalysis.unassignedRecurringCount ===
      0;

  return looksStrong
    ? "strong"
    : "stable";
}

function getFocus(
  status: DashboardFinancialStatus,
  monthlySurplusMinor: number,
  budgetActual: BudgetActualInsight,
  forecastAnalysis: CashflowForecastAnalysis
) {
  if (
    status === "risk"
  ) {
    return {
      label:
        "Review cashflow risk",
      href: "/forecast",
    };
  }

  if (
    budgetActual.status ===
    "over-budget"
  ) {
    return {
      label:
        "Review budget pressure",
      href: "/budget",
    };
  }

  if (
    monthlySurplusMinor < 0
  ) {
    return {
      label:
        "Review this month's spending",
      href: "/transactions",
    };
  }

  if (
    forecastAnalysis.unassignedRecurringCount >
    0
  ) {
    return {
      label:
        "Assign recurring accounts",
      href: "/recurring",
    };
  }

  return {
    label:
      status === "strong"
        ? "View financial forecast"
        : "Review your overview",
    href:
      status === "strong"
        ? "/forecast"
        : "/transactions",
  };
}

function getHeadline(
  status: DashboardFinancialStatus
) {
  if (
    status === "risk"
  ) {
    return "Cashflow needs attention";
  }

  if (
    status === "watch"
  ) {
    return "A few areas need attention";
  }

  if (
    status === "strong"
  ) {
    return "Your finances look well positioned";
  }

  return "Your finances look stable";
}

export function calculateDashboardFinancialOverview({
  accounts,
  recurringItems,
  netWorthMinor,
  monthlyIncomeMinor,
  monthlyExpensesMinor,
  monthlySurplusMinor,
  budgetActual,
  forecastAnalysis,
}: DashboardFinancialOverviewInput): DashboardFinancialOverview {
  const status =
    getStatus(
      monthlySurplusMinor,
      budgetActual,
      forecastAnalysis
    );

  const focus =
    getFocus(
      status,
      monthlySurplusMinor,
      budgetActual,
      forecastAnalysis
    );

  let forecastRecurringIncomeMinor =
    0;

  let forecastRecurringExpensesMinor =
    0;

  for (
    const event of forecastAnalysis.forecast.events
  ) {
    if (
      event.type ===
      "income"
    ) {
      forecastRecurringIncomeMinor =
        addMinorUnits(
          forecastRecurringIncomeMinor,
          event.amountMinor
        );
    } else {
      forecastRecurringExpensesMinor =
        addMinorUnits(
          forecastRecurringExpensesMinor,
          event.amountMinor
        );
    }
  }

  const nextEvent =
    forecastAnalysis.forecast.events[
      0
    ] ?? null;

  const activeRecurringCount =
    recurringItems.filter(
      (item) =>
        item.isActive
    ).length;

  const coverageDenominator =
    forecastAnalysis.assignedRecurringCount +
    forecastAnalysis.unassignedRecurringCount;

  return {
    status,
    headline:
      getHeadline(status),
    focusLabel:
      focus.label,
    focusHref:
      focus.href,
    liquidBalanceMinor:
      forecastAnalysis.forecast
        .startingBalanceMinor,
    netWorthMinor,
    includedAccountCount:
      accounts.filter(
        (account) =>
          account.includedInNetWorth
      ).length,
    monthlyIncomeMinor,
    monthlyExpensesMinor,
    monthlySurplusMinor,
    surplusRate:
      calculatePercent(
        monthlySurplusMinor,
        monthlyIncomeMinor
      ),
    budgetStatus:
      budgetActual.status,
    budgetPlannedMinor:
      budgetActual.plannedMinor,
    budgetActualMinor:
      budgetActual.actualSpentMinor,
    budgetVarianceMinor:
      budgetActual.varianceMinor,
    budgetUsagePercentage:
      budgetActual.usagePercentage,
    unbudgetedSpentMinor:
      budgetActual.unbudgetedSpentMinor,
    forecastEndingBalanceMinor:
      forecastAnalysis.forecast
        .endingBalanceMinor,
    forecastChangeMinor:
      forecastAnalysis.forecast
        .projectedChangeMinor,
    forecastRecurringIncomeMinor,
    forecastRecurringExpensesMinor,
    forecastRiskAccountCount:
      forecastAnalysis.accountProjections.filter(
        (projection) =>
          projection.firstNegativeDate !==
          null
      ).length,
    activeRecurringCount,
    assignedRecurringCount:
      forecastAnalysis.assignedRecurringCount,
    unassignedRecurringCount:
      forecastAnalysis.unassignedRecurringCount,
    recurringCoveragePercentage:
      calculatePercent(
        forecastAnalysis.assignedRecurringCount,
        coverageDenominator
      ),
    nextRecurringTitle:
      nextEvent?.title ??
      null,
    nextRecurringDate:
      nextEvent?.date ??
      null,
    nextRecurringAmountMinor:
      nextEvent?.amountMinor ??
      null,
    nextRecurringType:
      nextEvent?.type ??
      null,
  };
}

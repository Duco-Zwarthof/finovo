import type {
  FinancialInsight,
  InsightPriority,
} from "./insight-types";
import type { FinancialHealthResult } from "./financial-health-types";
import type { NetWorthHistorySummary } from "./net-worth-history-types";
import type { FinancialOverview } from "./net-worth-types";

const priorityRank: Record<
  InsightPriority,
  number
> = {
  high: 0,
  medium: 1,
  low: 2,
};

function roundOneDecimal(
  value: number
): number {
  return Math.round(value * 10) / 10;
}

function calculateEmergencyMonths(
  overview: FinancialOverview
): number | null {
  if (overview.monthlyExpensesMinor <= 0) {
    return null;
  }

  return (
    overview.liquidAssetsMinor /
    overview.monthlyExpensesMinor
  );
}

export function createCashFlowInsight(
  overview: FinancialOverview
): FinancialInsight {
  if (overview.monthlyIncomeMinor <= 0) {
    return {
      id: "cash-flow-missing-income",
      level: "info",
      priority: "medium",
      title: "Add your monthly income",
      description:
        "Finovo needs income data to evaluate your monthly surplus and savings rate.",
      actionLabel: "Open dashboard",
      actionHref: "/",
    };
  }

  const surplusRate =
    overview.monthlySurplusMinor /
    overview.monthlyIncomeMinor;

  if (overview.monthlySurplusMinor < 0) {
    return {
      id: "cash-flow-negative",
      level: "warning",
      priority: "high",
      title: "Expenses are higher than income",
      description:
        "Your current monthly cash flow is negative. Review spending and budget limits before increasing savings or investments.",
      actionLabel: "Review budget",
      actionHref: "/budget",
    };
  }

  if (surplusRate >= 0.2) {
    return {
      id: "cash-flow-strong",
      level: "success",
      priority: "low",
      title: "Your monthly surplus is strong",
      description: `You currently retain ${roundOneDecimal(
        surplusRate * 100
      )}% of monthly income after expenses.`,
      actionLabel: null,
      actionHref: null,
    };
  }

  return {
    id: "cash-flow-positive",
    level: "info",
    priority: "medium",
    title: "Your cash flow is positive",
    description: `Your current monthly surplus is ${roundOneDecimal(
      surplusRate * 100
    )}% of income. Reaching 20% would strengthen your financial position.`,
    actionLabel: "Review budget",
    actionHref: "/budget",
  };
}

export function createEmergencyBufferInsight(
  overview: FinancialOverview
): FinancialInsight {
  const monthsCovered =
    calculateEmergencyMonths(overview);

  if (monthsCovered === null) {
    return {
      id: "buffer-missing-expenses",
      level: "info",
      priority: "low",
      title: "Emergency buffer cannot be estimated",
      description:
        "Add monthly expenses so Finovo can estimate how many months your liquid assets would cover.",
      actionLabel: "Open dashboard",
      actionHref: "/",
    };
  }

  if (monthsCovered < 3) {
    return {
      id: "buffer-low",
      level: "warning",
      priority: "high",
      title: "Your emergency buffer is limited",
      description: `Liquid assets currently cover about ${roundOneDecimal(
        monthsCovered
      )} months of expenses. A buffer of at least three months would provide more resilience.`,
      actionLabel: "Review accounts",
      actionHref: "/accounts",
    };
  }

  if (monthsCovered < 6) {
    return {
      id: "buffer-developing",
      level: "info",
      priority: "medium",
      title: "Your emergency buffer is developing",
      description: `Liquid assets currently cover about ${roundOneDecimal(
        monthsCovered
      )} months of expenses. Building toward six months would improve your safety margin.`,
      actionLabel: "Review accounts",
      actionHref: "/accounts",
    };
  }

  return {
    id: "buffer-strong",
    level: "success",
    priority: "low",
    title: "Your emergency buffer is strong",
    description: `Liquid assets currently cover about ${roundOneDecimal(
      monthsCovered
    )} months of expenses.`,
    actionLabel: null,
    actionHref: null,
  };
}

export function createGoalInsight(
  overview: FinancialOverview
): FinancialInsight {
  if (
    overview.goalProgressPercentage === null
  ) {
    return {
      id: "goals-missing",
      level: "info",
      priority: "low",
      title: "Create your first savings goal",
      description:
        "A goal gives your monthly surplus a clear purpose and lets Finovo track progress over time.",
      actionLabel: "Open goals",
      actionHref: "/goals",
    };
  }

  if (
    overview.goalProgressPercentage >= 75
  ) {
    return {
      id: "goals-advanced",
      level: "success",
      priority: "low",
      title: "Your savings goals are well advanced",
      description: `You have completed ${roundOneDecimal(
        overview.goalProgressPercentage
      )}% of your combined savings targets.`,
      actionLabel: "View goals",
      actionHref: "/goals",
    };
  }

  if (
    overview.goalProgressPercentage >= 25
  ) {
    return {
      id: "goals-progressing",
      level: "info",
      priority: "medium",
      title: "You are making progress toward your goals",
      description: `You have completed ${roundOneDecimal(
        overview.goalProgressPercentage
      )}% of your combined savings targets.`,
      actionLabel: "View goals",
      actionHref: "/goals",
    };
  }

  return {
    id: "goals-early",
    level: "info",
    priority: "medium",
    title: "Your savings goals are still in an early stage",
    description: `You have completed ${roundOneDecimal(
      overview.goalProgressPercentage
    )}% of your combined targets. Regular contributions will have the largest impact now.`,
    actionLabel: "View goals",
    actionHref: "/goals",
  };
}

export function createNetWorthTrendInsight(
  summary: NetWorthHistorySummary
): FinancialInsight {
  if (
    !summary.firstSnapshot ||
    !summary.latestSnapshot ||
    summary.changePercentage === null
  ) {
    return {
      id: "net-worth-history-limited",
      level: "info",
      priority: "low",
      title: "Net worth history is still limited",
      description:
        "Finovo needs snapshots from at least two different days before it can describe your net worth trend.",
      actionLabel: "View net worth",
      actionHref: "/net-worth",
    };
  }

  if (summary.changeMinor < 0) {
    return {
      id: "net-worth-declining",
      level: "warning",
      priority: "high",
      title: "Your recorded net worth has declined",
      description: `Net worth is ${roundOneDecimal(
        Math.abs(summary.changePercentage)
      )}% below the first recorded snapshot.`,
      actionLabel: "Review net worth",
      actionHref: "/net-worth",
    };
  }

  if (summary.changeMinor > 0) {
    return {
      id: "net-worth-growing",
      level: "success",
      priority: "low",
      title: "Your recorded net worth is growing",
      description: `Net worth is ${roundOneDecimal(
        summary.changePercentage
      )}% above the first recorded snapshot.`,
      actionLabel: "View net worth",
      actionHref: "/net-worth",
    };
  }

  return {
    id: "net-worth-stable",
    level: "info",
    priority: "low",
    title: "Your recorded net worth is stable",
    description:
      "The latest net worth snapshot matches the first recorded value.",
    actionLabel: "View net worth",
    actionHref: "/net-worth",
  };
}

export function createHealthScoreInsight(
  health: FinancialHealthResult
): FinancialInsight {
  if (health.score >= 85) {
    return {
      id: "health-excellent",
      level: "success",
      priority: "low",
      title: "Your financial health score is excellent",
      description: `Your current Financial Health Score is ${health.score} out of 100.`,
      actionLabel: "View score",
      actionHref: "/net-worth",
    };
  }

  if (health.score >= 70) {
    return {
      id: "health-good",
      level: "info",
      priority: "medium",
      title: "Your financial health is good",
      description: `Your current score is ${health.score} out of 100. Improving the weakest factor would have the greatest effect.`,
      actionLabel: "View score",
      actionHref: "/net-worth",
    };
  }

  return {
    id: "health-needs-work",
    level: "warning",
    priority: "high",
    title: "Your financial health needs attention",
    description: `Your current score is ${health.score} out of 100. Focus first on the lowest-scoring factor.`,
    actionLabel: "View score",
    actionHref: "/net-worth",
  };
}

export function sortFinancialInsights(
  insights: readonly FinancialInsight[]
): FinancialInsight[] {
  return [...insights].sort(
    (first, second) =>
      priorityRank[first.priority] -
        priorityRank[second.priority] ||
      first.id.localeCompare(second.id)
  );
}

export function generateFinancialInsights(
  overview: FinancialOverview,
  health: FinancialHealthResult,
  history: NetWorthHistorySummary
): FinancialInsight[] {
  return sortFinancialInsights([
    createCashFlowInsight(overview),
    createEmergencyBufferInsight(
      overview
    ),
    createGoalInsight(overview),
    createNetWorthTrendInsight(history),
    createHealthScoreInsight(health),
  ]);
}

import type { AdvisorContext } from "./advisor-types";
import type { AdvisorAssessment } from "./advisor-assessment";

export type AdvisorActionPriority = "high" | "medium" | "low";

export type AdvisorAction = {
  id: string;
  title: string;
  detail: string;
  priority: AdvisorActionPriority;
};

const BUFFER_MONTHS = 3;
const SAFE_MONTHLY_USAGE = 0.6;

function formatEuroMinor(amountMinor: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function calculateTargetBufferMinor(context: AdvisorContext) {
  return Math.max(0, context.monthlyExpensesMinor * BUFFER_MONTHS);
}

export function calculateBufferGapMinor(context: AdvisorContext) {
  return Math.max(
    0,
    calculateTargetBufferMinor(context) - context.liquidAssetsMinor
  );
}

export function calculateComfortableMonthlyCommitmentMinor(
  context: AdvisorContext
) {
  return Math.max(
    0,
    Math.floor(context.monthlySurplusMinor * SAFE_MONTHLY_USAGE)
  );
}

export function createAdvisorActions(
  context: AdvisorContext,
  assessment: AdvisorAssessment,
  category: "affordability" | "investing" | "saving" | "cashflow" | "general",
  requestedAmountMinor: number | null = null
): AdvisorAction[] {
  const actions: AdvisorAction[] = [];
  const bufferGapMinor = calculateBufferGapMinor(context);
  const comfortableMonthlyMinor =
    calculateComfortableMonthlyCommitmentMinor(context);

  if (bufferGapMinor > 0) {
    actions.push({
      id: "build-buffer",
      title: "Strengthen your cash buffer",
      detail: `Build roughly ${formatEuroMinor(
        bufferGapMinor
      )} more liquid reserves to reach about three months of recorded expenses.`,
      priority: assessment.verdict === "risky" ? "high" : "medium",
    });
  }

  if (context.monthlySurplusMinor <= 0) {
    actions.push({
      id: "restore-surplus",
      title: "Restore positive monthly cash flow",
      detail:
        "Reduce flexible spending or recurring costs before adding new monthly commitments.",
      priority: "high",
    });
  }

  if (category === "investing" && requestedAmountMinor !== null) {
    if (requestedAmountMinor > context.monthlySurplusMinor) {
      actions.push({
        id: "reduce-investment",
        title: "Lower the monthly contribution",
        detail: `Your recorded surplus is ${formatEuroMinor(
          Math.max(0, context.monthlySurplusMinor)
        )} per month. A contribution near ${formatEuroMinor(
          comfortableMonthlyMinor
        )} would leave more breathing room.`,
        priority: "high",
      });
    } else if (requestedAmountMinor > comfortableMonthlyMinor) {
      actions.push({
        id: "leave-room",
        title: "Keep more monthly breathing room",
        detail: `A contribution around ${formatEuroMinor(
          comfortableMonthlyMinor
        )} or lower would stay inside Finovo's conservative comfort range based on your recorded surplus.`,
        priority: "medium",
      });
    } else {
      actions.push({
        id: "review-scenario",
        title: "Stress-test the contribution",
        detail:
          "Compare the contribution in the Scenario Planner across bear, base and bull assumptions before changing your real plan.",
        priority: "low",
      });
    }
  }

  if (category === "affordability" && requestedAmountMinor !== null) {
    const afterPurchaseMinor = context.liquidAssetsMinor - requestedAmountMinor;
    const targetBufferMinor = calculateTargetBufferMinor(context);

    if (afterPurchaseMinor < targetBufferMinor) {
      const saferPurchaseMinor = Math.max(
        0,
        context.liquidAssetsMinor - targetBufferMinor
      );

      actions.push({
        id: "purchase-cap",
        title: "Protect your emergency buffer",
        detail:
          saferPurchaseMinor > 0
            ? `Keeping the purchase near ${formatEuroMinor(
                saferPurchaseMinor
              )} or lower would preserve roughly three months of recorded expenses.`
            : "Your current liquid assets do not yet cover Finovo's three-month buffer target, so delaying the purchase would protect liquidity.",
        priority: assessment.verdict === "risky" ? "high" : "medium",
      });
    }
  }

  if (context.scenario) {
    if (context.scenario.lowestProjectedCashMinor < 0) {
      actions.push({
        id: "bear-cash-risk",
        title: "Fix the cash shortfall first",
        detail: `Your saved ${context.scenario.years}-year scenario lets projected cash fall below zero. Lower extra investing, reduce expenses or add income before relying on investment returns.`,
        priority: "high",
      });
    } else if (category === "investing" || category === "saving") {
      actions.push({
        id: "compare-outcomes",
        title: "Compare the full outcome range",
        detail:
          "Use the saved bear, base and bull outcomes as a range rather than planning around only the base case.",
        priority: "low",
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      id: "maintain-plan",
      title: "Maintain your current margin",
      detail:
        "Your recorded cash flow and liquidity do not currently trigger a stronger corrective action. Keep your data updated and review again before a large change.",
      priority: "low",
    });
  }

  return actions.slice(0, 3);
}

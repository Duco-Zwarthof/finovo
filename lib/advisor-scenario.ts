import type {
  AdvisorScenarioContext,
} from "./advisor-types";
import {
  calculateScenarioProjection,
} from "./scenario-planner";
import type {
  ScenarioAdjustment,
} from "./scenario-planner-types";
import type {
  ScenarioSettings,
} from "./scenario-settings";

function euroToMinor(
  value: number
) {
  return Math.round(value * 100);
}

export function calculateAdvisorScenarioContext(
  startingCashMinor: number,
  startingInvestmentsMinor: number,
  settings: ScenarioSettings
): AdvisorScenarioContext {
  const adjustments: ScenarioAdjustment[] =
    [
      {
        id: "advisor-income",
        type: "monthly-income",
        label: "Extra monthly income",
        amountMinor: euroToMinor(
          settings.extraIncomeEuro
        ),
      },
      {
        id: "advisor-expenses",
        type: "monthly-expense",
        label: "Higher monthly expenses",
        amountMinor: euroToMinor(
          settings.extraExpensesEuro
        ),
      },
      {
        id: "advisor-investing",
        type: "monthly-investment",
        label: "Extra monthly investing",
        amountMinor: euroToMinor(
          settings.extraInvestingEuro
        ),
      },
    ];

  const months = settings.years * 12;

  const bear =
    calculateScenarioProjection(
      startingCashMinor,
      startingInvestmentsMinor,
      adjustments,
      months,
      {
        annualInvestmentReturnPercent:
          settings.bearReturn,
      }
    );

  const base =
    calculateScenarioProjection(
      startingCashMinor,
      startingInvestmentsMinor,
      adjustments,
      months,
      {
        annualInvestmentReturnPercent:
          settings.baseReturn,
      }
    );

  const bull =
    calculateScenarioProjection(
      startingCashMinor,
      startingInvestmentsMinor,
      adjustments,
      months,
      {
        annualInvestmentReturnPercent:
          settings.bullReturn,
      }
    );

  const lowestCashMinor = Math.min(
    ...base.points.map(
      (point) =>
        point.projectedCashMinor
    )
  );

  return {
    years: settings.years,
    extraIncomeMinor: euroToMinor(
      settings.extraIncomeEuro
    ),
    extraExpensesMinor: euroToMinor(
      settings.extraExpensesEuro
    ),
    extraInvestingMinor: euroToMinor(
      settings.extraInvestingEuro
    ),
    bearReturnPercent:
      settings.bearReturn,
    baseReturnPercent:
      settings.baseReturn,
    bullReturnPercent:
      settings.bullReturn,
    bearEndingNetWorthMinor:
      bear.projectedNetWorthMinor,
    baseEndingNetWorthMinor:
      base.projectedNetWorthMinor,
    bullEndingNetWorthMinor:
      bull.projectedNetWorthMinor,
    lowestProjectedCashMinor:
      lowestCashMinor,
  };
}

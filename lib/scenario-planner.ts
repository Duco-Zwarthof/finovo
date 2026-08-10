import type {
  ScenarioAdjustment,
  ScenarioProjection,
  ScenarioProjectionPoint,
} from "./scenario-planner-types";

function assertSafeInteger(
  value: number,
  message: string
) {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(message);
  }
}

function addMinorUnits(
  first: number,
  second: number
): number {
  const result = first + second;

  assertSafeInteger(
    result,
    "Scenario calculation exceeds the safe minor-unit range"
  );

  return result;
}

function subtractMinorUnits(
  first: number,
  second: number
): number {
  const result = first - second;

  assertSafeInteger(
    result,
    "Scenario calculation exceeds the safe minor-unit range"
  );

  return result;
}

export function calculateScenarioMonthlyChanges(
  adjustments: readonly ScenarioAdjustment[]
): {
  monthlyCashChangeMinor: number;
  monthlyInvestmentContributionMinor: number;
} {
  let monthlyCashChangeMinor = 0;
  let monthlyInvestmentContributionMinor = 0;

  for (const adjustment of adjustments) {
    assertSafeInteger(
      adjustment.amountMinor,
      "Scenario adjustment must use safe minor units"
    );

    if (adjustment.amountMinor < 0) {
      throw new RangeError(
        "Scenario adjustment amount cannot be negative"
      );
    }

    if (adjustment.type === "monthly-income") {
      monthlyCashChangeMinor = addMinorUnits(
        monthlyCashChangeMinor,
        adjustment.amountMinor
      );
      continue;
    }

    if (adjustment.type === "monthly-expense") {
      monthlyCashChangeMinor = subtractMinorUnits(
        monthlyCashChangeMinor,
        adjustment.amountMinor
      );
      continue;
    }

    monthlyCashChangeMinor = subtractMinorUnits(
      monthlyCashChangeMinor,
      adjustment.amountMinor
    );

    monthlyInvestmentContributionMinor =
      addMinorUnits(
        monthlyInvestmentContributionMinor,
        adjustment.amountMinor
      );
  }

  return {
    monthlyCashChangeMinor,
    monthlyInvestmentContributionMinor,
  };
}

export function calculateScenarioProjection(
  startingCashMinor: number,
  startingInvestmentsMinor: number,
  adjustments: readonly ScenarioAdjustment[],
  months: number
): ScenarioProjection {
  assertSafeInteger(
    startingCashMinor,
    "Starting cash must use safe minor units"
  );
  assertSafeInteger(
    startingInvestmentsMinor,
    "Starting investments must use safe minor units"
  );

  if (
    !Number.isInteger(months) ||
    months < 1 ||
    months > 600
  ) {
    throw new RangeError(
      "Scenario months must be between 1 and 600"
    );
  }

  const {
    monthlyCashChangeMinor,
    monthlyInvestmentContributionMinor,
  } = calculateScenarioMonthlyChanges(
    adjustments
  );

  const points: ScenarioProjectionPoint[] = [];

  let projectedCashMinor =
    startingCashMinor;
  let projectedInvestmentsMinor =
    startingInvestmentsMinor;

  points.push({
    month: 0,
    projectedCashMinor,
    projectedInvestmentsMinor,
    projectedNetWorthMinor:
      addMinorUnits(
        projectedCashMinor,
        projectedInvestmentsMinor
      ),
  });

  for (
    let month = 1;
    month <= months;
    month += 1
  ) {
    projectedCashMinor = addMinorUnits(
      projectedCashMinor,
      monthlyCashChangeMinor
    );

    projectedInvestmentsMinor = addMinorUnits(
      projectedInvestmentsMinor,
      monthlyInvestmentContributionMinor
    );

    points.push({
      month,
      projectedCashMinor,
      projectedInvestmentsMinor,
      projectedNetWorthMinor:
        addMinorUnits(
          projectedCashMinor,
          projectedInvestmentsMinor
        ),
    });
  }

  return {
    months,
    startingCashMinor,
    startingInvestmentsMinor,
    projectedCashMinor,
    projectedInvestmentsMinor,
    projectedNetWorthMinor:
      addMinorUnits(
        projectedCashMinor,
        projectedInvestmentsMinor
      ),
    monthlyCashChangeMinor,
    monthlyInvestmentContributionMinor,
    points,
  };
}

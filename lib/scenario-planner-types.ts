export type ScenarioAdjustment =
  | {
      id: string;
      type: "monthly-income";
      label: string;
      amountMinor: number;
    }
  | {
      id: string;
      type: "monthly-expense";
      label: string;
      amountMinor: number;
    }
  | {
      id: string;
      type: "monthly-investment";
      label: string;
      amountMinor: number;
    };

export type ScenarioProjectionPoint = {
  month: number;
  projectedCashMinor: number;
  projectedInvestmentsMinor: number;
  projectedNetWorthMinor: number;
};

export type ScenarioProjection = {
  months: number;
  startingCashMinor: number;
  startingInvestmentsMinor: number;
  projectedCashMinor: number;
  projectedInvestmentsMinor: number;
  projectedNetWorthMinor: number;
  monthlyCashChangeMinor: number;
  monthlyInvestmentContributionMinor: number;
  points: ScenarioProjectionPoint[];
};

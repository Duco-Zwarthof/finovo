export type NetWorthBreakdown = {
  checkingMinor: number;
  savingsMinor: number;
  cashMinor: number;
  investmentAccountsMinor: number;
  totalIncludedAccountsMinor: number;
};

export type PortfolioCoverage = {
  investmentAccountsMinor: number;
  trackedHoldingsMinor: number;
  differenceMinor: number;
  coveragePercentage: number | null;
};

export type FinancialOverview = {
  netWorthMinor: number;
  liquidAssetsMinor: number;
  investmentAssetsMinor: number;
  monthlyIncomeMinor: number;
  monthlyExpensesMinor: number;
  monthlySurplusMinor: number;
  totalGoalTargetMinor: number;
  totalGoalProgressMinor: number;
  goalProgressPercentage: number | null;
  accountBreakdown: NetWorthBreakdown;
  portfolioCoverage: PortfolioCoverage;
};

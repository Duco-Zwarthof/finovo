import type { Account } from "./account-types";
import type { Goal } from "./goal-types";
import {
  calculateTotalGoalProgressMinor,
  calculateTotalGoalTargetMinor,
} from "./goals";
import type { InvestmentHolding } from "./investment-types";
import {
  calculatePortfolioValueMinor,
} from "./investments";
import type {
  FinancialOverview,
  NetWorthBreakdown,
  PortfolioCoverage,
} from "./net-worth-types";
import type { Transaction } from "./types";
import {
  calculateMonthlyFinancialSummary,
} from "./finance";

function addMinorUnits(
  first: number,
  second: number
): number {
  const result = first + second;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Financial overview exceeds the safe minor-unit range"
    );
  }

  return result;
}

function subtractMinorUnits(
  first: number,
  second: number
): number {
  const result = first - second;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Financial overview exceeds the safe minor-unit range"
    );
  }

  return result;
}

export function calculateNetWorthBreakdown(
  accounts: readonly Account[]
): NetWorthBreakdown {
  return accounts.reduce<NetWorthBreakdown>(
    (breakdown, account) => {
      if (!account.includedInNetWorth) {
        return breakdown;
      }

      const next = {
        ...breakdown,
        totalIncludedAccountsMinor: addMinorUnits(
          breakdown.totalIncludedAccountsMinor,
          account.balanceMinor
        ),
      };

      switch (account.type) {
        case "checking":
          next.checkingMinor = addMinorUnits(
            breakdown.checkingMinor,
            account.balanceMinor
          );
          break;

        case "savings":
          next.savingsMinor = addMinorUnits(
            breakdown.savingsMinor,
            account.balanceMinor
          );
          break;

        case "cash":
          next.cashMinor = addMinorUnits(
            breakdown.cashMinor,
            account.balanceMinor
          );
          break;

        case "investment":
          next.investmentAccountsMinor = addMinorUnits(
            breakdown.investmentAccountsMinor,
            account.balanceMinor
          );
          break;
      }

      return next;
    },
    {
      checkingMinor: 0,
      savingsMinor: 0,
      cashMinor: 0,
      investmentAccountsMinor: 0,
      totalIncludedAccountsMinor: 0,
    }
  );
}

export function calculatePortfolioCoverage(
  accounts: readonly Account[],
  holdings: readonly InvestmentHolding[]
): PortfolioCoverage {
  const breakdown =
    calculateNetWorthBreakdown(accounts);
  const trackedHoldingsMinor =
    calculatePortfolioValueMinor(holdings);
  const differenceMinor = subtractMinorUnits(
    breakdown.investmentAccountsMinor,
    trackedHoldingsMinor
  );

  return {
    investmentAccountsMinor:
      breakdown.investmentAccountsMinor,
    trackedHoldingsMinor,
    differenceMinor,
    coveragePercentage:
      breakdown.investmentAccountsMinor === 0
        ? null
        : Math.min(
            (trackedHoldingsMinor /
              breakdown.investmentAccountsMinor) *
              100,
            100
          ),
  };
}

export function calculateGoalProgressPercentage(
  goals: readonly Goal[]
): number | null {
  const targetMinor =
    calculateTotalGoalTargetMinor(goals);

  if (targetMinor === 0) {
    return null;
  }

  return Math.min(
    (calculateTotalGoalProgressMinor(goals) /
      targetMinor) *
      100,
    100
  );
}

export function calculateFinancialOverview(
  accounts: readonly Account[],
  holdings: readonly InvestmentHolding[],
  goals: readonly Goal[],
  transactions: readonly Transaction[],
  now: Date = new Date()
): FinancialOverview {
  const accountBreakdown =
    calculateNetWorthBreakdown(accounts);

  const {
    incomeMinor: monthlyIncomeMinor,
    expensesMinor: monthlyExpensesMinor,
    surplusMinor: monthlySurplusMinor,
  } = calculateMonthlyFinancialSummary(
    [...transactions],
    now
  );

  return {
    netWorthMinor:
      accountBreakdown.totalIncludedAccountsMinor,
    liquidAssetsMinor: addMinorUnits(
      addMinorUnits(
        accountBreakdown.checkingMinor,
        accountBreakdown.savingsMinor
      ),
      accountBreakdown.cashMinor
    ),
    investmentAssetsMinor:
      accountBreakdown.investmentAccountsMinor,
    monthlyIncomeMinor,
    monthlyExpensesMinor,
    monthlySurplusMinor,
    totalGoalTargetMinor:
      calculateTotalGoalTargetMinor(goals),
    totalGoalProgressMinor:
      calculateTotalGoalProgressMinor(goals),
    goalProgressPercentage:
      calculateGoalProgressPercentage(goals),
    accountBreakdown,
    portfolioCoverage:
      calculatePortfolioCoverage(
        accounts,
        holdings
      ),
  };
}

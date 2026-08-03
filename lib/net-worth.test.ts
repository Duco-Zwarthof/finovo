import { describe, expect, it } from "vitest";

import type { Account } from "./account-types";
import type { Goal } from "./goal-types";
import type { InvestmentHolding } from "./investment-types";
import {
  calculateFinancialOverview,
  calculateGoalProgressPercentage,
  calculateNetWorthBreakdown,
  calculatePortfolioCoverage,
} from "./net-worth";
import type { Transaction } from "./types";

const accounts: Account[] = [
  {
    id: "checking",
    name: "Main account",
    type: "checking",
    balanceMinor: 250_000,
    includedInNetWorth: true,
  },
  {
    id: "savings",
    name: "Savings",
    type: "savings",
    balanceMinor: 1_000_000,
    includedInNetWorth: true,
  },
  {
    id: "investment",
    name: "Broker",
    type: "investment",
    balanceMinor: 2_000_000,
    includedInNetWorth: true,
  },
  {
    id: "excluded",
    name: "Excluded cash",
    type: "cash",
    balanceMinor: 50_000,
    includedInNetWorth: false,
  },
];

const holdings: InvestmentHolding[] = [
  {
    id: "holding-1",
    name: "World ETF",
    symbol: "VWCE",
    assetType: "etf",
    quantity: 10,
    averageBuyPriceMinor: 100_000,
    currentPriceMinor: 150_000,
  },
];

const goals: Goal[] = [
  {
    id: "goal-1",
    name: "House deposit",
    targetAmountMinor: 3_000_000,
    currentAmountMinor: 1_200_000,
    targetDate: null,
    status: "active",
  },
];

const transactions: Transaction[] = [
  {
    id: "income",
    title: "Salary",
    category: "Salary",
    amountMinor: 300_000,
    type: "income",
    date: "2026-08-01",
  },
  {
    id: "expense",
    title: "Groceries",
    category: "Groceries",
    amountMinor: 80_000,
    type: "expense",
    date: "2026-08-02",
  },
  {
    id: "old-expense",
    title: "Old groceries",
    category: "Groceries",
    amountMinor: 20_000,
    type: "expense",
    date: "2026-07-31",
  },
];

describe("net worth", () => {
  it("calculates the included account breakdown", () => {
    expect(
      calculateNetWorthBreakdown(accounts)
    ).toEqual({
      checkingMinor: 250_000,
      savingsMinor: 1_000_000,
      cashMinor: 0,
      investmentAccountsMinor: 2_000_000,
      totalIncludedAccountsMinor: 3_250_000,
    });
  });

  it("compares tracked holdings with investment accounts without double counting", () => {
    expect(
      calculatePortfolioCoverage(
        accounts,
        holdings
      )
    ).toEqual({
      investmentAccountsMinor: 2_000_000,
      trackedHoldingsMinor: 1_500_000,
      differenceMinor: 500_000,
      coveragePercentage: 75,
    });
  });

  it("calculates overall goal progress", () => {
    expect(
      calculateGoalProgressPercentage(goals)
    ).toBe(40);

    expect(
      calculateGoalProgressPercentage([])
    ).toBeNull();
  });

  it("creates a combined financial overview", () => {
    expect(
      calculateFinancialOverview(
        accounts,
        holdings,
        goals,
        transactions,
        new Date("2026-08-03T12:00:00")
      )
    ).toEqual({
      netWorthMinor: 3_250_000,
      liquidAssetsMinor: 1_250_000,
      investmentAssetsMinor: 2_000_000,
      monthlyIncomeMinor: 300_000,
      monthlyExpensesMinor: 80_000,
      monthlySurplusMinor: 220_000,
      totalGoalTargetMinor: 3_000_000,
      totalGoalProgressMinor: 1_200_000,
      goalProgressPercentage: 40,
      accountBreakdown: {
        checkingMinor: 250_000,
        savingsMinor: 1_000_000,
        cashMinor: 0,
        investmentAccountsMinor: 2_000_000,
        totalIncludedAccountsMinor: 3_250_000,
      },
      portfolioCoverage: {
        investmentAccountsMinor: 2_000_000,
        trackedHoldingsMinor: 1_500_000,
        differenceMinor: 500_000,
        coveragePercentage: 75,
      },
    });
  });
});

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateCashflowForecastAnalysis,
} from "./cashflow-forecast-analysis";
import type {
  Account,
} from "./account-types";
import type {
  RecurringTransaction,
} from "./recurring-transaction-types";

const accounts: Account[] = [
  {
    id: "checking",
    name: "Checking",
    type: "checking",
    balanceMinor: 50_000,
    includedInNetWorth: true,
  },
  {
    id: "savings",
    name: "Savings",
    type: "savings",
    balanceMinor: 100_000,
    includedInNetWorth: true,
  },
  {
    id: "investment",
    name: "Investments",
    type: "investment",
    balanceMinor: 200_000,
    includedInNetWorth: true,
  },
];

function recurring(
  overrides: Partial<RecurringTransaction>
): RecurringTransaction {
  return {
    id: "item",
    title: "Recurring",
    category: "Subscriptions",
    amountMinor: 10_000,
    type: "expense",
    frequency: "monthly",
    startDate: "2026-09-10",
    endDate: null,
    dayOfMonth: 10,
    isActive: true,
    ...overrides,
  };
}

describe(
  "cashflow forecast analysis",
  () => {
    it(
      "builds account-level projections from assigned recurring items",
      () => {
        const result =
          calculateCashflowForecastAnalysis(
            accounts,
            [
              recurring({
                id: "rent",
                accountId:
                  "checking",
                amountMinor:
                  20_000,
              }),
            ],
            "2026-09-01",
            "2026-09-30"
          );

        const checking =
          result.accountProjections.find(
            (item) =>
              item.accountId ===
              "checking"
          );

        expect(checking).toMatchObject({
          startingBalanceMinor:
            50_000,
          endingBalanceMinor:
            30_000,
          eventCount: 1,
        });

        const savings =
          result.accountProjections.find(
            (item) =>
              item.accountId ===
              "savings"
          );

        expect(savings).toMatchObject({
          startingBalanceMinor:
            100_000,
          endingBalanceMinor:
            100_000,
          eventCount: 0,
        });
      }
    );

    it(
      "detects the first date an account becomes negative",
      () => {
        const result =
          calculateCashflowForecastAnalysis(
            accounts,
            [
              recurring({
                id: "rent",
                accountId:
                  "checking",
                amountMinor:
                  60_000,
              }),
            ],
            "2026-09-01",
            "2026-09-30"
          );

        const checking =
          result.accountProjections.find(
            (item) =>
              item.accountId ===
              "checking"
          );

        expect(
          checking?.firstNegativeDate
        ).toBe("2026-09-10");

        expect(
          result.riskLevel
        ).toBe("risk");
      }
    );

    it(
      "counts active forecast items without a liquid account assignment",
      () => {
        const result =
          calculateCashflowForecastAnalysis(
            accounts,
            [
              recurring({
                id: "assigned",
                accountId:
                  "checking",
              }),
              recurring({
                id: "unassigned",
              }),
              recurring({
                id: "investment",
                accountId:
                  "investment",
              }),
              recurring({
                id: "paused",
                isActive: false,
              }),
            ],
            "2026-09-01",
            "2026-09-30"
          );

        expect(
          result.assignedRecurringCount
        ).toBe(1);

        expect(
          result.unassignedRecurringCount
        ).toBe(2);

        expect(
          result.riskLevel
        ).toBe("watch");
      }
    );

    it(
      "creates 30, 60 and 90 day snapshots",
      () => {
        const result =
          calculateCashflowForecastAnalysis(
            accounts,
            [
              recurring({
                id: "salary",
                title: "Salary",
                category: "Salary",
                type: "income",
                amountMinor:
                  100_000,
                accountId:
                  "checking",
                startDate:
                  "2026-09-15",
                dayOfMonth: 15,
              }),
            ],
            "2026-09-01",
            "2026-09-30"
          );

        expect(
          result.horizonSnapshots.map(
            (snapshot) =>
              snapshot.days
          )
        ).toEqual([
          30,
          60,
          90,
        ]);

        expect(
          result.horizonSnapshots[
            0
          ].endingBalanceMinor
        ).toBe(250_000);
      }
    );

    it(
      "excludes investment accounts from liquid account projections",
      () => {
        const result =
          calculateCashflowForecastAnalysis(
            accounts,
            [],
            "2026-09-01",
            "2026-09-30"
          );

        expect(
          result.accountProjections.map(
            (item) =>
              item.accountId
          )
        ).toEqual([
          "checking",
          "savings",
        ]);
      }
    );

    it(
      "marks a positive fully assigned forecast as healthy",
      () => {
        const result =
          calculateCashflowForecastAnalysis(
            accounts,
            [
              recurring({
                id: "salary",
                title: "Salary",
                category: "Salary",
                type: "income",
                amountMinor:
                  25_000,
                accountId:
                  "checking",
              }),
            ],
            "2026-09-01",
            "2026-09-30"
          );

        expect(
          result.riskLevel
        ).toBe("healthy");
      }
    );
  }
);

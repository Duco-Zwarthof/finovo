import {
  describe,
  expect,
  it,
} from "vitest";

import type { Account } from "./account-types";
import type { RecurringTransaction } from "./recurring-transaction-types";
import {
  buildForecastEvents,
  buildForecastPoints,
  calculateCashflowForecast,
  calculateForecastStartingBalanceMinor,
} from "./cashflow-forecast";

const accounts: Account[] = [
  {
    id: "checking",
    name: "Checking",
    type: "checking",
    balanceMinor: 200_000,
    includedInNetWorth: true,
  },
  {
    id: "savings",
    name: "Savings",
    type: "savings",
    balanceMinor: 500_000,
    includedInNetWorth: true,
  },
  {
    id: "cash",
    name: "Cash",
    type: "cash",
    balanceMinor: 30_000,
    includedInNetWorth: true,
  },
  {
    id: "broker",
    name: "Broker",
    type: "investment",
    balanceMinor: 1_000_000,
    includedInNetWorth: true,
  },
];

const recurringItems: RecurringTransaction[] = [
  {
    id: "salary",
    title: "Salary",
    category: "Salary",
    amountMinor: 300_000,
    type: "income",
    frequency: "monthly",
    startDate: "2026-08-25",
    endDate: null,
    dayOfMonth: 25,
    isActive: true,
  },
  {
    id: "rent",
    title: "Rent",
    category: "Housing",
    amountMinor: 100_000,
    type: "expense",
    frequency: "monthly",
    startDate: "2026-09-01",
    endDate: null,
    dayOfMonth: 1,
    isActive: true,
  },
];

describe("cashflow forecast", () => {
  it("uses liquid included accounts as the starting balance", () => {
    expect(
      calculateForecastStartingBalanceMinor(
        accounts
      )
    ).toBe(730_000);
  });

  it("builds chronological forecast events", () => {
    expect(
      buildForecastEvents(
        recurringItems,
        "2026-08-09",
        "2026-09-05",
        730_000
      )
    ).toEqual({
      events: [
        {
          id: "forecast:salary:2026-08-25",
          recurringTransactionId:
            "salary",
          title: "Salary",
          category: "Salary",
          type: "income",
          date: "2026-08-25",
          amountMinor: 300_000,
          balanceAfterMinor: 1_030_000,
        },
        {
          id: "forecast:rent:2026-09-01",
          recurringTransactionId:
            "rent",
          title: "Rent",
          category: "Housing",
          type: "expense",
          date: "2026-09-01",
          amountMinor: 100_000,
          balanceAfterMinor: 930_000,
        },
      ],
      endingBalanceMinor: 930_000,
    });
  });

  it("creates chart points from the event stream", () => {
    const result =
      buildForecastEvents(
        recurringItems,
        "2026-08-09",
        "2026-09-05",
        730_000
      );

    expect(
      buildForecastPoints(
        "2026-08-09",
        730_000,
        result.events
      )
    ).toEqual([
      {
        date: "2026-08-09",
        balanceMinor: 730_000,
      },
      {
        date: "2026-08-25",
        balanceMinor: 1_030_000,
      },
      {
        date: "2026-09-01",
        balanceMinor: 930_000,
      },
    ]);
  });

  it("calculates a complete forecast", () => {
    expect(
      calculateCashflowForecast(
        accounts,
        recurringItems,
        "2026-08-09",
        "2026-09-05"
      )
    ).toMatchObject({
      startDate: "2026-08-09",
      endDate: "2026-09-05",
      startingBalanceMinor: 730_000,
      endingBalanceMinor: 930_000,
      projectedChangeMinor: 200_000,
    });
  });

  it("ignores paused recurring transactions", () => {
    expect(
      calculateCashflowForecast(
        accounts,
        [
          {
            ...recurringItems[0],
            isActive: false,
          },
        ],
        "2026-08-09",
        "2026-09-05"
      ).events
    ).toEqual([]);
  });

  it("rejects invalid date ranges", () => {
    expect(() =>
      calculateCashflowForecast(
        accounts,
        recurringItems,
        "2026-09-05",
        "2026-08-09"
      )
    ).toThrow(
      "Cannot build a cashflow forecast for an invalid date range"
    );
  });
});

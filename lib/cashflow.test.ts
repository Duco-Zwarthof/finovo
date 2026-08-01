import { describe, expect, it } from "vitest";

import type { Transaction } from "./types";
import { createQuarterlyCashflowData } from "./cashflow";

const transactions: Transaction[] = [
  {
    id: "income",
    title: "Income",
    amountMinor: 1,
    type: "income",
    category: "Salary",
    date: "2026-01-15",
  },
  {
    id: "expense",
    title: "Expense",
    amountMinor: 2,
    type: "expense",
    category: "Other",
    date: "2026-03-15",
  },
];

describe("quarterly cashflow aggregation", () => {
  it("aggregates amountMinor and converts once for chart output", () => {
    expect(createQuarterlyCashflowData(transactions, 2026)[0]).toEqual({
      period: "Q1",
      fullPeriod: "Quarter 1, 2026",
      income: 0.01,
      expenses: 0.02,
    });
  });
});

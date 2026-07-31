import { parseLocalDate } from "./date";
import { addMinorUnits } from "./finance";
import { minorUnitsToEuroAmount } from "./transaction-amount";
import type { Transaction } from "./types";

export type CashflowDataPoint = {
  period: string;
  fullPeriod: string;
  income: number;
  expenses: number;
};

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
});

const fullMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

export function createMonthlyCashflowData(
  transactions: Transaction[],
  monthCount: number,
  referenceDate: Date = new Date()
): CashflowDataPoint[] {
  const months = Array.from(
    { length: monthCount },
    (_, index) => {
      const date = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() - monthCount + 1 + index,
        1
      );

      return {
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        period: monthFormatter.format(date),
        fullPeriod: fullMonthFormatter.format(date),
        incomeMinor: 0,
        expensesMinor: 0,
      };
    }
  );

  transactions.forEach((transaction) => {
    const transactionDate = parseLocalDate(transaction.date);
    const matchingMonth = transactionDate
      ? months.find(
          (month) =>
            month.year === transactionDate.getFullYear() &&
            month.monthIndex === transactionDate.getMonth()
        )
      : undefined;

    if (!matchingMonth) {
      return;
    }

    if (transaction.type === "income") {
      matchingMonth.incomeMinor = addMinorUnits(
        matchingMonth.incomeMinor,
        transaction.amountMinor
      );
    } else {
      matchingMonth.expensesMinor = addMinorUnits(
        matchingMonth.expensesMinor,
        transaction.amountMinor
      );
    }
  });

  return months.map((month) => ({
    period: month.period,
    fullPeriod: month.fullPeriod,
    income: minorUnitsToEuroAmount(month.incomeMinor) ?? 0,
    expenses:
      minorUnitsToEuroAmount(month.expensesMinor) ?? 0,
  }));
}

export function createQuarterlyCashflowData(
  transactions: Transaction[],
  selectedYear: number
): CashflowDataPoint[] {
  const quarters = [1, 2, 3, 4].map((quarter) => ({
    quarter,
    period: `Q${quarter}`,
    fullPeriod: `Quarter ${quarter}, ${selectedYear}`,
    incomeMinor: 0,
    expensesMinor: 0,
  }));

  transactions.forEach((transaction) => {
    const transactionDate = parseLocalDate(transaction.date);

    if (
      !transactionDate ||
      transactionDate.getFullYear() !== selectedYear
    ) {
      return;
    }

    const quarterNumber =
      Math.floor(transactionDate.getMonth() / 3) + 1;
    const matchingQuarter = quarters.find(
      (quarter) => quarter.quarter === quarterNumber
    );

    if (!matchingQuarter) {
      return;
    }

    if (transaction.type === "income") {
      matchingQuarter.incomeMinor = addMinorUnits(
        matchingQuarter.incomeMinor,
        transaction.amountMinor
      );
    } else {
      matchingQuarter.expensesMinor = addMinorUnits(
        matchingQuarter.expensesMinor,
        transaction.amountMinor
      );
    }
  });

  return quarters.map((quarter) => ({
    period: quarter.period,
    fullPeriod: quarter.fullPeriod,
    income:
      minorUnitsToEuroAmount(quarter.incomeMinor) ?? 0,
    expenses:
      minorUnitsToEuroAmount(quarter.expensesMinor) ?? 0,
  }));
}

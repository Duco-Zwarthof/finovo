import {
  getLocalCalendarMonthKey,
} from "./date";
import type {
  Transaction,
} from "./types";

export type MonthlyTransactionTrendPoint = {
  monthKey: string;
  label: string;
  incomeMinor: number;
  expensesMinor: number;
  surplusMinor: number;
  transactionCount: number;
};

export type TransactionTrendSummary = {
  months: MonthlyTransactionTrendPoint[];
  current:
    MonthlyTransactionTrendPoint;
  previous:
    MonthlyTransactionTrendPoint;
  expenseChangePercent: number | null;
  incomeChangePercent: number | null;
  surplusChangeMinor: number;
  averageMonthlyExpensesMinor: number;
};

function createMonthDate(
  referenceDate: Date,
  offset: number
) {
  return new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() +
      offset,
    1
  );
}

function createMonthKey(
  date: Date
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
}

function createMonthLabel(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      month: "short",
    }
  ).format(date);
}

function calculateChangePercent(
  current: number,
  previous: number
) {
  if (previous === 0) {
    return current === 0
      ? 0
      : null;
  }

  return (
    ((current - previous) /
      previous) *
    100
  );
}

export function calculateTransactionTrends(
  transactions: readonly Transaction[],
  referenceDate: Date,
  numberOfMonths = 6
): TransactionTrendSummary {
  if (
    !Number.isInteger(
      numberOfMonths
    ) ||
    numberOfMonths < 2 ||
    numberOfMonths > 24
  ) {
    throw new Error(
      "numberOfMonths must be an integer between 2 and 24."
    );
  }

  const monthDates =
    Array.from(
      {
        length:
          numberOfMonths,
      },
      (_, index) =>
        createMonthDate(
          referenceDate,
          index -
            (numberOfMonths - 1)
        )
    );

  const totalsByMonth =
    new Map<
      string,
      {
        incomeMinor: number;
        expensesMinor: number;
        transactionCount: number;
      }
    >();

  for (const transaction of transactions) {
    const monthKey =
      getLocalCalendarMonthKey(
        transaction.date
      );

    if (!monthKey) {
      continue;
    }

    const current =
      totalsByMonth.get(
        monthKey
      ) ?? {
        incomeMinor: 0,
        expensesMinor: 0,
        transactionCount: 0,
      };

    if (
      transaction.type ===
      "income"
    ) {
      current.incomeMinor +=
        transaction.amountMinor;
    } else {
      current.expensesMinor +=
        transaction.amountMinor;
    }

    current.transactionCount += 1;

    totalsByMonth.set(
      monthKey,
      current
    );
  }

  const months =
    monthDates.map(
      (monthDate) => {
        const monthKey =
          createMonthKey(
            monthDate
          );

        const totals =
          totalsByMonth.get(
            monthKey
          ) ?? {
            incomeMinor: 0,
            expensesMinor: 0,
            transactionCount: 0,
          };

        return {
          monthKey,
          label:
            createMonthLabel(
              monthDate
            ),
          incomeMinor:
            totals.incomeMinor,
          expensesMinor:
            totals.expensesMinor,
          surplusMinor:
            totals.incomeMinor -
            totals.expensesMinor,
          transactionCount:
            totals.transactionCount,
        };
      }
    );

  const current =
    months[
      months.length - 1
    ];

  const previous =
    months[
      months.length - 2
    ];

  const averageMonthlyExpensesMinor =
    Math.round(
      months.reduce(
        (
          total,
          month
        ) =>
          total +
          month.expensesMinor,
        0
      ) / months.length
    );

  return {
    months,
    current,
    previous,
    expenseChangePercent:
      calculateChangePercent(
        current.expensesMinor,
        previous.expensesMinor
      ),
    incomeChangePercent:
      calculateChangePercent(
        current.incomeMinor,
        previous.incomeMinor
      ),
    surplusChangeMinor:
      current.surplusMinor -
      previous.surplusMinor,
    averageMonthlyExpensesMinor,
  };
}

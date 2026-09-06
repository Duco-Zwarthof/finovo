import {
  formatLocalDate,
  parseLocalDate,
} from "./date";
import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "./types";

export type RecurringTransactionConfidence =
  | "high"
  | "medium";

export type RecurringTransactionCandidate = {
  id: string;
  title: string;
  type: TransactionType;
  category: TransactionCategory;
  occurrences: number;
  averageAmountMinor: number;
  lastAmountMinor: number;
  lastDate: string;
  nextExpectedDate: string;
  averageIntervalDays: number;
  amountVariationPercent: number;
  confidence: RecurringTransactionConfidence;
};

type CandidateGroup = {
  key: string;
  title: string;
  type: TransactionType;
  category: TransactionCategory;
  transactions: Transaction[];
};

const DAY_MS =
  24 * 60 * 60 * 1000;

function safeAdd(
  first: number,
  second: number
) {
  const result =
    first + second;

  if (
    !Number.isSafeInteger(
      result
    )
  ) {
    throw new RangeError(
      "Recurring transaction amount exceeds the safe minor-unit range"
    );
  }

  return result;
}

function normalizeRecurringTitle(
  value: string
) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /\b\d{4,}\b/g,
      " "
    )
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function createGroupKey(
  transaction: Transaction
) {
  return [
    transaction.type,
    transaction.category,
    normalizeRecurringTitle(
      transaction.title
    ),
  ].join("|");
}

function daysBetween(
  earlier: Date,
  later: Date
) {
  return Math.round(
    (
      later.getTime() -
      earlier.getTime()
    ) / DAY_MS
  );
}

function average(
  values: readonly number[]
) {
  if (
    values.length === 0
  ) {
    return 0;
  }

  return (
    values.reduce(
      (
        total,
        value
      ) => total + value,
      0
    ) / values.length
  );
}

function roundedAverageMinor(
  transactions: readonly Transaction[]
) {
  const total =
    transactions.reduce(
      (
        sum,
        transaction
      ) =>
        safeAdd(
          sum,
          transaction.amountMinor
        ),
      0
    );

  return Math.round(
    total /
    transactions.length
  );
}

function amountVariationPercent(
  transactions: readonly Transaction[],
  averageAmountMinor: number
) {
  if (
    averageAmountMinor <= 0
  ) {
    return 0;
  }

  const largestDeviation =
    transactions.reduce(
      (
        largest,
        transaction
      ) =>
        Math.max(
          largest,
          Math.abs(
            transaction.amountMinor -
              averageAmountMinor
          )
        ),
      0
    );

  return (
    largestDeviation /
    averageAmountMinor
  ) * 100;
}

function addDays(
  value: string,
  numberOfDays: number
) {
  const date =
    parseLocalDate(value);

  if (!date) {
    return value;
  }

  date.setDate(
    date.getDate() +
      numberOfDays
  );

  return formatLocalDate(
    date
  );
}

function groupTransactions(
  transactions: readonly Transaction[]
) {
  const groups =
    new Map<
      string,
      CandidateGroup
    >();

  for (const transaction of transactions) {
    if (
      !parseLocalDate(
        transaction.date
      )
    ) {
      continue;
    }

    const normalizedTitle =
      normalizeRecurringTitle(
        transaction.title
      );

    if (
      normalizedTitle.length <
      2
    ) {
      continue;
    }

    const key =
      createGroupKey(
        transaction
      );

    const existing =
      groups.get(key);

    if (existing) {
      existing.transactions.push(
        transaction
      );
      continue;
    }

    groups.set(
      key,
      {
        key,
        title:
          transaction.title,
        type:
          transaction.type,
        category:
          transaction.category,
        transactions: [
          transaction,
        ],
      }
    );
  }

  return Array.from(
    groups.values()
  );
}

function toCandidate(
  group: CandidateGroup
): RecurringTransactionCandidate | null {
  if (
    group.transactions.length <
    3
  ) {
    return null;
  }

  const sorted =
    [...group.transactions].sort(
      (
        first,
        second
      ) =>
        first.date.localeCompare(
          second.date
        )
    );

  const intervals: number[] =
    [];

  for (
    let index = 1;
    index < sorted.length;
    index += 1
  ) {
    const previousDate =
      parseLocalDate(
        sorted[index - 1]
          .date
      );

    const currentDate =
      parseLocalDate(
        sorted[index].date
      );

    if (
      !previousDate ||
      !currentDate
    ) {
      return null;
    }

    intervals.push(
      daysBetween(
        previousDate,
        currentDate
      )
    );
  }

  const monthlyIntervals =
    intervals.filter(
      (interval) =>
        interval >= 24 &&
        interval <= 38
    );

  if (
    monthlyIntervals.length !==
    intervals.length
  ) {
    return null;
  }

  const averageIntervalDays =
    Math.round(
      average(
        intervals
      )
    );

  const averageAmountMinor =
    roundedAverageMinor(
      sorted
    );

  const variation =
    amountVariationPercent(
      sorted,
      averageAmountMinor
    );

  const isStableAmount =
    variation <= 8;

  const isSalaryLike =
    group.type ===
      "income" &&
    group.category ===
      "Salary";

  if (
    !isStableAmount &&
    !isSalaryLike
  ) {
    return null;
  }

  if (
    isSalaryLike &&
    variation > 25
  ) {
    return null;
  }

  const last =
    sorted[
      sorted.length - 1
    ];

  const confidence:
    RecurringTransactionConfidence =
      sorted.length >= 4 &&
      variation <= 5
        ? "high"
        : "medium";

  return {
    id: group.key,
    title:
      last.title ||
      group.title,
    type:
      group.type,
    category:
      group.category,
    occurrences:
      sorted.length,
    averageAmountMinor,
    lastAmountMinor:
      last.amountMinor,
    lastDate:
      last.date,
    nextExpectedDate:
      addDays(
        last.date,
        averageIntervalDays
      ),
    averageIntervalDays,
    amountVariationPercent:
      variation,
    confidence,
  };
}

export function detectRecurringTransactions(
  transactions: readonly Transaction[]
) {
  return groupTransactions(
    transactions
  )
    .map(toCandidate)
    .filter(
      (
        candidate
      ): candidate is RecurringTransactionCandidate =>
        candidate !== null
    )
    .sort(
      (
        first,
        second
      ) => {
        const confidenceDifference =
          (
            second.confidence ===
            "high"
              ? 1
              : 0
          ) -
          (
            first.confidence ===
            "high"
              ? 1
              : 0
          );

        if (
          confidenceDifference !==
          0
        ) {
          return confidenceDifference;
        }

        return (
          second.occurrences -
          first.occurrences
        );
      }
    );
}

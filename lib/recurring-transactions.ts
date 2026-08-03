import type {
  RecurringFrequency,
  RecurringOccurrence,
  RecurringTransaction,
} from "./recurring-transaction-types";
import {
  RECURRING_FREQUENCIES,
} from "./recurring-transaction-types";
import { isValidAmountMinor } from "./transaction-amount";

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function isValidRecurringFrequency(
  value: unknown
): value is RecurringFrequency {
  return (
    typeof value === "string" &&
    RECURRING_FREQUENCIES.includes(
      value as RecurringFrequency
    )
  );
}

export function isValidRecurringDate(
  value: unknown
): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [yearText, monthText, dayText] =
    value.split("-");

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidRecurringTransaction(
  value: unknown
): value is RecurringTransaction {
  if (!isRecord(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  const hasValidType =
    item.type === "income" ||
    item.type === "expense";

  const hasValidDay =
    item.dayOfMonth === null ||
    (
      Number.isInteger(item.dayOfMonth) &&
      Number(item.dayOfMonth) >= 1 &&
      Number(item.dayOfMonth) <= 31
    );

  const hasValidEndDate =
    item.endDate === null ||
    isValidRecurringDate(item.endDate);

  const datesAreOrdered =
    item.endDate === null ||
    (
      typeof item.endDate === "string" &&
      typeof item.startDate === "string" &&
      item.endDate >= item.startDate
    );

  const frequencyAllowsDay =
    item.frequency === "monthly"
      ? item.dayOfMonth !== null
      : item.dayOfMonth === null;

  return (
    typeof item.id === "string" &&
    item.id.trim().length > 0 &&
    typeof item.title === "string" &&
    item.title.trim().length > 0 &&
    typeof item.category === "string" &&
    item.category.trim().length > 0 &&
    isValidAmountMinor(item.amountMinor) &&
    item.amountMinor > 0 &&
    hasValidType &&
    isValidRecurringFrequency(
      item.frequency
    ) &&
    isValidRecurringDate(
      item.startDate
    ) &&
    hasValidEndDate &&
    datesAreOrdered &&
    hasValidDay &&
    frequencyAllowsDay &&
    typeof item.isActive === "boolean"
  );
}

export function addRecurringTransaction(
  items: readonly RecurringTransaction[],
  item: RecurringTransaction
): RecurringTransaction[] {
  if (!isValidRecurringTransaction(item)) {
    throw new TypeError(
      "Cannot add an invalid recurring transaction"
    );
  }

  if (
    items.some(
      (existing) => existing.id === item.id
    )
  ) {
    throw new Error(
      "Recurring transaction already exists"
    );
  }

  return [...items, { ...item }];
}

export function updateRecurringTransaction(
  items: readonly RecurringTransaction[],
  item: RecurringTransaction
): RecurringTransaction[] {
  if (!isValidRecurringTransaction(item)) {
    throw new TypeError(
      "Cannot update an invalid recurring transaction"
    );
  }

  if (
    !items.some(
      (existing) => existing.id === item.id
    )
  ) {
    throw new Error(
      "Cannot update a recurring transaction that does not exist"
    );
  }

  return items.map((existing) =>
    existing.id === item.id
      ? { ...item }
      : { ...existing }
  );
}

export function deleteRecurringTransaction(
  items: readonly RecurringTransaction[],
  itemId: string
): RecurringTransaction[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) => ({ ...item }));
}

function formatUtcDate(
  date: Date
): string {
  const year = date.getUTCFullYear();
  const month = String(
    date.getUTCMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getUTCDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

function addDays(
  date: Date,
  days: number
): Date {
  const next = new Date(date);

  next.setUTCDate(
    next.getUTCDate() + days
  );

  return next;
}

function addMonths(
  date: Date,
  months: number,
  dayOfMonth: number
): Date {
  const year = date.getUTCFullYear();
  const month =
    date.getUTCMonth() + months;

  const firstOfTargetMonth =
    new Date(Date.UTC(year, month, 1));

  const finalDay = new Date(
    Date.UTC(
      firstOfTargetMonth.getUTCFullYear(),
      firstOfTargetMonth.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  return new Date(
    Date.UTC(
      firstOfTargetMonth.getUTCFullYear(),
      firstOfTargetMonth.getUTCMonth(),
      Math.min(dayOfMonth, finalDay)
    )
  );
}

function addYears(
  date: Date,
  years: number
): Date {
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetYear =
    date.getUTCFullYear() + years;

  const lastDay = new Date(
    Date.UTC(targetYear, month + 1, 0)
  ).getUTCDate();

  return new Date(
    Date.UTC(
      targetYear,
      month,
      Math.min(day, lastDay)
    )
  );
}

export function generateRecurringOccurrences(
  item: RecurringTransaction,
  rangeStart: string,
  rangeEnd: string
): RecurringOccurrence[] {
  if (!isValidRecurringTransaction(item)) {
    throw new TypeError(
      "Cannot generate occurrences for an invalid recurring transaction"
    );
  }

  if (
    !isValidRecurringDate(rangeStart) ||
    !isValidRecurringDate(rangeEnd) ||
    rangeEnd < rangeStart
  ) {
    throw new RangeError(
      "Cannot generate occurrences for an invalid date range"
    );
  }

  if (!item.isActive) {
    return [];
  }

  const effectiveStart =
    item.startDate > rangeStart
      ? item.startDate
      : rangeStart;

  const effectiveEnd =
    item.endDate !== null &&
    item.endDate < rangeEnd
      ? item.endDate
      : rangeEnd;

  if (effectiveEnd < effectiveStart) {
    return [];
  }

  const occurrences: RecurringOccurrence[] =
    [];

  let current =
    item.frequency === "monthly"
      ? addMonths(
          parseUtcDate(item.startDate),
          0,
          item.dayOfMonth ?? 1
        )
      : parseUtcDate(item.startDate);

  while (
    formatUtcDate(current) < effectiveStart
  ) {
    if (item.frequency === "weekly") {
      current = addDays(current, 7);
    } else if (
      item.frequency === "monthly"
    ) {
      current = addMonths(
        current,
        1,
        item.dayOfMonth ?? 1
      );
    } else {
      current = addYears(current, 1);
    }
  }

  while (
    formatUtcDate(current) <= effectiveEnd
  ) {
    occurrences.push({
      recurringTransactionId: item.id,
      date: formatUtcDate(current),
    });

    if (item.frequency === "weekly") {
      current = addDays(current, 7);
    } else if (
      item.frequency === "monthly"
    ) {
      current = addMonths(
        current,
        1,
        item.dayOfMonth ?? 1
      );
    } else {
      current = addYears(current, 1);
    }
  }

  return occurrences;
}

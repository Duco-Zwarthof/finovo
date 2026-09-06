export function normalizeTransactionMonth(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

export function shiftTransactionMonth(
  date: Date,
  offset: number
) {
  if (!Number.isInteger(offset)) {
    throw new Error(
      "Month offset must be an integer."
    );
  }

  return new Date(
    date.getFullYear(),
    date.getMonth() + offset,
    1
  );
}

export function isSameTransactionMonth(
  first: Date,
  second: Date
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth()
  );
}

export function isTransactionMonthAfter(
  first: Date,
  second: Date
) {
  const normalizedFirst =
    normalizeTransactionMonth(
      first
    ).getTime();

  const normalizedSecond =
    normalizeTransactionMonth(
      second
    ).getTime();

  return (
    normalizedFirst >
    normalizedSecond
  );
}

export function formatTransactionMonthLabel(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

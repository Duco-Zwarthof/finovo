const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export function parseLocalDate(value: string): Date | null {
  const match = LOCAL_DATE_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return null;
  }

  const date = new Date(0);

  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatLocalDate(date: Date) {
  if (!isValidDate(date)) {
    throw new RangeError("Cannot format an invalid date");
  }

  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLocalCalendarMonthKey(
  value: string
): string | null {
  const date = parseLocalDate(value);

  return date ? formatLocalDate(date).slice(0, 7) : null;
}

export function isInLocalCalendarMonth(
  value: string,
  referenceDate: Date
) {
  if (!isValidDate(referenceDate)) {
    return false;
  }

  const date = parseLocalDate(value);

  return Boolean(
    date &&
      date.getFullYear() === referenceDate.getFullYear() &&
      date.getMonth() === referenceDate.getMonth()
  );
}

const EURO_AMOUNT_PATTERN = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/;

export function isValidAmountMinor(
  amountMinor: unknown
): amountMinor is number {
  return (
    typeof amountMinor === "number" &&
    Number.isSafeInteger(amountMinor) &&
    amountMinor >= 0
  );
}

export function euroAmountToMinor(
  amount: number | string
): number | null {
  if (
    typeof amount === "number" &&
    (!Number.isFinite(amount) || amount < 0)
  ) {
    return null;
  }

  const normalizedAmount = String(amount).trim();
  const match = EURO_AMOUNT_PATTERN.exec(normalizedAmount);

  if (!match) {
    return null;
  }

  const euros = Number(match[1]);
  const cents = Number((match[2] ?? "").padEnd(2, "0"));
  const amountMinor = euros * 100 + cents;

  return isValidAmountMinor(amountMinor)
    ? amountMinor
    : null;
}

export function amountMinorToEuroAmount(
  amountMinor: number
): number | null {
  return isValidAmountMinor(amountMinor)
    ? amountMinor / 100
    : null;
}

export function areTransactionAmountsCompatible(
  amount: number,
  amountMinor: number
): boolean {
  return (
    isValidAmountMinor(amountMinor) &&
    euroAmountToMinor(amount) === amountMinor
  );
}

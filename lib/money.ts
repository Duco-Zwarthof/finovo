const PRESENTATION_LOCALE = "en-IE";
const PRESENTATION_CURRENCY = "EUR";

const exactCurrencyOptions = {
  style: "currency",
  currency: PRESENTATION_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} satisfies Intl.NumberFormatOptions;

const exactCurrencyFormatter = new Intl.NumberFormat(
  PRESENTATION_LOCALE,
  exactCurrencyOptions
);

const signedCurrencyFormatter = new Intl.NumberFormat(
  PRESENTATION_LOCALE,
  {
    ...exactCurrencyOptions,
    signDisplay: "exceptZero",
  }
);

const compactCurrencyFormatter = new Intl.NumberFormat(
  PRESENTATION_LOCALE,
  {
    ...exactCurrencyOptions,
    notation: "compact",
    compactDisplay: "short",
  }
);

export const CURRENCY_SYMBOL =
  exactCurrencyFormatter
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ??
  PRESENTATION_CURRENCY;

function normalizeNegativeZero(amount: number) {
  return Object.is(amount, -0) ? 0 : amount;
}

export function formatCurrency(
  amount: number,
  options: { showSign?: boolean } = {}
) {
  const formatter = options.showSign
    ? signedCurrencyFormatter
    : exactCurrencyFormatter;

  return formatter.format(normalizeNegativeZero(amount));
}

export function formatCompactCurrency(amount: number) {
  return compactCurrencyFormatter.format(
    normalizeNegativeZero(amount)
  );
}

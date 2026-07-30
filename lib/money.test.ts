import { describe, expect, it } from "vitest";

import {
  CURRENCY_SYMBOL,
  formatCompactCurrency,
  formatCurrency,
} from "./money";

describe("formatCurrency", () => {
  it("formats positive values as EUR with two decimals", () => {
    expect(formatCurrency(1_234.5)).toBe("€1,234.50");
  });

  it("formats zero and negative zero consistently", () => {
    expect(formatCurrency(0)).toBe("€0.00");
    expect(formatCurrency(-0)).toBe("€0.00");
  });

  it("formats negative values correctly", () => {
    expect(formatCurrency(-42.5)).toBe("-€42.50");
  });

  it("always displays exactly two decimal places", () => {
    expect(formatCurrency(12)).toBe("€12.00");
    expect(formatCurrency(12.3)).toBe("€12.30");
    expect(formatCurrency(12.34)).toBe("€12.34");
  });

  it("formats very large values without losing the currency", () => {
    expect(formatCurrency(1_234_567_890)).toBe(
      "€1,234,567,890.00"
    );
  });

  it("can display explicit transaction signs", () => {
    expect(formatCurrency(25, { showSign: true })).toBe(
      "+€25.00"
    );
    expect(formatCurrency(-25, { showSign: true })).toBe(
      "-€25.00"
    );
    expect(formatCurrency(0, { showSign: true })).toBe(
      "€0.00"
    );
  });

  it("exposes the locale-derived currency symbol", () => {
    expect(CURRENCY_SYMBOL).toBe("€");
  });
});

describe("formatCompactCurrency", () => {
  it("uses compact EUR formatting with two decimals", () => {
    expect(formatCompactCurrency(0)).toBe("€0.00");
    expect(formatCompactCurrency(1_200)).toBe("€1.20K");
    expect(formatCompactCurrency(1_250_000)).toBe("€1.25M");
  });

  it("formats negative and very large compact values", () => {
    expect(formatCompactCurrency(-1_200)).toBe("-€1.20K");
    expect(formatCompactCurrency(1_234_000_000)).toBe(
      "€1.23B"
    );
  });
});

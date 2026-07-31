import { describe, expect, it } from "vitest";

import {
  amountMinorToEuroAmount,
  areTransactionAmountsCompatible,
  euroAmountToMinor,
  isValidAmountMinor,
  minorUnitsToEuroAmount,
} from "./transaction-amount";

describe("transaction amount conversion", () => {
  it.each([
    ["12.34", 1234],
    ["0.01", 1],
    ["0.00", 0],
    [12.34, 1234],
    [12, 1200],
  ])("converts %s euros to whole cents", (amount, expected) => {
    expect(euroAmountToMinor(amount)).toBe(expected);
  });

  it.each(["1.001", "-1", -1, Number.NaN, Infinity])(
    "rejects invalid euro amount %s",
    (amount) => {
      expect(euroAmountToMinor(amount)).toBeNull();
    }
  );

  it("rejects a conversion outside the safe-integer range", () => {
    expect(
      euroAmountToMinor("900719925474099.92")
    ).toBeNull();
  });

  it.each([
    [1234, 12.34],
    [1, 0.01],
    [0, 0],
  ])("converts %i cents to euros", (amountMinor, expected) => {
    expect(amountMinorToEuroAmount(amountMinor)).toBe(expected);
  });

  it("converts signed calculated minor-unit totals to euros", () => {
    expect(minorUnitsToEuroAmount(-1234)).toBe(-12.34);
    expect(minorUnitsToEuroAmount(1234)).toBe(12.34);
    expect(minorUnitsToEuroAmount(1.5)).toBeNull();
  });
});

describe("transaction amount validation", () => {
  it.each([0, 1, 1234, Number.MAX_SAFE_INTEGER])(
    "accepts safe non-negative integer %s",
    (amountMinor) => {
      expect(isValidAmountMinor(amountMinor)).toBe(true);
    }
  );

  it.each([
    -1,
    1.5,
    Number.NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    "100",
  ])("rejects invalid minor amount %s", (amountMinor) => {
    expect(isValidAmountMinor(amountMinor)).toBe(false);
  });

  it("requires temporary euro and minor values to agree", () => {
    expect(areTransactionAmountsCompatible(12.34, 1234)).toBe(
      true
    );
    expect(areTransactionAmountsCompatible(12.34, 1235)).toBe(
      false
    );
  });
});

import { describe, expect, it } from "vitest";

import {
  addAccount,
  calculateNetWorthMinor,
  deleteAccount,
  isValidAccount,
  updateAccount,
} from "./accounts";
import type { Account } from "./account-types";

const checking: Account = {
  id: "checking-1",
  name: "Rabobank",
  type: "checking",
  balanceMinor: 250_000,
  includedInNetWorth: true,
};

const savings: Account = {
  id: "savings-1",
  name: "Savings",
  type: "savings",
  balanceMinor: 1_250_000,
  includedInNetWorth: true,
};

describe("accounts", () => {
  it("validates accounts", () => {
    expect(isValidAccount(checking)).toBe(true);
    expect(isValidAccount(null)).toBe(false);
    expect(isValidAccount({})).toBe(false);
  });

  it("adds an account", () => {
    const result = addAccount([], checking);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(checking);
  });

  it("updates an account", () => {
    const updated = {
      ...checking,
      balanceMinor: 500_000,
    };

    const result = updateAccount(
      [checking],
      updated
    );

    expect(result[0].balanceMinor).toBe(500_000);
  });

  it("deletes an account", () => {
    const result = deleteAccount(
      [checking],
      checking.id
    );

    expect(result).toHaveLength(0);
  });

  it("calculates net worth", () => {
    expect(
      calculateNetWorthMinor([
        checking,
        savings,
      ])
    ).toBe(1_500_000);
  });

  it("ignores excluded accounts", () => {
    expect(
      calculateNetWorthMinor([
        checking,
        {
          ...savings,
          includedInNetWorth: false,
        },
      ])
    ).toBe(250_000);
  });
});
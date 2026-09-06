import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  Account,
} from "./account-types";
import {
  applyTransactionBalanceMutation,
} from "./transaction-balance-impact";
import type {
  Transaction,
} from "./types";

const accounts: Account[] = [
  {
    id: "checking",
    name: "Checking",
    type: "checking",
    balanceMinor: 100_00,
    includedInNetWorth: true,
  },
  {
    id: "savings",
    name: "Savings",
    type: "savings",
    balanceMinor: 500_00,
    includedInNetWorth: true,
  },
];

function transaction(
  overrides: Partial<Transaction> = {}
): Transaction {
  return {
    id: "tx-1",
    title: "Transaction",
    amountMinor: 25_00,
    type: "expense",
    category: "Other",
    date: "2026-09-06",
    accountId: "checking",
    affectsAccountBalance: true,
    ...overrides,
  };
}

describe(
  "transaction balance impact",
  () => {
    it(
      "subtracts a synced expense from its account",
      () => {
        const result =
          applyTransactionBalanceMutation(
            accounts,
            null,
            transaction()
          );

        expect(
          result.status
        ).toBe("applied");

        expect(
          result.accounts[0]
            .balanceMinor
        ).toBe(75_00);
      }
    );

    it(
      "adds synced income to its account",
      () => {
        const result =
          applyTransactionBalanceMutation(
            accounts,
            null,
            transaction({
              type: "income",
            })
          );

        expect(
          result.accounts[0]
            .balanceMinor
        ).toBe(125_00);
      }
    );

    it(
      "does not change balances for history-only transactions",
      () => {
        const result =
          applyTransactionBalanceMutation(
            accounts,
            null,
            transaction({
              affectsAccountBalance:
                undefined,
            })
          );

        expect(
          result.status
        ).toBe(
          "no-impact"
        );

        expect(
          result.accounts
        ).toEqual(accounts);
      }
    );

    it(
      "uses the net delta when a synced transaction is edited",
      () => {
        const result =
          applyTransactionBalanceMutation(
            accounts,
            transaction({
              amountMinor: 25_00,
            }),
            transaction({
              amountMinor: 40_00,
            })
          );

        expect(
          result.accounts[0]
            .balanceMinor
        ).toBe(85_00);
      }
    );

    it(
      "moves the impact when the linked account changes",
      () => {
        const result =
          applyTransactionBalanceMutation(
            accounts,
            transaction(),
            transaction({
              accountId: "savings",
            })
          );

        expect(
          result.accounts.map(
            (account) =>
              account.balanceMinor
          )
        ).toEqual([
          125_00,
          475_00,
        ]);
      }
    );

    it(
      "reverses the impact when a synced transaction is deleted",
      () => {
        const result =
          applyTransactionBalanceMutation(
            accounts,
            transaction(),
            null
          );

        expect(
          result.accounts[0]
            .balanceMinor
        ).toBe(125_00);
      }
    );

    it(
      "rejects a result below zero",
      () => {
        const result =
          applyTransactionBalanceMutation(
            accounts,
            null,
            transaction({
              amountMinor: 101_00,
            })
          );

        expect(
          result.status
        ).toBe(
          "negative-balance"
        );

        expect(
          result.accounts
        ).toEqual(accounts);
      }
    );

    it(
      "reports a missing linked account",
      () => {
        const result =
          applyTransactionBalanceMutation(
            accounts,
            null,
            transaction({
              accountId:
                "missing",
            })
          );

        expect(
          result.status
        ).toBe(
          "missing-account"
        );
      }
    );
  }
);

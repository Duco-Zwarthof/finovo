import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  Account,
} from "./account-types";
import {
  applyAccountTransfer,
  reverseAccountTransfer,
  type AccountTransfer,
} from "./account-transfers";

const accounts: Account[] = [
  {
    id: "checking",
    name: "Checking",
    type: "checking",
    balanceMinor: 1000_00,
    includedInNetWorth: true,
  },
  {
    id: "savings",
    name: "Savings",
    type: "savings",
    balanceMinor: 250_00,
    includedInNetWorth: true,
  },
];

const transfer: AccountTransfer = {
  id: "transfer-1",
  fromAccountId:
    "checking",
  toAccountId: "savings",
  amountMinor: 200_00,
  date: "2026-09-06",
  note: "Move to savings",
};

describe(
  "account transfers",
  () => {
    it(
      "moves money without changing total balances",
      () => {
        const result =
          applyAccountTransfer(
            accounts,
            transfer
          );

        expect(
          result.status
        ).toBe("applied");

        expect(
          result.accounts.map(
            (account) =>
              account.balanceMinor
          )
        ).toEqual([
          800_00,
          450_00,
        ]);

        expect(
          result.accounts.reduce(
            (
              total,
              account
            ) =>
              total +
              account.balanceMinor,
            0
          )
        ).toBe(1250_00);
      }
    );

    it(
      "rejects transfers to the same account",
      () => {
        const result =
          applyAccountTransfer(
            accounts,
            {
              ...transfer,
              toAccountId:
                "checking",
            }
          );

        expect(
          result.status
        ).toBe("invalid");
      }
    );

    it(
      "rejects insufficient funds",
      () => {
        const result =
          applyAccountTransfer(
            accounts,
            {
              ...transfer,
              amountMinor:
                1001_00,
            }
          );

        expect(
          result.status
        ).toBe(
          "insufficient-funds"
        );
      }
    );

    it(
      "reverses a previously applied transfer",
      () => {
        const applied =
          applyAccountTransfer(
            accounts,
            transfer
          );

        const reversed =
          reverseAccountTransfer(
            applied.accounts,
            transfer
          );

        expect(
          reversed.status
        ).toBe("applied");

        expect(
          reversed.accounts
        ).toEqual(accounts);
      }
    );
  }
);

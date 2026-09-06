import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createPersistedTransactionDataV2,
} from "./persisted-transactions";
import {
  validatePersistedTransactionDataV2,
} from "./storage";
import {
  assignAccountToTransactions,
  assignTransactionAccount,
  countTransactionsForAccount,
  getTransactionAccountLabel,
} from "./transaction-accounts";
import {
  parseTransactionsCsv,
  serializeTransactionsToCsv,
} from "./transaction-csv";
import type {
  Account,
} from "./account-types";
import type {
  Transaction,
} from "./types";

const accounts: Account[] = [
  {
    id: "checking-1",
    name: "ING Checking",
    type: "checking",
    balanceMinor: 125000,
    includedInNetWorth: true,
  },
  {
    id: "savings-1",
    name: "Savings",
    type: "savings",
    balanceMinor: 500000,
    includedInNetWorth: true,
  },
];

const transaction: Transaction = {
  id: "transaction-1",
  title: "Groceries",
  amountMinor: 3250,
  type: "expense",
  category: "Groceries",
  date: "2026-09-06",
};

describe(
  "transaction account linking",
  () => {
    it(
      "links and unlinks a transaction",
      () => {
        const linked =
          assignTransactionAccount(
            transaction,
            "checking-1"
          );

        expect(
          linked.accountId
        ).toBe("checking-1");

        const unlinked =
          assignTransactionAccount(
            linked,
            ""
          );

        expect(
          unlinked
        ).not.toHaveProperty(
          "accountId"
        );
      }
    );

    it(
      "labels linked and unassigned transactions",
      () => {
        expect(
          getTransactionAccountLabel(
            {
              ...transaction,
              accountId:
                "checking-1",
            },
            accounts
          )
        ).toBe(
          "ING Checking"
        );

        expect(
          getTransactionAccountLabel(
            transaction,
            accounts
          )
        ).toBe(
          "Unassigned"
        );
      }
    );

    it(
      "assigns one account to a bank import batch",
      () => {
        const result =
          assignAccountToTransactions(
            [
              transaction,
              {
                ...transaction,
                id:
                  "transaction-2",
              },
            ],
            "checking-1"
          );

        expect(
          result.every(
            (entry) =>
              entry.accountId ===
              "checking-1"
          )
        ).toBe(true);

        expect(
          countTransactionsForAccount(
            result,
            "checking-1"
          )
        ).toBe(2);
      }
    );

    it(
      "persists and validates account links in V2 storage",
      () => {
        const linked = {
          ...transaction,
          accountId:
            "checking-1",
        };

        const persisted =
          createPersistedTransactionDataV2(
            [linked]
          );

        expect(
          persisted.transactions[0]
            .accountId
        ).toBe(
          "checking-1"
        );

        expect(
          validatePersistedTransactionDataV2(
            persisted
          )
        ).toEqual({
          value: [linked],
          recovered: false,
        });
      }
    );

    it(
      "keeps legacy V2 transactions without an account valid",
      () => {
        const persisted =
          createPersistedTransactionDataV2(
            [transaction]
          );

        expect(
          validatePersistedTransactionDataV2(
            persisted
          )
        ).toEqual({
          value: [transaction],
          recovered: false,
        });
      }
    );

    it(
      "round-trips account links through Finovo CSV exports",
      () => {
        const csv =
          serializeTransactionsToCsv(
            [
              {
                ...transaction,
                accountId:
                  "checking-1",
              },
            ]
          );

        expect(csv).toContain(
          "accountId"
        );

        const parsed =
          parseTransactionsCsv(
            csv,
            () =>
              "imported-1"
          );

        expect(
          parsed.transactions[0]
            .accountId
        ).toBe(
          "checking-1"
        );
      }
    );
  }
);

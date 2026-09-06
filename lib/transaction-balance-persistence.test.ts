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
import type {
  Transaction,
} from "./types";

const syncedTransaction: Transaction = {
  id: "synced-1",
  title: "Salary",
  amountMinor: 2500_00,
  type: "income",
  category: "Salary",
  date: "2026-09-06",
  accountId: "checking",
  affectsAccountBalance: true,
};

describe(
  "transaction balance persistence",
  () => {
    it(
      "persists the balance-sync marker",
      () => {
        expect(
          createPersistedTransactionDataV2(
            [syncedTransaction]
          ).transactions[0]
        ).toMatchObject({
          accountId:
            "checking",
          affectsAccountBalance:
            true,
        });
      }
    );

    it(
      "restores the balance-sync marker",
      () => {
        expect(
          validatePersistedTransactionDataV2(
            createPersistedTransactionDataV2(
              [syncedTransaction]
            )
          )
        ).toEqual({
          value: [
            syncedTransaction,
          ],
          recovered: false,
        });
      }
    );
  }
);

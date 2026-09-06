import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ACCOUNT_TRANSFER_STORAGE_KEY,
  readStoredAccountTransfers,
  writeStoredAccountTransfers,
} from "./account-transfer-storage";
import type {
  AccountTransfer,
} from "./account-transfers";
import type {
  StorageLike,
} from "./storage";

function createStorage(
  initial:
    | string
    | null = null
) {
  let value =
    initial;

  const storage: StorageLike = {
    getItem: () => value,
    setItem: (
      _key,
      next
    ) => {
      value = next;
    },
    removeItem: () => {
      value = null;
    },
  };

  return {
    storage,
    getValue: () => value,
  };
}

const transfer: AccountTransfer = {
  id: "transfer-1",
  fromAccountId:
    "checking",
  toAccountId: "savings",
  amountMinor: 50_00,
  date: "2026-09-06",
  note: "Savings",
};

describe(
  "account transfer storage",
  () => {
    it(
      "writes and reads transfers",
      () => {
        const {
          storage,
        } =
          createStorage();

        expect(
          writeStoredAccountTransfers(
            [transfer],
            storage
          ).status
        ).toBe("written");

        expect(
          readStoredAccountTransfers(
            [],
            storage
          )
        ).toEqual({
          value: [transfer],
          status: "valid",
        });
      }
    );

    it(
      "removes storage when there are no transfers",
      () => {
        const {
          storage,
          getValue,
        } =
          createStorage(
            JSON.stringify({
              version: 1,
              transfers: [
                transfer,
              ],
            })
          );

        expect(
          writeStoredAccountTransfers(
            [],
            storage
          ).status
        ).toBe("removed");

        expect(
          getValue()
        ).toBeNull();
      }
    );

    it(
      "rejects unsupported versions",
      () => {
        const {
          storage,
        } =
          createStorage(
            JSON.stringify({
              version: 2,
              transfers: [],
            })
          );

        expect(
          readStoredAccountTransfers(
            [],
            storage
          ).status
        ).toBe(
          "unsupported"
        );
      }
    );

    it(
      "uses the transfer storage key",
      () => {
        expect(
          ACCOUNT_TRANSFER_STORAGE_KEY
        ).toBe(
          "finovo-account-transfers"
        );
      }
    );
  }
);

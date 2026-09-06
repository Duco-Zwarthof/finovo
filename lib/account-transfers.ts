import type {
  Account,
} from "./account-types";
import {
  parseLocalDate,
} from "./date";
import {
  isValidAmountMinor,
} from "./transaction-amount";

export type AccountTransfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amountMinor: number;
  date: string;
  note?: string;
};

export type AccountTransferResult = {
  status:
    | "applied"
    | "invalid"
    | "missing-account"
    | "same-account"
    | "insufficient-funds"
    | "overflow";
  accounts: Account[];
};

function cloneAccounts(
  accounts: readonly Account[]
) {
  return accounts.map(
    (account) => ({
      ...account,
    })
  );
}

export function isValidAccountTransfer(
  value: unknown
): value is AccountTransfer {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const transfer =
    value as Partial<AccountTransfer>;

  return (
    typeof transfer.id ===
      "string" &&
    transfer.id.trim().length >
      0 &&
    typeof transfer.fromAccountId ===
      "string" &&
    transfer.fromAccountId
      .trim().length > 0 &&
    typeof transfer.toAccountId ===
      "string" &&
    transfer.toAccountId
      .trim().length > 0 &&
    transfer.fromAccountId !==
      transfer.toAccountId &&
    isValidAmountMinor(
      transfer.amountMinor
    ) &&
    transfer.amountMinor > 0 &&
    typeof transfer.date ===
      "string" &&
    Boolean(
      parseLocalDate(
        transfer.date
      )
    ) &&
    (
      transfer.note ===
        undefined ||
      (
        typeof transfer.note ===
          "string" &&
        transfer.note.length <=
          160
      )
    )
  );
}

export function applyAccountTransfer(
  accounts: readonly Account[],
  transfer: AccountTransfer
): AccountTransferResult {
  if (
    !isValidAccountTransfer(
      transfer
    )
  ) {
    return {
      status: "invalid",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  if (
    transfer.fromAccountId ===
    transfer.toAccountId
  ) {
    return {
      status:
        "same-account",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  const fromAccount =
    accounts.find(
      (account) =>
        account.id ===
        transfer.fromAccountId
    );

  const toAccount =
    accounts.find(
      (account) =>
        account.id ===
        transfer.toAccountId
    );

  if (
    !fromAccount ||
    !toAccount
  ) {
    return {
      status:
        "missing-account",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  if (
    fromAccount.balanceMinor <
    transfer.amountMinor
  ) {
    return {
      status:
        "insufficient-funds",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  const nextToBalance =
    toAccount.balanceMinor +
    transfer.amountMinor;

  if (
    !Number.isSafeInteger(
      nextToBalance
    )
  ) {
    return {
      status: "overflow",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  return {
    status: "applied",
    accounts: accounts.map(
      (account) => {
        if (
          account.id ===
          transfer.fromAccountId
        ) {
          return {
            ...account,
            balanceMinor:
              account.balanceMinor -
              transfer.amountMinor,
          };
        }

        if (
          account.id ===
          transfer.toAccountId
        ) {
          return {
            ...account,
            balanceMinor:
              nextToBalance,
          };
        }

        return {
          ...account,
        };
      }
    ),
  };
}

export function reverseAccountTransfer(
  accounts: readonly Account[],
  transfer: AccountTransfer
): AccountTransferResult {
  if (
    !isValidAccountTransfer(
      transfer
    )
  ) {
    return {
      status: "invalid",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  const fromAccount =
    accounts.find(
      (account) =>
        account.id ===
        transfer.fromAccountId
    );

  const toAccount =
    accounts.find(
      (account) =>
        account.id ===
        transfer.toAccountId
    );

  if (
    !fromAccount ||
    !toAccount
  ) {
    return {
      status:
        "missing-account",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  if (
    toAccount.balanceMinor <
    transfer.amountMinor
  ) {
    return {
      status:
        "insufficient-funds",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  const restoredFromBalance =
    fromAccount.balanceMinor +
    transfer.amountMinor;

  if (
    !Number.isSafeInteger(
      restoredFromBalance
    )
  ) {
    return {
      status: "overflow",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  return {
    status: "applied",
    accounts: accounts.map(
      (account) => {
        if (
          account.id ===
          transfer.fromAccountId
        ) {
          return {
            ...account,
            balanceMinor:
              restoredFromBalance,
          };
        }

        if (
          account.id ===
          transfer.toAccountId
        ) {
          return {
            ...account,
            balanceMinor:
              account.balanceMinor -
              transfer.amountMinor,
          };
        }

        return {
          ...account,
        };
      }
    ),
  };
}

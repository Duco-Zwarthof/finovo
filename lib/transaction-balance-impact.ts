import type {
  Account,
} from "./account-types";
import type {
  Transaction,
} from "./types";

export type TransactionBalanceImpactStatus =
  | "applied"
  | "no-impact"
  | "missing-account"
  | "negative-balance"
  | "overflow";

export type TransactionBalanceImpactResult = {
  status: TransactionBalanceImpactStatus;
  accounts: Account[];
  accountId?: string;
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

function getSignedImpact(
  transaction: Transaction
) {
  if (
    !transaction.accountId ||
    !transaction.affectsAccountBalance
  ) {
    return null;
  }

  return {
    accountId:
      transaction.accountId,
    deltaMinor:
      transaction.type ===
      "income"
        ? transaction.amountMinor
        : -transaction.amountMinor,
  };
}

function addDelta(
  deltas: Map<string, number>,
  accountId: string,
  deltaMinor: number
) {
  const next =
    (deltas.get(accountId) ?? 0) +
    deltaMinor;

  deltas.set(
    accountId,
    next
  );
}

export function applyTransactionBalanceMutation(
  accounts: readonly Account[],
  previousTransaction:
    | Transaction
    | null
    | undefined,
  nextTransaction:
    | Transaction
    | null
    | undefined
): TransactionBalanceImpactResult {
  const deltas =
    new Map<string, number>();

  const previousImpact =
    previousTransaction
      ? getSignedImpact(
          previousTransaction
        )
      : null;

  if (previousImpact) {
    addDelta(
      deltas,
      previousImpact.accountId,
      -previousImpact.deltaMinor
    );
  }

  const nextImpact =
    nextTransaction
      ? getSignedImpact(
          nextTransaction
        )
      : null;

  if (nextImpact) {
    addDelta(
      deltas,
      nextImpact.accountId,
      nextImpact.deltaMinor
    );
  }

  for (const [
    accountId,
    deltaMinor,
  ] of deltas) {
    if (deltaMinor === 0) {
      continue;
    }

    const account =
      accounts.find(
        (candidate) =>
          candidate.id ===
          accountId
      );

    if (!account) {
      return {
        status:
          "missing-account",
        accounts:
          cloneAccounts(
            accounts
          ),
        accountId,
      };
    }

    const nextBalance =
      account.balanceMinor +
      deltaMinor;

    if (
      !Number.isSafeInteger(
        nextBalance
      )
    ) {
      return {
        status: "overflow",
        accounts:
          cloneAccounts(
            accounts
          ),
        accountId,
      };
    }

    if (nextBalance < 0) {
      return {
        status:
          "negative-balance",
        accounts:
          cloneAccounts(
            accounts
          ),
        accountId,
      };
    }
  }

  const hasImpact =
    Array.from(
      deltas.values()
    ).some(
      (deltaMinor) =>
        deltaMinor !== 0
    );

  if (!hasImpact) {
    return {
      status: "no-impact",
      accounts:
        cloneAccounts(
          accounts
        ),
    };
  }

  return {
    status: "applied",
    accounts: accounts.map(
      (account) => ({
        ...account,
        balanceMinor:
          account.balanceMinor +
          (deltas.get(
            account.id
          ) ?? 0),
      })
    ),
  };
}

export function getTransactionBalanceImpactLabel(
  transaction: Transaction
) {
  if (
    !transaction.accountId ||
    !transaction.affectsAccountBalance
  ) {
    return "History only";
  }

  return "Balance synced";
}

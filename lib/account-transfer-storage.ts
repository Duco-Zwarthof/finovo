import {
  isValidAccountTransfer,
  type AccountTransfer,
} from "./account-transfers";
import type {
  StorageLike,
  StorageWriteResult,
} from "./storage";

export const ACCOUNT_TRANSFER_STORAGE_KEY =
  "finovo-account-transfers";

export const ACCOUNT_TRANSFER_STORAGE_VERSION =
  1 as const;

export type AccountTransferStorageReadStatus =
  | "missing"
  | "valid"
  | "invalid"
  | "unsupported"
  | "unavailable";

export type AccountTransferStorageReadResult = {
  value: AccountTransfer[];
  status: AccountTransferStorageReadStatus;
};

type PersistedAccountTransferData = {
  version: typeof ACCOUNT_TRANSFER_STORAGE_VERSION;
  transfers: AccountTransfer[];
};

function getBrowserStorage(): StorageLike | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function cloneTransfers(
  transfers: readonly AccountTransfer[]
) {
  return transfers.map(
    (transfer) => ({
      ...transfer,
    })
  );
}

export function createPersistedAccountTransferData(
  transfers: readonly AccountTransfer[]
): PersistedAccountTransferData {
  const ids =
    new Set<string>();

  for (const transfer of transfers) {
    if (
      !isValidAccountTransfer(
        transfer
      ) ||
      ids.has(transfer.id)
    ) {
      throw new TypeError(
        "Cannot persist invalid or duplicate account transfers"
      );
    }

    ids.add(transfer.id);
  }

  return {
    version:
      ACCOUNT_TRANSFER_STORAGE_VERSION,
    transfers:
      cloneTransfers(
        transfers
      ),
  };
}

export function readStoredAccountTransfers(
  fallback: readonly AccountTransfer[] = [],
  storage: StorageLike | null =
    getBrowserStorage()
): AccountTransferStorageReadResult {
  const fallbackValue = () =>
    cloneTransfers(
      fallback
    );

  if (!storage) {
    return {
      value:
        fallbackValue(),
      status:
        "unavailable",
    };
  }

  let raw: string | null;

  try {
    raw =
      storage.getItem(
        ACCOUNT_TRANSFER_STORAGE_KEY
      );
  } catch {
    return {
      value:
        fallbackValue(),
      status:
        "unavailable",
    };
  }

  if (raw === null) {
    return {
      value:
        fallbackValue(),
      status: "missing",
    };
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(raw);
  } catch {
    return {
      value:
        fallbackValue(),
      status: "invalid",
    };
  }

  if (
    isRecord(parsed) &&
    "version" in parsed &&
    parsed.version !==
      ACCOUNT_TRANSFER_STORAGE_VERSION
  ) {
    return {
      value:
        fallbackValue(),
      status:
        "unsupported",
    };
  }

  if (
    !isRecord(parsed) ||
    parsed.version !==
      ACCOUNT_TRANSFER_STORAGE_VERSION ||
    !Array.isArray(
      parsed.transfers
    )
  ) {
    return {
      value:
        fallbackValue(),
      status: "invalid",
    };
  }

  const transfers: AccountTransfer[] =
    [];
  const ids =
    new Set<string>();

  for (
    const entry of parsed.transfers
  ) {
    if (
      !isValidAccountTransfer(
        entry
      ) ||
      ids.has(entry.id)
    ) {
      return {
        value:
          fallbackValue(),
        status: "invalid",
      };
    }

    ids.add(entry.id);
    transfers.push({
      ...entry,
    });
  }

  return {
    value: transfers,
    status: "valid",
  };
}

export function writeStoredAccountTransfers(
  transfers: readonly AccountTransfer[],
  storage: StorageLike | null =
    getBrowserStorage()
): StorageWriteResult {
  if (!storage) {
    return {
      status:
        "unavailable",
    };
  }

  if (
    transfers.length === 0
  ) {
    try {
      storage.removeItem(
        ACCOUNT_TRANSFER_STORAGE_KEY
      );

      return {
        status: "removed",
      };
    } catch {
      return {
        status: "failed",
      };
    }
  }

  let persisted:
    PersistedAccountTransferData;

  try {
    persisted =
      createPersistedAccountTransferData(
        transfers
      );
  } catch {
    return {
      status: "failed",
    };
  }

  try {
    storage.setItem(
      ACCOUNT_TRANSFER_STORAGE_KEY,
      JSON.stringify(
        persisted
      )
    );

    return {
      status: "written",
    };
  } catch {
    return {
      status: "failed",
    };
  }
}

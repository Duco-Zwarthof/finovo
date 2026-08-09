import {
  readStoredRecurringTransactions,
} from "./recurring-transaction-storage";
import {
  processDueRecurringTransactions,
} from "./recurring-processor";
import {
  readStoredTransactions,
  writeStoredTransactions,
} from "./storage";

export type RecurringSyncStatus =
  | "synced"
  | "nothing-due"
  | "recurring-storage-unavailable"
  | "transaction-storage-unavailable"
  | "transaction-storage-invalid"
  | "write-failed";

export type RecurringSyncResult = {
  status: RecurringSyncStatus;
  createdCount: number;
  skippedCount: number;
};

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function synchronizeDueRecurringTransactions(
  now: Date = new Date()
): RecurringSyncResult {
  const recurringResult =
    readStoredRecurringTransactions([]);

  if (
    recurringResult.status === "unavailable"
  ) {
    return {
      status:
        "recurring-storage-unavailable",
      createdCount: 0,
      skippedCount: 0,
    };
  }

  const transactionResult =
    readStoredTransactions([]);

  if (
    transactionResult.status ===
    "unavailable"
  ) {
    return {
      status:
        "transaction-storage-unavailable",
      createdCount: 0,
      skippedCount: 0,
    };
  }

  if (
    transactionResult.status === "invalid"
  ) {
    return {
      status: "transaction-storage-invalid",
      createdCount: 0,
      skippedCount: 0,
    };
  }

  const processed =
    processDueRecurringTransactions(
      recurringResult.value,
      transactionResult.value,
      formatLocalDate(now)
    );

  if (
    processed.createdTransactions.length ===
    0
  ) {
    return {
      status: "nothing-due",
      createdCount: 0,
      skippedCount:
        processed.skippedOccurrences.length,
    };
  }

  const writeResult =
    writeStoredTransactions(
      processed.transactions
    );

  if (writeResult.status !== "written") {
    return {
      status: "write-failed",
      createdCount: 0,
      skippedCount:
        processed.skippedOccurrences.length,
    };
  }

  return {
    status: "synced",
    createdCount:
      processed.createdTransactions.length,
    skippedCount:
      processed.skippedOccurrences.length,
  };
}

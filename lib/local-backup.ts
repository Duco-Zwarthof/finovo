export const FINOVO_BACKUP_VERSION = 1 as const;
export const FINOVO_STORAGE_PREFIX = "finovo-";

export type LocalBackupStorage = {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
};

export type LocalBackupWritableStorage =
  LocalBackupStorage & {
    setItem(
      key: string,
      value: string
    ): void;
    removeItem(key: string): void;
  };

export type FinovoLocalBackupV1 = {
  version: typeof FINOVO_BACKUP_VERSION;
  exportedAt: string;
  entries: Record<string, string>;
};

function isValidExportDate(
  value: string
): boolean {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp);
}

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function validateBackupEntries(
  value: unknown
): Record<string, string> {
  if (!isRecord(value)) {
    throw new TypeError(
      "Backup entries are missing or invalid"
    );
  }

  const entries: Record<
    string,
    string
  > = {};

  for (
    const [key, entryValue]
    of Object.entries(value)
  ) {
    if (
      !key.startsWith(
        FINOVO_STORAGE_PREFIX
      )
    ) {
      throw new TypeError(
        "Backup contains an invalid storage key"
      );
    }

    if (
      typeof entryValue !==
      "string"
    ) {
      throw new TypeError(
        "Backup contains an invalid stored value"
      );
    }

    entries[key] =
      entryValue;
  }

  return Object.fromEntries(
    Object.entries(entries).sort(
      ([firstKey], [secondKey]) =>
        firstKey.localeCompare(
          secondKey
        )
    )
  );
}

export function collectFinovoStorageEntries(
  storage: LocalBackupStorage
): Record<string, string> {
  const entries: Record<
    string,
    string
  > = {};

  for (
    let index = 0;
    index < storage.length;
    index += 1
  ) {
    const key =
      storage.key(index);

    if (
      key === null ||
      !key.startsWith(
        FINOVO_STORAGE_PREFIX
      )
    ) {
      continue;
    }

    const value =
      storage.getItem(key);

    if (value !== null) {
      entries[key] = value;
    }
  }

  return Object.fromEntries(
    Object.entries(entries).sort(
      ([firstKey], [secondKey]) =>
        firstKey.localeCompare(
          secondKey
        )
    )
  );
}

export function createFinovoLocalBackup(
  storage: LocalBackupStorage,
  exportedAt =
    new Date().toISOString()
): FinovoLocalBackupV1 {
  if (
    !isValidExportDate(
      exportedAt
    )
  ) {
    throw new TypeError(
      "Backup export date must be a valid date"
    );
  }

  return {
    version:
      FINOVO_BACKUP_VERSION,
    exportedAt,
    entries:
      collectFinovoStorageEntries(
        storage
      ),
  };
}

export function serializeFinovoLocalBackup(
  backup: FinovoLocalBackupV1
): string {
  return JSON.stringify(
    backup,
    null,
    2
  );
}

export function createFinovoBackupFilename(
  exportedAt: string
): string {
  if (
    !isValidExportDate(
      exportedAt
    )
  ) {
    throw new TypeError(
      "Backup export date must be a valid date"
    );
  }

  const datePart =
    exportedAt.slice(0, 10);

  return `finovo-backup-${datePart}.json`;
}

export function parseFinovoLocalBackup(
  rawValue: string
): FinovoLocalBackupV1 {
  let parsed: unknown;

  try {
    parsed =
      JSON.parse(rawValue);
  } catch {
    throw new TypeError(
      "Backup file is not valid JSON"
    );
  }

  if (!isRecord(parsed)) {
    throw new TypeError(
      "Backup file has an invalid structure"
    );
  }

  if (
    parsed.version !==
    FINOVO_BACKUP_VERSION
  ) {
    throw new TypeError(
      "This Finovo backup version is not supported"
    );
  }

  if (
    typeof parsed.exportedAt !==
      "string" ||
    !isValidExportDate(
      parsed.exportedAt
    )
  ) {
    throw new TypeError(
      "Backup creation date is missing or invalid"
    );
  }

  const entries =
    validateBackupEntries(
      parsed.entries
    );

  return {
    version:
      FINOVO_BACKUP_VERSION,
    exportedAt:
      parsed.exportedAt,
    entries,
  };
}

function removeAllFinovoValues(
  storage: LocalBackupWritableStorage
) {
  const keys = Object.keys(
    collectFinovoStorageEntries(
      storage
    )
  );

  for (const key of keys) {
    storage.removeItem(key);
  }
}

function writeFinovoEntries(
  storage: LocalBackupWritableStorage,
  entries: Record<string, string>
) {
  for (
    const [key, value]
    of Object.entries(entries)
  ) {
    storage.setItem(
      key,
      value
    );
  }
}

export function restoreFinovoLocalBackup(
  storage: LocalBackupWritableStorage,
  backup: FinovoLocalBackupV1
): void {
  const validatedBackup =
    parseFinovoLocalBackup(
      JSON.stringify(backup)
    );

  const previousEntries =
    collectFinovoStorageEntries(
      storage
    );

  try {
    removeAllFinovoValues(
      storage
    );

    writeFinovoEntries(
      storage,
      validatedBackup.entries
    );
  } catch {
    try {
      removeAllFinovoValues(
        storage
      );

      writeFinovoEntries(
        storage,
        previousEntries
      );
    } catch {
      throw new Error(
        "Finovo could not restore the backup and automatic rollback also failed. Do not close this browser until you have checked your local data."
      );
    }

    throw new Error(
      "Finovo could not restore the backup. Your previous local data was restored."
    );
  }
}

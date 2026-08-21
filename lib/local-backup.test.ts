import {
  describe,
  expect,
  it,
} from "vitest";

import {
  FINOVO_BACKUP_VERSION,
  collectFinovoStorageEntries,
  createFinovoBackupFilename,
  createFinovoLocalBackup,
  serializeFinovoLocalBackup,
  type LocalBackupStorage,
} from "./local-backup";

function createStorage(
  values: Record<string, string>
): LocalBackupStorage {
  const keys = Object.keys(values);

  return {
    length: keys.length,
    key(index) {
      return keys[index] ?? null;
    },
    getItem(key) {
      return values[key] ?? null;
    },
  };
}

describe("local backup export", () => {
  it("exports only Finovo-prefixed values", () => {
    const storage = createStorage({
      "finovo-transactions":
        '{"version":2}',
      "other-app":
        "must-not-export",
      "finovo-accounts":
        '{"version":1}',
    });

    expect(
      collectFinovoStorageEntries(
        storage
      )
    ).toEqual({
      "finovo-accounts":
        '{"version":1}',
      "finovo-transactions":
        '{"version":2}',
    });
  });

  it("creates a versioned backup", () => {
    const backup =
      createFinovoLocalBackup(
        createStorage({
          "finovo-goals":
            '{"version":1}',
        }),
        "2026-08-20T20:00:00.000Z"
      );

    expect(backup).toEqual({
      version:
        FINOVO_BACKUP_VERSION,
      exportedAt:
        "2026-08-20T20:00:00.000Z",
      entries: {
        "finovo-goals":
          '{"version":1}',
      },
    });
  });

  it("supports an empty Finovo dataset", () => {
    expect(
      createFinovoLocalBackup(
        createStorage({
          unrelated: "value",
        }),
        "2026-08-20T20:00:00.000Z"
      ).entries
    ).toEqual({});
  });

  it("serializes readable JSON", () => {
    const serialized =
      serializeFinovoLocalBackup({
        version: 1,
        exportedAt:
          "2026-08-20T20:00:00.000Z",
        entries: {
          "finovo-accounts":
            '{"version":1}',
        },
      });

    expect(
      JSON.parse(serialized)
    ).toEqual({
      version: 1,
      exportedAt:
        "2026-08-20T20:00:00.000Z",
      entries: {
        "finovo-accounts":
          '{"version":1}',
      },
    });
  });

  it("creates a stable backup filename", () => {
    expect(
      createFinovoBackupFilename(
        "2026-08-20T20:00:00.000Z"
      )
    ).toBe(
      "finovo-backup-2026-08-20.json"
    );
  });

  it("rejects invalid export dates", () => {
    expect(() =>
      createFinovoLocalBackup(
        createStorage({}),
        "not-a-date"
      )
    ).toThrow(
      "Backup export date must be a valid date"
    );
  });
});

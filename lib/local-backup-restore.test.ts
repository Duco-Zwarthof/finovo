import {
  describe,
  expect,
  it,
} from "vitest";

import {
  parseFinovoLocalBackup,
  restoreFinovoLocalBackup,
  type LocalBackupWritableStorage,
} from "./local-backup";

function createWritableStorage(
  initialValues: Record<string, string> = {},
  options: {
    failOnceOnSetKey?: string;
  } = {}
) {
  const values = new Map(
    Object.entries(initialValues)
  );

  let hasFailed = false;

  const storage: LocalBackupWritableStorage = {
    get length() {
      return values.size;
    },

    key(index) {
      return (
        Array.from(values.keys())[index] ??
        null
      );
    },

    getItem(key) {
      return values.get(key) ?? null;
    },

    setItem(key, value) {
      if (
        key === options.failOnceOnSetKey &&
        !hasFailed
      ) {
        hasFailed = true;
        throw new Error("write failed");
      }

      values.set(key, value);
    },

    removeItem(key) {
      values.delete(key);
    },
  };

  return {
    storage,
    values,
  };
}

describe("local backup restore", () => {
  it("parses a valid V1 backup", () => {
    expect(
      parseFinovoLocalBackup(
        JSON.stringify({
          version: 1,
          exportedAt:
            "2026-08-21T00:00:00.000Z",
          entries: {
            "finovo-accounts":
              '{"version":1}',
          },
        })
      )
    ).toEqual({
      version: 1,
      exportedAt:
        "2026-08-21T00:00:00.000Z",
      entries: {
        "finovo-accounts":
          '{"version":1}',
      },
    });
  });

  it("rejects malformed JSON", () => {
    expect(() =>
      parseFinovoLocalBackup(
        "{broken"
      )
    ).toThrow(
      "Backup file is not valid JSON"
    );
  });

  it("rejects unsupported backup versions", () => {
    expect(() =>
      parseFinovoLocalBackup(
        JSON.stringify({
          version: 2,
          exportedAt:
            "2026-08-21T00:00:00.000Z",
          entries: {},
        })
      )
    ).toThrow(
      "This Finovo backup version is not supported"
    );
  });

  it("rejects non-Finovo keys", () => {
    expect(() =>
      parseFinovoLocalBackup(
        JSON.stringify({
          version: 1,
          exportedAt:
            "2026-08-21T00:00:00.000Z",
          entries: {
            "other-app": "value",
          },
        })
      )
    ).toThrow(
      "Backup contains an invalid storage key"
    );
  });

  it("replaces current Finovo values but preserves unrelated storage", () => {
    const {
      storage,
      values,
    } = createWritableStorage({
      "finovo-accounts":
        "old-accounts",
      "finovo-goals":
        "old-goals",
      "other-app":
        "keep-me",
    });

    restoreFinovoLocalBackup(
      storage,
      {
        version: 1,
        exportedAt:
          "2026-08-21T00:00:00.000Z",
        entries: {
          "finovo-accounts":
            "new-accounts",
        },
      }
    );

    expect(
      Object.fromEntries(values)
    ).toEqual({
      "finovo-accounts":
        "new-accounts",
      "other-app":
        "keep-me",
    });
  });

  it("rolls back when restore writing fails", () => {
    const {
      storage,
      values,
    } = createWritableStorage(
      {
        "finovo-accounts":
          "old-accounts",
        "finovo-goals":
          "old-goals",
        "other-app":
          "keep-me",
      },
      {
        failOnceOnSetKey:
          "finovo-goals",
      }
    );

    expect(() =>
      restoreFinovoLocalBackup(
        storage,
        {
          version: 1,
          exportedAt:
            "2026-08-21T00:00:00.000Z",
          entries: {
            "finovo-accounts":
              "new-accounts",
            "finovo-goals":
              "new-goals",
          },
        }
      )
    ).toThrow(
      "Finovo could not restore the backup. Your previous local data was restored."
    );

    expect(
      Object.fromEntries(values)
    ).toEqual({
      "finovo-accounts":
        "old-accounts",
      "finovo-goals":
        "old-goals",
      "other-app":
        "keep-me",
    });
  });

  it("reports when restore and rollback both fail", () => {
    const values =
      new Map<string, string>([
        [
          "finovo-accounts",
          "old-accounts",
        ],
        [
          "finovo-goals",
          "old-goals",
        ],
      ]);

    const storage: LocalBackupWritableStorage = {
      get length() {
        return values.size;
      },

      key(index) {
        return (
          Array.from(values.keys())[
            index
          ] ?? null
        );
      },

      getItem(key) {
        return values.get(key) ?? null;
      },

      setItem(key, value) {
        if (
          key ===
          "finovo-goals"
        ) {
          throw new Error(
            "write failed"
          );
        }

        values.set(key, value);
      },

      removeItem(key) {
        values.delete(key);
      },
    };

    expect(() =>
      restoreFinovoLocalBackup(
        storage,
        {
          version: 1,
          exportedAt:
            "2026-08-21T00:00:00.000Z",
          entries: {
            "finovo-accounts":
              "new-accounts",
            "finovo-goals":
              "new-goals",
          },
        }
      )
    ).toThrow(
      "Finovo could not restore the backup and automatic rollback also failed."
    );
  });
});

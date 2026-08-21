"use client";

import { useEffect } from "react";

import {
  createAutomaticLocalSnapshot,
} from "@/lib/local-snapshots";

const SNAPSHOT_INTERVAL_MS =
  60_000;

function createSnapshotSafely() {
  try {
    const snapshot =
      createAutomaticLocalSnapshot(
        window.localStorage
      );

    if (snapshot !== null) {
      window.dispatchEvent(
        new Event(
          "finovo:snapshots-changed"
        )
      );
    }
  } catch {
    // Snapshot creation is best-effort.
    // Normal Finovo usage must continue.
  }
}

export default function AutomaticLocalSnapshots() {
  useEffect(() => {
    createSnapshotSafely();

    const intervalId =
      window.setInterval(
        createSnapshotSafely,
        SNAPSHOT_INTERVAL_MS
      );

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "hidden"
      ) {
        createSnapshotSafely();
      }
    }

    window.addEventListener(
      "pagehide",
      createSnapshotSafely
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        "pagehide",
        createSnapshotSafely
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  return null;
}

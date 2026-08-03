import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  NetWorthSnapshot,
} from "./net-worth-history-types";
import {
  calculateNetWorthHistorySummary,
  deleteNetWorthSnapshot,
  isValidNetWorthSnapshot,
  sortNetWorthSnapshots,
  upsertDailyNetWorthSnapshot,
} from "./net-worth-history";

const first: NetWorthSnapshot = {
  id: "snapshot-1",
  date: "2026-08-01",
  netWorthMinor: 4_000_000,
};

const second: NetWorthSnapshot = {
  id: "snapshot-2",
  date: "2026-08-02",
  netWorthMinor: 4_200_000,
};

describe("net worth history", () => {
  it("validates snapshots", () => {
    expect(
      isValidNetWorthSnapshot(first)
    ).toBe(true);

    expect(
      isValidNetWorthSnapshot({
        ...first,
        date: "2026-02-30",
      })
    ).toBe(false);
  });

  it("sorts snapshots by date", () => {
    expect(
      sortNetWorthSnapshots([
        second,
        first,
      ])
    ).toEqual([first, second]);
  });

  it("adds and replaces daily snapshots", () => {
    expect(
      upsertDailyNetWorthSnapshot(
        [first],
        second
      )
    ).toEqual([first, second]);

    const replacement = {
      ...second,
      id: "snapshot-2-replaced",
      netWorthMinor: 4_300_000,
    };

    expect(
      upsertDailyNetWorthSnapshot(
        [first, second],
        replacement
      )
    ).toEqual([first, replacement]);
  });

  it("deletes snapshots", () => {
    expect(
      deleteNetWorthSnapshot(
        [first, second],
        first.id
      )
    ).toEqual([second]);
  });

  it("summarizes net worth history", () => {
    expect(
      calculateNetWorthHistorySummary([
        first,
        {
          id: "snapshot-low",
          date: "2026-08-02",
          netWorthMinor: 3_900_000,
        },
        {
          id: "snapshot-high",
          date: "2026-08-03",
          netWorthMinor: 4_400_000,
        },
      ])
    ).toEqual({
      firstSnapshot: first,
      latestSnapshot: {
        id: "snapshot-high",
        date: "2026-08-03",
        netWorthMinor: 4_400_000,
      },
      changeMinor: 400_000,
      changePercentage: 10,
      highestSnapshot: {
        id: "snapshot-high",
        date: "2026-08-03",
        netWorthMinor: 4_400_000,
      },
      lowestSnapshot: {
        id: "snapshot-low",
        date: "2026-08-02",
        netWorthMinor: 3_900_000,
      },
    });
  });
});

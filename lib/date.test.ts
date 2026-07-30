import { describe, expect, it } from "vitest";

import {
  formatLocalDate,
  getLocalCalendarMonthKey,
  isInLocalCalendarMonth,
  parseLocalDate,
} from "./date";

describe("parseLocalDate", () => {
  it("parses valid local calendar dates", () => {
    const date = parseLocalDate("2026-07-30");

    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(6);
    expect(date?.getDate()).toBe(30);
    expect(date?.getHours()).toBe(0);
  });

  it.each([
    "2026-7-30",
    "30-07-2026",
    "2026-07-30T00:00:00Z",
    "2026-13-01",
    "2026-00-10",
    "2026-04-31",
    "2026-02-30",
    "0000-01-01",
    "not-a-date",
    "",
  ])("rejects invalid date %s", (value) => {
    expect(parseLocalDate(value)).toBeNull();
  });

  it("accepts leap days only in leap years", () => {
    expect(parseLocalDate("2024-02-29")).not.toBeNull();
    expect(parseLocalDate("2023-02-29")).toBeNull();
    expect(parseLocalDate("2100-02-29")).toBeNull();
    expect(parseLocalDate("2000-02-29")).not.toBeNull();
  });
});

describe("local calendar month utilities", () => {
  const julyReference = new Date(2026, 6, 15, 23, 30);

  it("includes both boundaries of the reference month", () => {
    expect(
      isInLocalCalendarMonth("2026-07-01", julyReference)
    ).toBe(true);
    expect(
      isInLocalCalendarMonth("2026-07-31", julyReference)
    ).toBe(true);
  });

  it("excludes dates outside the reference month", () => {
    expect(
      isInLocalCalendarMonth("2026-06-30", julyReference)
    ).toBe(false);
    expect(
      isInLocalCalendarMonth("2026-08-01", julyReference)
    ).toBe(false);
    expect(
      isInLocalCalendarMonth("invalid", julyReference)
    ).toBe(false);
  });

  it("handles calendar-year boundaries", () => {
    const januaryReference = new Date(2027, 0, 5);

    expect(
      isInLocalCalendarMonth("2026-12-31", januaryReference)
    ).toBe(false);
    expect(
      isInLocalCalendarMonth("2027-01-01", januaryReference)
    ).toBe(true);
  });

  it("formats a date from local calendar fields", () => {
    expect(formatLocalDate(new Date(2026, 6, 9, 23, 30))).toBe(
      "2026-07-09"
    );
  });

  it("uses local fields instead of the UTC date", () => {
    expect(
      formatLocalDate(
        new Date("2026-07-31T22:30:00.000Z")
      )
    ).toBe("2026-08-01");
  });

  it("returns month keys only for valid local dates", () => {
    expect(getLocalCalendarMonthKey("2026-07-31")).toBe(
      "2026-07"
    );
    expect(getLocalCalendarMonthKey("2026-07-32")).toBeNull();
  });
});

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  formatTransactionMonthLabel,
  isSameTransactionMonth,
  isTransactionMonthAfter,
  normalizeTransactionMonth,
  shiftTransactionMonth,
} from "./transaction-period";

describe(
  "transaction period",
  () => {
    it(
      "normalizes a date to the first day of its month",
      () => {
        const result =
          normalizeTransactionMonth(
            new Date(
              2026,
              8,
              23,
              18,
              30
            )
          );

        expect(
          result.getFullYear()
        ).toBe(2026);

        expect(
          result.getMonth()
        ).toBe(8);

        expect(
          result.getDate()
        ).toBe(1);
      }
    );

    it(
      "moves safely across year boundaries",
      () => {
        const result =
          shiftTransactionMonth(
            new Date(
              2026,
              0,
              15
            ),
            -1
          );

        expect(
          result.getFullYear()
        ).toBe(2025);

        expect(
          result.getMonth()
        ).toBe(11);
      }
    );

    it(
      "compares dates by calendar month",
      () => {
        expect(
          isSameTransactionMonth(
            new Date(
              2026,
              8,
              1
            ),
            new Date(
              2026,
              8,
              29
            )
          )
        ).toBe(true);
      }
    );

    it(
      "detects a month after another month",
      () => {
        expect(
          isTransactionMonthAfter(
            new Date(
              2026,
              9,
              1
            ),
            new Date(
              2026,
              8,
              30
            )
          )
        ).toBe(true);
      }
    );

    it(
      "formats a readable month label",
      () => {
        expect(
          formatTransactionMonthLabel(
            new Date(
              2026,
              8,
              1
            )
          )
        ).toBe(
          "September 2026"
        );
      }
    );

    it(
      "rejects fractional month offsets",
      () => {
        expect(() =>
          shiftTransactionMonth(
            new Date(),
            1.5
          )
        ).toThrow();
      }
    );
  }
);

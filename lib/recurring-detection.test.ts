import {
  describe,
  expect,
  it,
} from "vitest";

import {
  detectRecurringTransactions,
} from "./recurring-detection";
import type {
  Transaction,
} from "./types";

function transaction(
  id: string,
  title: string,
  amountMinor: number,
  date: string,
  type:
    | "income"
    | "expense" =
      "expense",
  category:
    | "Subscriptions"
    | "Salary"
    | "Groceries" =
      "Subscriptions"
): Transaction {
  return {
    id,
    title,
    amountMinor,
    type,
    category,
    date,
  };
}

describe(
  "recurring transaction detection",
  () => {
    it(
      "detects a stable monthly subscription",
      () => {
        const result =
          detectRecurringTransactions(
            [
              transaction(
                "1",
                "Spotify AB",
                1099,
                "2026-06-05"
              ),
              transaction(
                "2",
                "Spotify AB",
                1099,
                "2026-07-05"
              ),
              transaction(
                "3",
                "Spotify AB",
                1099,
                "2026-08-05"
              ),
              transaction(
                "4",
                "Spotify AB",
                1099,
                "2026-09-05"
              ),
            ]
          );

        expect(result).toHaveLength(
          1
        );

        expect(
          result[0]
        ).toMatchObject({
          title: "Spotify AB",
          occurrences: 4,
          averageAmountMinor:
            1099,
          confidence: "high",
        });
      }
    );

    it(
      "predicts the next expected date from the average interval",
      () => {
        const result =
          detectRecurringTransactions(
            [
              transaction(
                "1",
                "Netflix",
                1499,
                "2026-06-01"
              ),
              transaction(
                "2",
                "Netflix",
                1499,
                "2026-07-01"
              ),
              transaction(
                "3",
                "Netflix",
                1499,
                "2026-08-01"
              ),
            ]
          );

        expect(
          result[0]
            .nextExpectedDate
        ).toBe("2026-09-01");
      }
    );

    it(
      "allows small monthly amount differences",
      () => {
        const result =
          detectRecurringTransactions(
            [
              transaction(
                "1",
                "Mobile plan",
                2000,
                "2026-06-10"
              ),
              transaction(
                "2",
                "Mobile plan",
                2050,
                "2026-07-10"
              ),
              transaction(
                "3",
                "Mobile plan",
                2025,
                "2026-08-10"
              ),
            ]
          );

        expect(result).toHaveLength(
          1
        );
      }
    );

    it(
      "does not flag irregular large amount changes as a subscription",
      () => {
        const result =
          detectRecurringTransactions(
            [
              transaction(
                "1",
                "Store",
                1000,
                "2026-06-10"
              ),
              transaction(
                "2",
                "Store",
                4500,
                "2026-07-10"
              ),
              transaction(
                "3",
                "Store",
                900,
                "2026-08-10"
              ),
            ]
          );

        expect(result).toHaveLength(
          0
        );
      }
    );

    it(
      "does not flag weekly payments as monthly recurring",
      () => {
        const result =
          detectRecurringTransactions(
            [
              transaction(
                "1",
                "Weekly",
                1000,
                "2026-08-01"
              ),
              transaction(
                "2",
                "Weekly",
                1000,
                "2026-08-08"
              ),
              transaction(
                "3",
                "Weekly",
                1000,
                "2026-08-15"
              ),
            ]
          );

        expect(result).toHaveLength(
          0
        );
      }
    );

    it(
      "needs at least three occurrences",
      () => {
        const result =
          detectRecurringTransactions(
            [
              transaction(
                "1",
                "Spotify",
                1099,
                "2026-07-05"
              ),
              transaction(
                "2",
                "Spotify",
                1099,
                "2026-08-05"
              ),
            ]
          );

        expect(result).toHaveLength(
          0
        );
      }
    );

    it(
      "recognises salary even when the amount varies moderately",
      () => {
        const result =
          detectRecurringTransactions(
            [
              transaction(
                "1",
                "Employer BV Salary",
                210000,
                "2026-06-25",
                "income",
                "Salary"
              ),
              transaction(
                "2",
                "Employer BV Salary",
                220000,
                "2026-07-25",
                "income",
                "Salary"
              ),
              transaction(
                "3",
                "Employer BV Salary",
                215000,
                "2026-08-25",
                "income",
                "Salary"
              ),
            ]
          );

        expect(result).toHaveLength(
          1
        );
      }
    );

    it(
      "normalizes changing reference numbers in merchant titles",
      () => {
        const result =
          detectRecurringTransactions(
            [
              transaction(
                "1",
                "Spotify 123456",
                1099,
                "2026-06-05"
              ),
              transaction(
                "2",
                "Spotify 234567",
                1099,
                "2026-07-05"
              ),
              transaction(
                "3",
                "Spotify 345678",
                1099,
                "2026-08-05"
              ),
            ]
          );

        expect(result).toHaveLength(
          1
        );
      }
    );
  }
);

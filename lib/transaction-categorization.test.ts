import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createLearnedCategoryRule,
  normalizeTransactionMatchText,
  suggestTransactionCategory,
  upsertTransactionCategoryRule,
} from "./transaction-categorization";

describe(
  "transaction categorization",
  () => {
    it(
      "normalizes merchant text",
      () => {
        expect(
          normalizeTransactionMatchText(
            "  Pathé   Groningen #123 "
          )
        ).toBe(
          "pathe groningen 123"
        );
      }
    );

    it(
      "recognises common grocery merchants",
      () => {
        expect(
          suggestTransactionCategory(
            "ALBERT HEIJN 1234 GRONINGEN",
            "expense"
          )
        ).toMatchObject({
          category:
            "Groceries",
          source:
            "built-in",
        });
      }
    );

    it(
      "recognises subscriptions",
      () => {
        expect(
          suggestTransactionCategory(
            "Spotify AB",
            "expense"
          ).category
        ).toBe(
          "Subscriptions"
        );
      }
    );

    it(
      "only classifies salary keywords as Salary for income",
      () => {
        expect(
          suggestTransactionCategory(
            "Salaris september",
            "income"
          ).category
        ).toBe("Salary");

        expect(
          suggestTransactionCategory(
            "Salaris terugbetaling",
            "expense"
          ).category
        ).toBe("Other");
      }
    );

    it(
      "prefers learned rules over built-in rules",
      () => {
        const suggestion =
          suggestTransactionCategory(
            "Albert Heijn Groningen",
            "expense",
            [
              {
                id:
                  "expense:albert heijn",
                matchText:
                  "albert heijn",
                category:
                  "Entertainment",
                type:
                  "expense",
              },
            ]
          );

        expect(
          suggestion.category
        ).toBe(
          "Entertainment"
        );

        expect(
          suggestion.source
        ).toBe("learned");
      }
    );

    it(
      "creates a reusable rule from a correction",
      () => {
        const rule =
          createLearnedCategoryRule(
            "Coffee Company Groningen 0042",
            "Entertainment",
            "expense"
          );

        expect(rule).toEqual({
          id:
            "expense:coffee company groningen 0042",
          matchText:
            "coffee company groningen 0042",
          category:
            "Entertainment",
          type: "expense",
        });
      }
    );

    it(
      "replaces an existing learned rule with the same id",
      () => {
        const first = {
          id:
            "expense:coffee company",
          matchText:
            "coffee company",
          category:
            "Other" as const,
          type:
            "expense" as const,
        };

        const updated =
          upsertTransactionCategoryRule(
            [first],
            {
              ...first,
              category:
                "Entertainment",
            }
          );

        expect(updated).toHaveLength(
          1
        );

        expect(
          updated[0].category
        ).toBe(
          "Entertainment"
        );
      }
    );
  }
);

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  parseBankTransactionsCsv,
  suggestBankTransactionCategory,
} from "./bank-import";

describe(
  "bank import",
  () => {
    it(
      "recognises an ING-style export",
      () => {
        const result =
          parseBankTransactionsCsv(
            [
              "Datum;Naam / Omschrijving;Af Bij;Bedrag (EUR);Mededelingen",
              "06-09-2026;Albert Heijn;Af;34,25;Boodschappen",
              "01-09-2026;Werkgever BV;Bij;2150,00;Salaris september",
            ].join("\n"),
            (row) =>
              `row-${row}`
          );

        expect(
          result.bank
        ).toBe("ING");

        expect(
          result.transactions
        ).toHaveLength(2);

        expect(
          result.transactions[0]
        ).toMatchObject({
          amountMinor: 3425,
          type: "expense",
          category:
            "Groceries",
          date: "2026-09-06",
        });

        expect(
          result.transactions[1]
        ).toMatchObject({
          amountMinor:
            215000,
          type: "income",
          category: "Salary",
        });
      }
    );

    it(
      "applies learned category rules during bank import",
      () => {
        const result =
          parseBankTransactionsCsv(
            [
              "Datum;Omschrijving;Bedrag",
              "06-09-2026;Coffee Company Groningen;-4,50",
            ].join("\n"),
            {
              createId: () =>
                "import-1",
              categoryRules: [
                {
                  id:
                    "expense:coffee company",
                  matchText:
                    "coffee company",
                  category:
                    "Entertainment",
                  type:
                    "expense",
                },
              ],
            }
          );

        expect(
          result.transactions[0]
            .category
        ).toBe(
          "Entertainment"
        );
      }
    );

    it(
      "supports signed generic amounts",
      () => {
        const result =
          parseBankTransactionsCsv(
            [
              "Datum;Omschrijving;Bedrag",
              "06-09-2026;NS OVpay;-18,40",
              "07-09-2026;Refund;+25,00",
            ].join("\n"),
            (row) =>
              `row-${row}`
          );

        expect(
          result.transactions[0]
            .type
        ).toBe("expense");

        expect(
          result.transactions[0]
            .category
        ).toBe("Transport");

        expect(
          result.transactions[1]
            .type
        ).toBe("income");
      }
    );

    it(
      "supports Dutch thousands separators",
      () => {
        const result =
          parseBankTransactionsCsv(
            [
              "Datum;Omschrijving;Bedrag",
              "06-09-2026;Test;1.234,56",
            ].join("\n"),
            () => "import-1"
          );

        expect(
          result.transactions[0]
            .amountMinor
        ).toBe(123456);
      }
    );

    it(
      "supports compact bank dates",
      () => {
        const result =
          parseBankTransactionsCsv(
            [
              "Datum;Omschrijving;Bedrag",
              "20260906;Test;-10,00",
            ].join("\n"),
            () => "import-1"
          );

        expect(
          result.transactions[0]
            .date
        ).toBe("2026-09-06");
      }
    );

    it(
      "skips impossible dates",
      () => {
        const result =
          parseBankTransactionsCsv(
            [
              "Datum;Omschrijving;Bedrag",
              "31-02-2026;Invalid;10,00",
              "06-09-2026;Valid;-12,50",
            ].join("\n"),
            (row) =>
              `row-${row}`
          );

        expect(
          result.skippedRows
        ).toBe(1);

        expect(
          result.transactions
        ).toHaveLength(1);
      }
    );

    it(
      "suggests useful local categories",
      () => {
        expect(
          suggestBankTransactionCategory(
            "Spotify monthly",
            "expense"
          )
        ).toBe(
          "Subscriptions"
        );

        expect(
          suggestBankTransactionCategory(
            "DEGIRO transfer",
            "expense"
          )
        ).toBe(
          "Investments"
        );
      }
    );

    it(
      "fails safely when amount and date columns cannot be found",
      () => {
        const result =
          parseBankTransactionsCsv(
            "Merchant;Value\nCafe;10"
          );

        expect(
          result.transactions
        ).toHaveLength(0);

        expect(
          result.errors[0]
        ).toContain(
          "date and amount"
        );
      }
    );
  }
);

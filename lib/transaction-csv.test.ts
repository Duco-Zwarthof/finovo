import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  Transaction,
} from "./types";
import {
  mergeImportedTransactions,
  parseTransactionsCsv,
  serializeTransactionsToCsv,
} from "./transaction-csv";

const transactions: Transaction[] = [
  {
    id: "1",
    title:
      'Coffee, "large"',
    amountMinor: 450,
    type: "expense",
    category: "Groceries",
    date: "2026-09-02",
  },
  {
    id: "2",
    title: "Salary",
    amountMinor: 250_000,
    type: "income",
    category: "Salary",
    date: "2026-09-01",
  },
];

describe(
  "transaction CSV",
  () => {
    it(
      "exports Finovo transaction fields",
      () => {
        const csv =
          serializeTransactionsToCsv(
            transactions
          );

        expect(csv).toContain(
          "date,title,type,category,amount"
        );

        expect(csv).toContain(
          '"Coffee, ""large"""'
        );

        expect(csv).toContain(
          "2500.00"
        );
      }
    );

    it(
      "imports exported CSV data",
      () => {
        const csv =
          serializeTransactionsToCsv(
            transactions
          );

        const result =
          parseTransactionsCsv(
            csv,
            (row) =>
              `row-${row}`
          );

        expect(
          result.skippedRows
        ).toBe(0);

        expect(
          result.transactions
        ).toHaveLength(2);

        expect(
          result.transactions[0]
        ).toMatchObject({
          title:
            'Coffee, "large"',
          amountMinor: 450,
          type: "expense",
          category: "Groceries",
          date: "2026-09-02",
        });
      }
    );

    it(
      "supports semicolon CSV and decimal commas",
      () => {
        const result =
          parseTransactionsCsv(
            [
              "date;title;type;category;amount",
              "2026-09-02;Lunch;expense;Groceries;12,50",
            ].join("\n"),
            () => "import-1"
          );

        expect(
          result.transactions[0]
            .amountMinor
        ).toBe(1250);
      }
    );

    it(
      "matches categories case-insensitively",
      () => {
        const result =
          parseTransactionsCsv(
            [
              "date,title,type,category,amount",
              "2026-09-02,Bus,expense,transport,3.25",
            ].join("\n"),
            () => "import-1"
          );

        expect(
          result.transactions[0]
            .category
        ).toBe("Transport");
      }
    );

    it(
      "skips invalid rows instead of importing corrupt data",
      () => {
        const result =
          parseTransactionsCsv(
            [
              "date,title,type,category,amount",
              "not-a-date,Test,expense,Other,10.00",
              "2026-09-02,Valid,expense,Other,12.00",
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

        expect(
          result.errors[0]
        ).toContain(
          "invalid date"
        );
      }
    );

    it(
      "rejects files without the required headers",
      () => {
        const result =
          parseTransactionsCsv(
            "merchant,value\nCafe,10"
          );

        expect(
          result.transactions
        ).toHaveLength(0);

        expect(
          result.errors[0]
        ).toContain(
          "header"
        );
      }
    );

    it(
      "does not add exact duplicate transactions",
      () => {
        const imported: Transaction[] =
          [
            {
              ...transactions[0],
              id: "new-id",
            },
            {
              id: "3",
              title: "Train",
              amountMinor: 1750,
              type: "expense",
              category: "Transport",
              date: "2026-09-03",
            },
          ];

        const result =
          mergeImportedTransactions(
            transactions,
            imported
          );

        expect(
          result.addedCount
        ).toBe(1);

        expect(
          result.duplicateCount
        ).toBe(1);

        expect(
          result.transactions[0]
            .title
        ).toBe("Train");
      }
    );
  }
);

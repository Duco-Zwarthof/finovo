import {
  parseLocalDate,
} from "./date";
import {
  euroAmountToMinor,
} from "./transaction-amount";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  type Transaction,
  type TransactionCategory,
  type TransactionType,
} from "./types";

const REQUIRED_HEADERS = [
  "date",
  "title",
  "type",
  "category",
  "amount",
] as const;

export type TransactionCsvParseResult = {
  transactions: Transaction[];
  skippedRows: number;
  errors: string[];
};

export type TransactionCsvMergeResult = {
  transactions: Transaction[];
  addedCount: number;
  duplicateCount: number;
};

type IdFactory = (
  rowNumber: number
) => string;

function escapeCsvCell(
  value: string
) {
  return `"${value.replaceAll(
    '"',
    '""'
  )}"`;
}

function splitCsvLine(
  line: string,
  delimiter: "," | ";"
) {
  const cells: string[] = [];
  let current = "";
  let isQuoted = false;

  for (
    let index = 0;
    index < line.length;
    index += 1
  ) {
    const character =
      line[index];

    if (character === '"') {
      const next =
        line[index + 1];

      if (
        isQuoted &&
        next === '"'
      ) {
        current += '"';
        index += 1;
        continue;
      }

      isQuoted = !isQuoted;
      continue;
    }

    if (
      character ===
        delimiter &&
      !isQuoted
    ) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  if (isQuoted) {
    return null;
  }

  cells.push(current);

  return cells;
}

function normalizeHeader(
  value: string
) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

function detectDelimiter(
  headerLine: string
): "," | ";" | null {
  for (const delimiter of [
    ",",
    ";",
  ] as const) {
    const cells =
      splitCsvLine(
        headerLine,
        delimiter
      );

    if (!cells) {
      continue;
    }

    const headers =
      cells.map(
        normalizeHeader
      );

    if (
      REQUIRED_HEADERS.every(
        (header) =>
          headers.includes(
            header
          )
      )
    ) {
      return delimiter;
    }
  }

  return null;
}

function isTransactionType(
  value: string
): value is TransactionType {
  return TRANSACTION_TYPES.some(
    (type) => type === value
  );
}

function findCategory(
  value: string
): TransactionCategory | null {
  const normalized =
    value.trim().toLowerCase();

  return (
    TRANSACTION_CATEGORIES.find(
      (category) =>
        category.toLowerCase() ===
        normalized
    ) ?? null
  );
}

function normalizeAmount(
  value: string
) {
  const trimmed =
    value.trim();

  if (
    trimmed.includes(",") &&
    !trimmed.includes(".")
  ) {
    return trimmed.replace(
      ",",
      "."
    );
  }

  return trimmed;
}

function defaultIdFactory(
  rowNumber: number
) {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `csv-import-${Date.now()}-${rowNumber}`;
}

export function serializeTransactionsToCsv(
  transactions: readonly Transaction[]
) {
  const rows = [
    [
      ...REQUIRED_HEADERS,
      "accountId",
    ].join(","),
  ];

  for (const transaction of transactions) {
    rows.push(
      [
        escapeCsvCell(
          transaction.date
        ),
        escapeCsvCell(
          transaction.title
        ),
        escapeCsvCell(
          transaction.type
        ),
        escapeCsvCell(
          transaction.category
        ),
        (
          transaction.amountMinor /
          100
        ).toFixed(2),
        escapeCsvCell(
          transaction.accountId ??
            ""
        ),
      ].join(",")
    );
  }

  return `${rows.join("\n")}\n`;
}

export function parseTransactionsCsv(
  input: string,
  createId: IdFactory =
    defaultIdFactory
): TransactionCsvParseResult {
  const normalizedInput =
    input.replace(
      /\r\n?/g,
      "\n"
    );

  const lines =
    normalizedInput
      .split("\n")
      .filter(
        (line) =>
          line.trim().length > 0
      );

  if (lines.length === 0) {
    return {
      transactions: [],
      skippedRows: 0,
      errors: [
        "The CSV file is empty.",
      ],
    };
  }

  const delimiter =
    detectDelimiter(
      lines[0]
    );

  if (!delimiter) {
    return {
      transactions: [],
      skippedRows:
        Math.max(
          0,
          lines.length - 1
        ),
      errors: [
        "The CSV header must contain date, title, type, category and amount.",
      ],
    };
  }

  const headerCells =
    splitCsvLine(
      lines[0],
      delimiter
    );

  if (!headerCells) {
    return {
      transactions: [],
      skippedRows:
        Math.max(
          0,
          lines.length - 1
        ),
      errors: [
        "The CSV header contains an unclosed quote.",
      ],
    };
  }

  const headers =
    headerCells.map(
      normalizeHeader
    );

  const headerIndexes =
    Object.fromEntries(
      REQUIRED_HEADERS.map(
        (header) => [
          header,
          headers.indexOf(
            header
          ),
        ]
      )
    ) as Record<
      (typeof REQUIRED_HEADERS)[number],
      number
    >;

  const accountIdIndex =
    headers.indexOf(
      "accountid"
    );

  const transactions: Transaction[] =
    [];
  const errors: string[] = [];
  let skippedRows = 0;

  for (
    let lineIndex = 1;
    lineIndex < lines.length;
    lineIndex += 1
  ) {
    const rowNumber =
      lineIndex + 1;

    const cells =
      splitCsvLine(
        lines[lineIndex],
        delimiter
      );

    if (!cells) {
      skippedRows += 1;
      errors.push(
        `Row ${rowNumber}: unclosed quote.`
      );
      continue;
    }

    const getValue = (
      header: (typeof REQUIRED_HEADERS)[number]
    ) =>
      (
        cells[
          headerIndexes[
            header
          ]
        ] ?? ""
      ).trim();

    const date =
      getValue("date");
    const title =
      getValue("title");
    const type =
      getValue("type").toLowerCase();
    const category =
      findCategory(
        getValue("category")
      );
    const amountMinor =
      euroAmountToMinor(
        normalizeAmount(
          getValue("amount")
        )
      );

    const accountId =
      accountIdIndex >= 0
        ? (
            cells[
              accountIdIndex
            ] ?? ""
          ).trim()
        : "";

    const rowErrors: string[] =
      [];

    if (!parseLocalDate(date)) {
      rowErrors.push(
        "invalid date"
      );
    }

    if (title.length === 0) {
      rowErrors.push(
        "missing title"
      );
    }

    if (
      !isTransactionType(type)
    ) {
      rowErrors.push(
        "invalid type"
      );
    }

    if (!category) {
      rowErrors.push(
        "invalid category"
      );
    }

    if (amountMinor === null) {
      rowErrors.push(
        "invalid amount"
      );
    }

    if (
      rowErrors.length > 0 ||
      !isTransactionType(type) ||
      !category ||
      amountMinor === null
    ) {
      skippedRows += 1;

      if (errors.length < 8) {
        errors.push(
          `Row ${rowNumber}: ${rowErrors.join(
            ", "
          )}.`
        );
      }

      continue;
    }

    transactions.push({
      id: createId(rowNumber),
      title,
      amountMinor,
      type,
      category,
      date,
      ...(accountId
        ? {
            accountId,
          }
        : {}),
    });
  }

  if (
    skippedRows > errors.length
  ) {
    errors.push(
      `${
        skippedRows -
        errors.length
      } additional invalid row(s) were skipped.`
    );
  }

  return {
    transactions,
    skippedRows,
    errors,
  };
}

function createTransactionFingerprint(
  transaction: Transaction
) {
  return [
    transaction.date,
    transaction.title
      .trim()
      .toLowerCase(),
    transaction.type,
    transaction.category,
    transaction.amountMinor,
  ].join("|");
}

export function mergeImportedTransactions(
  existing: readonly Transaction[],
  imported: readonly Transaction[]
): TransactionCsvMergeResult {
  const fingerprints =
    new Set(
      existing.map(
        createTransactionFingerprint
      )
    );

  const additions: Transaction[] =
    [];
  let duplicateCount = 0;

  for (const transaction of imported) {
    const fingerprint =
      createTransactionFingerprint(
        transaction
      );

    if (
      fingerprints.has(
        fingerprint
      )
    ) {
      duplicateCount += 1;
      continue;
    }

    fingerprints.add(
      fingerprint
    );

    additions.push({
      ...transaction,
    });
  }

  return {
    transactions: [
      ...additions,
      ...existing.map(
        (transaction) => ({
          ...transaction,
        })
      ),
    ],
    addedCount:
      additions.length,
    duplicateCount,
  };
}

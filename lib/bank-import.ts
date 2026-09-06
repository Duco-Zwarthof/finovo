import {
  parseLocalDate,
} from "./date";
import {
  euroAmountToMinor,
} from "./transaction-amount";
import {
  suggestTransactionCategory,
  type TransactionCategoryRule,
} from "./transaction-categorization";
import type {
  Transaction,
  TransactionType,
} from "./types";

export type DetectedBank =
  | "ING"
  | "Rabobank"
  | "ABN AMRO"
  | "Generic bank";

export type BankImportResult = {
  bank: DetectedBank;
  transactions: Transaction[];
  skippedRows: number;
  errors: string[];
};

type CsvDelimiter =
  | ","
  | ";"
  | "\t";

type IdFactory = (
  rowNumber: number
) => string;

function splitCsvLine(
  line: string,
  delimiter: CsvDelimiter
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
      if (
        isQuoted &&
        line[index + 1] === '"'
      ) {
        current += '"';
        index += 1;
        continue;
      }

      isQuoted = !isQuoted;
      continue;
    }

    if (
      character === delimiter &&
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
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]/g,
      ""
    );
}

function detectDelimiter(
  headerLine: string
): CsvDelimiter {
  const delimiters: CsvDelimiter[] =
    [",", ";", "\t"];

  let bestDelimiter: CsvDelimiter =
    ",";
  let highestCellCount = 0;

  for (const delimiter of delimiters) {
    const cells =
      splitCsvLine(
        headerLine,
        delimiter
      );

    if (
      cells &&
      cells.length >
        highestCellCount
    ) {
      bestDelimiter =
        delimiter;
      highestCellCount =
        cells.length;
    }
  }

  return bestDelimiter;
}

function findHeaderIndex(
  headers: readonly string[],
  aliases: readonly string[]
) {
  for (const alias of aliases) {
    const index =
      headers.indexOf(
        normalizeHeader(alias)
      );

    if (index >= 0) {
      return index;
    }
  }

  return -1;
}

function detectBank(
  headers: readonly string[]
): DetectedBank {
  const joined =
    headers.join("|");

  if (
    joined.includes(
      "naamomschrijving"
    ) ||
    joined.includes("afbij")
  ) {
    return "ING";
  }

  if (
    joined.includes(
      "naamtegenpartij"
    ) ||
    joined.includes(
      "saldonatrn"
    ) ||
    joined.includes(
      "omschrijving1"
    )
  ) {
    return "Rabobank";
  }

  if (
    joined.includes(
      "mutationcode"
    ) ||
    (
      joined.includes(
        "accountnumber"
      ) &&
      joined.includes(
        "transactiondate"
      )
    )
  ) {
    return "ABN AMRO";
  }

  return "Generic bank";
}

function normalizeBankDate(
  value: string
) {
  const trimmed =
    value.trim();

  const iso =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      trimmed
    );

  if (iso) {
    return parseLocalDate(
      trimmed
    )
      ? trimmed
      : null;
  }

  const dutch =
    /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(
      trimmed
    );

  if (dutch) {
    const normalized =
      `${dutch[3]}-${dutch[2]}-${dutch[1]}`;

    return parseLocalDate(
      normalized
    )
      ? normalized
      : null;
  }

  const compact =
    /^(\d{4})(\d{2})(\d{2})$/.exec(
      trimmed
    );

  if (compact) {
    const normalized =
      `${compact[1]}-${compact[2]}-${compact[3]}`;

    return parseLocalDate(
      normalized
    )
      ? normalized
      : null;
  }

  return null;
}

function normalizeBankAmount(
  value: string
) {
  let normalized =
    value
      .trim()
      .replaceAll("€", "")
      .replace(/\s/g, "")
      .replace(
        /^[+-]/,
        ""
      );

  const commaIndex =
    normalized.lastIndexOf(
      ","
    );

  const dotIndex =
    normalized.lastIndexOf(
      "."
    );

  if (
    commaIndex >= 0 &&
    dotIndex >= 0
  ) {
    if (
      commaIndex >
      dotIndex
    ) {
      normalized =
        normalized
          .replaceAll(".", "")
          .replace(",", ".");
    } else {
      normalized =
        normalized.replaceAll(
          ",",
          ""
        );
    }
  } else if (
    commaIndex >= 0
  ) {
    normalized =
      normalized.replace(
        ",",
        "."
      );
  }

  return normalized;
}

function determineType(
  rawAmount: string,
  direction: string
): TransactionType {
  const normalizedDirection =
    direction
      .trim()
      .toLowerCase();

  if (
    normalizedDirection ===
      "af" ||
    normalizedDirection ===
      "debit" ||
    normalizedDirection ===
      "d"
  ) {
    return "expense";
  }

  if (
    normalizedDirection ===
      "bij" ||
    normalizedDirection ===
      "credit" ||
    normalizedDirection ===
      "c"
  ) {
    return "income";
  }

  return rawAmount
    .trim()
    .startsWith("-")
    ? "expense"
    : "income";
}


export function suggestBankTransactionCategory(
  text: string,
  type: TransactionType
) {
  return suggestTransactionCategory(
    text,
    type
  ).category;
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

  return `bank-import-${Date.now()}-${rowNumber}`;
}

export type BankImportOptions = {
  createId?: IdFactory;
  categoryRules?: readonly TransactionCategoryRule[];
};

export function parseBankTransactionsCsv(
  input: string,
  createIdOrOptions:
    | IdFactory
    | BankImportOptions =
      {}
): BankImportResult {
  const options =
    typeof createIdOrOptions ===
    "function"
      ? {
          createId:
            createIdOrOptions,
        }
      : createIdOrOptions;

  const createId =
    options.createId ??
    defaultIdFactory;

  const categoryRules =
    options.categoryRules ??
    [];
  const lines =
    input
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .filter(
        (line) =>
          line.trim().length > 0
      );

  if (lines.length === 0) {
    return {
      bank: "Generic bank",
      transactions: [],
      skippedRows: 0,
      errors: [
        "The bank file is empty.",
      ],
    };
  }

  const delimiter =
    detectDelimiter(
      lines[0]
    );

  const headerCells =
    splitCsvLine(
      lines[0],
      delimiter
    );

  if (!headerCells) {
    return {
      bank: "Generic bank",
      transactions: [],
      skippedRows: 0,
      errors: [
        "The CSV header could not be read.",
      ],
    };
  }

  const headers =
    headerCells.map(
      normalizeHeader
    );

  const bank =
    detectBank(headers);

  const dateIndex =
    findHeaderIndex(
      headers,
      [
        "date",
        "datum",
        "boekdatum",
        "transactiedatum",
        "transactiondate",
        "rentedatum",
      ]
    );

  const amountIndex =
    findHeaderIndex(
      headers,
      [
        "amount",
        "bedrag",
        "bedrag eur",
        "bedrag (eur)",
        "mutationamount",
        "transactionamount",
      ]
    );

  const titleIndex =
    findHeaderIndex(
      headers,
      [
        "title",
        "naam / omschrijving",
        "naam omschrijving",
        "naam tegenpartij",
        "tegenpartij",
        "omschrijving",
        "description",
        "merchant",
      ]
    );

  const detailsIndex =
    findHeaderIndex(
      headers,
      [
        "mededelingen",
        "omschrijving-1",
        "omschrijving1",
        "omschrijving-2",
        "details",
        "mutatiesoort",
      ]
    );

  const directionIndex =
    findHeaderIndex(
      headers,
      [
        "af bij",
        "af/bij",
        "credit debit indicator",
        "creditdebitindicator",
        "direction",
      ]
    );

  if (
    dateIndex < 0 ||
    amountIndex < 0
  ) {
    return {
      bank,
      transactions: [],
      skippedRows:
        Math.max(
          0,
          lines.length - 1
        ),
      errors: [
        "Finovo could not find a date and amount column in this bank file.",
      ],
    };
  }

  const transactions: Transaction[] =
    [];
  const errors: string[] =
    [];
  let skippedRows = 0;

  for (
    let lineIndex = 1;
    lineIndex < lines.length;
    lineIndex += 1
  ) {
    const cells =
      splitCsvLine(
        lines[lineIndex],
        delimiter
      );

    const rowNumber =
      lineIndex + 1;

    if (!cells) {
      skippedRows += 1;

      if (errors.length < 6) {
        errors.push(
          `Row ${rowNumber}: unclosed quote.`
        );
      }

      continue;
    }

    const date =
      normalizeBankDate(
        cells[dateIndex] ?? ""
      );

    const rawAmount =
      cells[amountIndex] ?? "";

    const amountMinor =
      euroAmountToMinor(
        normalizeBankAmount(
          rawAmount
        )
      );

    if (
      !date ||
      amountMinor === null
    ) {
      skippedRows += 1;

      if (errors.length < 6) {
        errors.push(
          `Row ${rowNumber}: invalid date or amount.`
        );
      }

      continue;
    }

    const title =
      (
        cells[
          titleIndex
        ] ?? ""
      ).trim();

    const details =
      (
        cells[
          detailsIndex
        ] ?? ""
      ).trim();

    const combinedText =
      [title, details]
        .filter(Boolean)
        .join(" ");

    const direction =
      (
        cells[
          directionIndex
        ] ?? ""
      ).trim();

    const type =
      determineType(
        rawAmount,
        direction
      );

    transactions.push({
      id: createId(
        rowNumber
      ),
      title:
        title ||
        details ||
        "Bank transaction",
      amountMinor,
      type,
      category:
        suggestTransactionCategory(
          combinedText,
          type,
          categoryRules
        ).category,
      date,
    });
  }

  return {
    bank,
    transactions,
    skippedRows,
    errors,
  };
}

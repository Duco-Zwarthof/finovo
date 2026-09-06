import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  type TransactionCategory,
  type TransactionType,
} from "./types";
import type {
  TransactionCategoryRule,
} from "./transaction-categorization";
import {
  upsertTransactionCategoryRule,
} from "./transaction-categorization";

const STORAGE_KEY =
  "finovo-transaction-category-rules";

function isCategory(
  value: unknown
): value is TransactionCategory {
  return (
    typeof value ===
      "string" &&
    TRANSACTION_CATEGORIES.some(
      (category) =>
        category === value
    )
  );
}

function isType(
  value: unknown
): value is TransactionType | "all" {
  return (
    value === "all" ||
    (
      typeof value ===
        "string" &&
      TRANSACTION_TYPES.some(
        (type) => type === value
      )
    )
  );
}

function isRule(
  value: unknown
): value is TransactionCategoryRule {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const rule =
    value as Partial<TransactionCategoryRule>;

  return (
    typeof rule.id ===
      "string" &&
    rule.id.length > 0 &&
    typeof rule.matchText ===
      "string" &&
    rule.matchText.length > 0 &&
    isCategory(
      rule.category
    ) &&
    isType(rule.type)
  );
}

export function readTransactionCategoryRules() {
  if (
    typeof window ===
    "undefined"
  ) {
    return [] as TransactionCategoryRule[];
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    return parsed.filter(
      isRule
    );
  } catch {
    return [];
  }
}

export function writeTransactionCategoryRules(
  rules: readonly TransactionCategoryRule[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(rules)
    );

    return true;
  } catch {
    return false;
  }
}

export function saveTransactionCategoryRule(
  rule: TransactionCategoryRule
) {
  const current =
    readTransactionCategoryRules();

  const next =
    upsertTransactionCategoryRule(
      current,
      rule
    );

  return writeTransactionCategoryRules(
    next
  );
}

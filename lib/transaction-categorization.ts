import type {
  TransactionCategory,
  TransactionType,
} from "./types";

export type TransactionCategoryRule = {
  id: string;
  matchText: string;
  category: TransactionCategory;
  type: TransactionType | "all";
};

export type TransactionCategorySuggestion = {
  category: TransactionCategory;
  source: "learned" | "built-in" | "fallback";
  matchedText: string | null;
};

type BuiltInRule = {
  match: readonly string[];
  category: TransactionCategory;
  type?: TransactionType;
};

const BUILT_IN_RULES: readonly BuiltInRule[] = [
  {
    match: [
      "salaris",
      "salary",
      "loon",
      "payroll",
    ],
    category: "Salary",
    type: "income",
  },
  {
    match: [
      "albert heijn",
      "ah to go",
      "jumbo",
      "lidl",
      "aldi",
      "picnic",
      "plus supermarkt",
      "coop",
      "spar",
      "dirk",
      "poiesz",
    ],
    category: "Groceries",
  },
  {
    match: [
      "ns reizigers",
      "ns groep",
      "ns.nl",
      "ovpay",
      "arriva",
      "qbuzz",
      "connexxion",
      "gvb",
      "ret",
      "uber",
      "bolt",
      "taxi",
      "shell",
      "esso",
      "tango",
      "circle k",
    ],
    category: "Transport",
  },
  {
    match: [
      "huur",
      "rent",
      "hypotheek",
      "mortgage",
      "eneco",
      "vattenfall",
      "essent",
    ],
    category: "Housing",
  },
  {
    match: [
      "spotify",
      "netflix",
      "videoland",
      "disney plus",
      "disney+",
      "hbo max",
      "youtube premium",
      "ziggo",
      "odido",
      "kpn",
    ],
    category: "Subscriptions",
  },
  {
    match: [
      "pathe",
      "pathé",
      "kinepolis",
      "ticketmaster",
      "steam",
      "playstation",
      "xbox",
    ],
    category: "Entertainment",
  },
  {
    match: [
      "degiro",
      "de giro",
      "trade republic",
      "interactive brokers",
      "ibkr",
      "beleggen",
      "investment",
    ],
    category: "Investments",
  },
];

export function normalizeTransactionMatchText(
  value: string
) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function matchesRule(
  normalizedText: string,
  matchText: string
) {
  const normalizedMatch =
    normalizeTransactionMatchText(
      matchText
    );

  return (
    normalizedMatch.length >= 2 &&
    normalizedText.includes(
      normalizedMatch
    )
  );
}

export function suggestTransactionCategory(
  text: string,
  type: TransactionType,
  learnedRules: readonly TransactionCategoryRule[] = []
): TransactionCategorySuggestion {
  const normalizedText =
    normalizeTransactionMatchText(
      text
    );

  for (const rule of learnedRules) {
    if (
      rule.type !== "all" &&
      rule.type !== type
    ) {
      continue;
    }

    if (
      matchesRule(
        normalizedText,
        rule.matchText
      )
    ) {
      return {
        category: rule.category,
        source: "learned",
        matchedText:
          rule.matchText,
      };
    }
  }

  for (const rule of BUILT_IN_RULES) {
    if (
      rule.type &&
      rule.type !== type
    ) {
      continue;
    }

    const matchedText =
      rule.match.find(
        (candidate) =>
          matchesRule(
            normalizedText,
            candidate
          )
      );

    if (matchedText) {
      return {
        category:
          rule.category,
        source:
          "built-in",
        matchedText,
      };
    }
  }

  return {
    category: "Other",
    source: "fallback",
    matchedText: null,
  };
}

export function createLearnedCategoryRule(
  title: string,
  category: TransactionCategory,
  type: TransactionType
): TransactionCategoryRule | null {
  const normalized =
    normalizeTransactionMatchText(
      title
    );

  if (
    normalized.length < 3
  ) {
    return null;
  }

  const words =
    normalized
      .split(" ")
      .filter(
        (word) =>
          word.length >= 2
      );

  const matchText =
    words.slice(0, 4).join(
      " "
    );

  if (
    matchText.length < 3
  ) {
    return null;
  }

  return {
    id: `${type}:${matchText}`,
    matchText,
    category,
    type,
  };
}

export function upsertTransactionCategoryRule(
  rules: readonly TransactionCategoryRule[],
  nextRule: TransactionCategoryRule
) {
  return [
    nextRule,
    ...rules.filter(
      (rule) =>
        rule.id !==
        nextRule.id
    ),
  ];
}

"use client";

import { useMemo, useState } from "react";

import {
  ArrowDownUp,
  Banknote,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clapperboard,
  CreditCard,
  FilterX,
  House,
  Pencil,
  PiggyBank,
  ReceiptText,
  Search,
  ShoppingBasket,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import type {
  Transaction,
  TransactionCategory,
} from "@/lib/types";

import { formatCurrency } from "@/lib/finance";

type RecentTransactionsProps = {
  transactions: Transaction[];
  onEditTransaction: (
    transaction: Transaction
  ) => void;
  onDeleteTransaction: (id: string) => void;
};

type TransactionType = "income" | "expense";

type SortOption =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest"
  | "title-az"
  | "title-za";

type MonthOption = {
  value: string;
  label: string;
};

const transactionCategories: TransactionCategory[] = [
  "Salary",
  "Housing",
  "Groceries",
  "Transport",
  "Entertainment",
  "Subscriptions",
  "Investments",
  "Other",
];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

function parseTransactionDate(date: string) {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function formatTransactionDate(date: string) {
  const transactionDate =
    parseTransactionDate(date);

  if (Number.isNaN(transactionDate.getTime())) {
    return date;
  }

  return dateFormatter.format(transactionDate);
}

function formatMonthValue(monthValue: string) {
  const [year, month] = monthValue
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    month < 1 ||
    month > 12
  ) {
    return monthValue;
  }

  return monthFormatter.format(
    new Date(year, month - 1, 1)
  );
}

function createMonthOptions(
  transactions: Transaction[]
): MonthOption[] {
  const uniqueMonths = Array.from(
    new Set(
      transactions
        .map((transaction) =>
          transaction.date.slice(0, 7)
        )
        .filter((monthValue) =>
          /^\d{4}-(0[1-9]|1[0-2])$/.test(
            monthValue
          )
        )
    )
  ).sort((firstMonth, secondMonth) =>
    secondMonth.localeCompare(firstMonth)
  );

  return uniqueMonths.map((monthValue) => ({
    value: monthValue,
    label: formatMonthValue(monthValue),
  }));
}

function getCategoryIcon(
  category: TransactionCategory
) {
  switch (category) {
    case "Salary":
      return Banknote;

    case "Housing":
      return House;

    case "Groceries":
      return ShoppingBasket;

    case "Transport":
      return Car;

    case "Entertainment":
      return Clapperboard;

    case "Subscriptions":
      return CreditCard;

    case "Investments":
      return TrendingUp;

    case "Other":
      return ReceiptText;

    default:
      return CircleDollarSign;
  }
}

function getCategoryStyle(
  category: TransactionCategory
) {
  switch (category) {
    case "Salary":
      return "bg-green-500/10 text-green-400";

    case "Housing":
      return "bg-violet-500/10 text-violet-400";

    case "Groceries":
      return "bg-orange-500/10 text-orange-400";

    case "Transport":
      return "bg-cyan-500/10 text-cyan-400";

    case "Entertainment":
      return "bg-pink-500/10 text-pink-400";

    case "Subscriptions":
      return "bg-blue-500/10 text-blue-400";

    case "Investments":
      return "bg-emerald-500/10 text-emerald-400";

    default:
      return "bg-zinc-800 text-zinc-400";
  }
}

export default function RecentTransactions({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}: RecentTransactionsProps) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedMonths, setSelectedMonths] =
    useState<string[]>([]);

  const [
    selectedCategories,
    setSelectedCategories,
  ] = useState<TransactionCategory[]>([]);

  const [selectedTypes, setSelectedTypes] =
    useState<TransactionType[]>([]);

  const [minimumAmount, setMinimumAmount] =
    useState("");

  const [maximumAmount, setMaximumAmount] =
    useState("");

  const [sortOption, setSortOption] =
    useState<SortOption>("newest");

  const [isMonthMenuOpen, setIsMonthMenuOpen] =
    useState(false);

  const [
    isCategoryMenuOpen,
    setIsCategoryMenuOpen,
  ] = useState(false);

  const [isTypeMenuOpen, setIsTypeMenuOpen] =
    useState(false);

  const monthOptions = useMemo(
    () => createMonthOptions(transactions),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    const parsedMinimum =
      minimumAmount.trim() === ""
        ? null
        : Number(minimumAmount);

    const parsedMaximum =
      maximumAmount.trim() === ""
        ? null
        : Number(maximumAmount);

    const filtered = transactions.filter(
      (transaction) => {
        const transactionMonth =
          transaction.date.slice(0, 7);

        const matchesSearch =
          normalizedSearch === "" ||
          transaction.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          transaction.category
            .toLowerCase()
            .includes(normalizedSearch) ||
          transaction.type
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesMonth =
          selectedMonths.length === 0 ||
          selectedMonths.includes(
            transactionMonth
          );

        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(
            transaction.category
          );

        const matchesType =
          selectedTypes.length === 0 ||
          selectedTypes.includes(
            transaction.type as TransactionType
          );

        const matchesMinimum =
          parsedMinimum === null ||
          Number.isNaN(parsedMinimum) ||
          transaction.amount >= parsedMinimum;

        const matchesMaximum =
          parsedMaximum === null ||
          Number.isNaN(parsedMaximum) ||
          transaction.amount <= parsedMaximum;

        return (
          matchesSearch &&
          matchesMonth &&
          matchesCategory &&
          matchesType &&
          matchesMinimum &&
          matchesMaximum
        );
      }
    );

    return [...filtered].sort(
      (firstTransaction, secondTransaction) => {
        switch (sortOption) {
          case "oldest":
            return firstTransaction.date.localeCompare(
              secondTransaction.date
            );

          case "highest":
            return (
              secondTransaction.amount -
              firstTransaction.amount
            );

          case "lowest":
            return (
              firstTransaction.amount -
              secondTransaction.amount
            );

          case "title-az":
            return firstTransaction.title.localeCompare(
              secondTransaction.title
            );

          case "title-za":
            return secondTransaction.title.localeCompare(
              firstTransaction.title
            );

          case "newest":
          default:
            return secondTransaction.date.localeCompare(
              firstTransaction.date
            );
        }
      }
    );
  }, [
    transactions,
    searchQuery,
    selectedMonths,
    selectedCategories,
    selectedTypes,
    minimumAmount,
    maximumAmount,
    sortOption,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedMonths.length > 0 ||
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    minimumAmount.trim() !== "" ||
    maximumAmount.trim() !== "";

  function toggleMonth(month: string) {
    setSelectedMonths((currentMonths) =>
      currentMonths.includes(month)
        ? currentMonths.filter(
            (currentMonth) =>
              currentMonth !== month
          )
        : [...currentMonths, month]
    );
  }

  function toggleCategory(
    category: TransactionCategory
  ) {
    setSelectedCategories(
      (currentCategories) =>
        currentCategories.includes(category)
          ? currentCategories.filter(
              (currentCategory) =>
                currentCategory !== category
            )
          : [...currentCategories, category]
    );
  }

  function toggleType(type: TransactionType) {
    setSelectedTypes((currentTypes) =>
      currentTypes.includes(type)
        ? currentTypes.filter(
            (currentType) =>
              currentType !== type
          )
        : [...currentTypes, type]
    );
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedMonths([]);
    setSelectedCategories([]);
    setSelectedTypes([]);
    setMinimumAmount("");
    setMaximumAmount("");
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div className="shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Recent transactions
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Search, filter and sort your
              financial activity.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <PiggyBank
              size={14}
              className="text-blue-400"
            />

            <span className="text-xs font-medium text-zinc-400">
              {filteredTransactions.length}{" "}
              {filteredTransactions.length === 1
                ? "transaction"
                : "transactions"}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <label className="relative block">
            <span className="sr-only">
              Search transactions
            </span>

            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search transactions..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-blue-500/50"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsMonthMenuOpen(
                    (currentValue) =>
                      !currentValue
                  );
                  setIsCategoryMenuOpen(false);
                  setIsTypeMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300 transition hover:border-white/20"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CalendarDays
                    size={16}
                    className="shrink-0 text-zinc-500"
                  />

                  <span className="truncate">
                    {selectedMonths.length === 0
                      ? "All months"
                      : `${selectedMonths.length} month${
                          selectedMonths.length === 1
                            ? ""
                            : "s"
                        }`}
                  </span>
                </span>

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-zinc-500 transition ${
                    isMonthMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {isMonthMenuOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-2xl">
                  {monthOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-zinc-500">
                      No months available
                    </p>
                  ) : (
                    monthOptions.map((month) => {
                      const isSelected =
                        selectedMonths.includes(
                          month.value
                        );

                      return (
                        <button
                          key={month.value}
                          type="button"
                          onClick={() =>
                            toggleMonth(month.value)
                          }
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05]"
                        >
                          <span>{month.label}</span>

                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              isSelected
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-white/15 text-transparent"
                            }`}
                          >
                            <Check size={13} />
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryMenuOpen(
                    (currentValue) =>
                      !currentValue
                  );
                  setIsMonthMenuOpen(false);
                  setIsTypeMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300 transition hover:border-white/20"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <ReceiptText
                    size={16}
                    className="shrink-0 text-zinc-500"
                  />

                  <span className="truncate">
                    {selectedCategories.length ===
                    0
                      ? "All categories"
                      : `${
                          selectedCategories.length
                        } categor${
                          selectedCategories.length ===
                          1
                            ? "y"
                            : "ies"
                        }`}
                  </span>
                </span>

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-zinc-500 transition ${
                    isCategoryMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-2xl">
                  {transactionCategories.map(
                    (category) => {
                      const CategoryIcon =
                        getCategoryIcon(category);

                      const isSelected =
                        selectedCategories.includes(
                          category
                        );

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() =>
                            toggleCategory(category)
                          }
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05]"
                        >
                          <span className="flex items-center gap-2">
                            <CategoryIcon
                              size={15}
                              className="text-zinc-500"
                            />

                            {category}
                          </span>

                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              isSelected
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-white/15 text-transparent"
                            }`}
                          >
                            <Check size={13} />
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsTypeMenuOpen(
                    (currentValue) =>
                      !currentValue
                  );
                  setIsMonthMenuOpen(false);
                  setIsCategoryMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300 transition hover:border-white/20"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CircleDollarSign
                    size={16}
                    className="shrink-0 text-zinc-500"
                  />

                  <span className="truncate">
                    {selectedTypes.length === 0
                      ? "Income & expenses"
                      : selectedTypes
                          .map(
                            (type) =>
                              type
                                .charAt(0)
                                .toUpperCase() +
                              type.slice(1)
                          )
                          .join(", ")}
                  </span>
                </span>

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-zinc-500 transition ${
                    isTypeMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {isTypeMenuOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-2xl">
                  {(
                    [
                      "income",
                      "expense",
                    ] as TransactionType[]
                  ).map((type) => {
                    const isSelected =
                      selectedTypes.includes(type);

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          toggleType(type)
                        }
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05]"
                      >
                        <span className="capitalize">
                          {type}
                        </span>

                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            isSelected
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-white/15 text-transparent"
                          }`}
                        >
                          <Check size={13} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <label className="relative block">
              <span className="sr-only">
                Sort transactions
              </span>

              <ArrowDownUp
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(
                    event.target
                      .value as SortOption
                  )
                }
                className="w-full appearance-none rounded-xl border border-white/10 bg-zinc-800 py-2.5 pl-10 pr-9 text-sm text-zinc-300 outline-none transition hover:border-white/20 focus:border-blue-500/50"
              >
                <option value="newest">
                  Newest first
                </option>
                <option value="oldest">
                  Oldest first
                </option>
                <option value="highest">
                  Highest amount
                </option>
                <option value="lowest">
                  Lowest amount
                </option>
                <option value="title-az">
                  Title A–Z
                </option>
                <option value="title-za">
                  Title Z–A
                </option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                Minimum amount
              </span>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 focus-within:border-blue-500/50">
                <span className="text-sm text-zinc-500">
                  €
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minimumAmount}
                  onChange={(event) =>
                    setMinimumAmount(
                      event.target.value
                    )
                  }
                  placeholder="0"
                  className="w-full bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                Maximum amount
              </span>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 focus-within:border-blue-500/50">
                <span className="text-sm text-zinc-500">
                  €
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maximumAmount}
                  onChange={(event) =>
                    setMaximumAmount(
                      event.target.value
                    )
                  }
                  placeholder="No maximum"
                  className="w-full bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>
            </label>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500">
                Active filters:
              </span>

              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
                >
                  Search: {searchQuery}
                  <X size={12} />
                </button>
              )}

              {selectedMonths.map((month) => (
                <button
                  key={month}
                  type="button"
                  onClick={() =>
                    toggleMonth(month)
                  }
                  className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400 transition hover:bg-blue-500/15"
                >
                  {formatMonthValue(month)}
                  <X size={12} />
                </button>
              ))}

              {selectedCategories.map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      toggleCategory(category)
                    }
                    className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
                  >
                    {category}
                    <X size={12} />
                  </button>
                )
              )}

              {selectedTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    toggleType(type)
                  }
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs capitalize text-zinc-300 transition hover:bg-white/[0.08]"
                >
                  {type}
                  <X size={12} />
                </button>
              ))}

              {minimumAmount && (
                <button
                  type="button"
                  onClick={() =>
                    setMinimumAmount("")
                  }
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
                >
                  Min €{minimumAmount}
                  <X size={12} />
                </button>
              )}

              {maximumAmount && (
                <button
                  type="button"
                  onClick={() =>
                    setMaximumAmount("")
                  }
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
                >
                  Max €{maximumAmount}
                  <X size={12} />
                </button>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
              >
                <FilterX size={13} />
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6 flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <ReceiptText size={22} />
          </div>

          <p className="mt-4 font-semibold text-white">
            No transactions yet
          </p>

          <p className="mt-1 max-w-xs text-sm leading-6 text-zinc-500">
            Add your first transaction to start
            tracking your financial activity.
          </p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="mt-6 flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <FilterX size={22} />
          </div>

          <p className="mt-4 font-semibold text-white">
            No matching transactions
          </p>

          <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-500">
            No transactions match the filters
            you selected.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-6 min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="h-full overflow-y-auto overscroll-contain [scrollbar-color:rgb(63_63_70)_transparent] [scrollbar-width:thin]">
            {filteredTransactions.map(
              (transaction, index) => {
                const CategoryIcon =
                  getCategoryIcon(
                    transaction.category
                  );

                return (
                  <div
                    key={transaction.id}
                    className={`group flex items-center gap-4 px-4 py-4 transition hover:bg-white/[0.03] ${
                      index !==
                      filteredTransactions.length -
                        1
                        ? "border-b border-white/[0.06]"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${getCategoryStyle(
                        transaction.category
                      )}`}
                    >
                      <CategoryIcon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-white">
                          {transaction.title}
                        </p>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            transaction.type ===
                            "income"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                        <span>
                          {transaction.category}
                        </span>

                        <span className="text-zinc-700">
                          •
                        </span>

                        <span>
                          {formatTransactionDate(
                            transaction.date
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <p
                        className={`min-w-28 text-right text-base font-bold ${
                          transaction.type ===
                          "income"
                            ? "text-green-400"
                            : "text-white"
                        }`}
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}
                        {formatCurrency(
                          transaction.amount
                        )}
                      </p>

                      <div className="flex items-center gap-2 opacity-70 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() =>
                            onEditTransaction(
                              transaction
                            )
                          }
                          aria-label={`Edit ${transaction.title}`}
                          className="rounded-xl border border-white/10 p-2.5 text-zinc-400 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onDeleteTransaction(
                              transaction.id
                            )
                          }
                          aria-label={`Delete ${transaction.title}`}
                          className="rounded-xl border border-red-500/20 bg-red-500/5 p-2.5 text-red-400 transition hover:bg-red-500/15"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </section>
  );
}
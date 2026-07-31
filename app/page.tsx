"use client";

import { useMemo, useRef, useState } from "react";

import {
  Responsive,
  useContainerWidth,
  type Layout,
} from "react-grid-layout";

import { verticalCompactor } from "react-grid-layout/core";

import {
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  RotateCcw,
  SlidersHorizontal,
  Unlock,
  X,
} from "lucide-react";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import type { Transaction } from "@/lib/types";

import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import CashflowChart from "@/components/dashboard/CashflowChart";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import {
  calculateMonthlyFinancialSummary,
} from "@/lib/finance";
import { formatCurrency } from "@/lib/money";
import { minorUnitsToEuroAmount } from "@/lib/transaction-amount";
import {
  STORAGE_KEYS,
  mergeDashboardLayoutsPreservingHidden,
  readStoredDashboardLayouts,
  readStoredTransactions,
  readStoredWidgetSettings,
  removeStoredValue,
  writeStoredDashboardLayouts,
  writeStoredTransactions,
  writeStoredWidgetSettings,
  type DashboardBreakpoint,
  type DashboardLayouts,
  type StorageReadStatus,
  type StorageWriteResult,
  type WidgetId,
  type WidgetSettings,
} from "@/lib/storage";
import {
  addTransactionToData,
  canPersistTransactionMutation,
  createTransactionDataState,
  deleteTransactionFromData,
  getDashboardWidgetDataSource,
  getDisplayedTransactions,
  updateTransactionInData,
} from "@/lib/transaction-data";

type WidgetSize = {
  width: number;
  height: number;
};

type StorageArea = keyof typeof STORAGE_KEYS;

type StorageHealth =
  | StorageReadStatus
  | "write-failed";

type StorageHealthState = Record<
  StorageArea,
  StorageHealth
>;

const defaultWidgetSettings: WidgetSettings = {
  netWorth: true,
  monthlyIncome: true,
  monthlyExpenses: true,
  monthlySavings: true,
  cashflow: true,
  savingsGoal: true,
  recentTransactions: true,
};

const widgetOptions: {
  key: WidgetId;
  title: string;
  description: string;
}[] = [
  {
    key: "netWorth",
    title: "Net worth",
    description:
      "Sample data — not calculated from your transactions.",
  },
  {
    key: "monthlyIncome",
    title: "Monthly income",
    description: "Income received during the month.",
  },
  {
    key: "monthlyExpenses",
    title: "Monthly expenses",
    description: "Expenses recorded during the month.",
  },
  {
    key: "monthlySavings",
    title: "Monthly surplus",
    description: "Your income minus your expenses.",
  },
  {
    key: "cashflow",
    title: "Cash flow chart",
    description: "Income and expenses over six months.",
  },
  {
    key: "savingsGoal",
    title: "Savings goal",
    description:
      "Sample goal — no saved goal data is connected.",
  },
  {
    key: "recentTransactions",
    title: "Recent transactions",
    description: "Your latest financial activity.",
  },
];

const defaultLayouts: DashboardLayouts = {
  lg: [
    {
      i: "netWorth",
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "monthlyIncome",
      x: 3,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "monthlyExpenses",
      x: 6,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "monthlySavings",
      x: 9,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "cashflow",
      x: 0,
      y: 2,
      w: 8,
      h: 5,
      minW: 5,
      minH: 4,
    },
    {
      i: "savingsGoal",
      x: 8,
      y: 2,
      w: 4,
      h: 5,
      minW: 3,
      minH: 3,
    },
    {
      i: "recentTransactions",
      x: 0,
      y: 7,
      w: 12,
      h: 6,
      minW: 6,
      minH: 4,
    },
  ],

  md: [
    {
      i: "netWorth",
      x: 0,
      y: 0,
      w: 5,
      h: 2,
      minW: 3,
      minH: 2,
    },
    {
      i: "monthlyIncome",
      x: 5,
      y: 0,
      w: 5,
      h: 2,
      minW: 3,
      minH: 2,
    },
    {
      i: "monthlyExpenses",
      x: 0,
      y: 2,
      w: 5,
      h: 2,
      minW: 3,
      minH: 2,
    },
    {
      i: "monthlySavings",
      x: 5,
      y: 2,
      w: 5,
      h: 2,
      minW: 3,
      minH: 2,
    },
    {
      i: "cashflow",
      x: 0,
      y: 4,
      w: 10,
      h: 5,
      minW: 6,
      minH: 4,
    },
    {
      i: "savingsGoal",
      x: 0,
      y: 9,
      w: 10,
      h: 4,
      minW: 5,
      minH: 3,
    },
    {
      i: "recentTransactions",
      x: 0,
      y: 13,
      w: 10,
      h: 6,
      minW: 6,
      minH: 4,
    },
  ],

  sm: [
    {
      i: "netWorth",
      x: 0,
      y: 0,
      w: 6,
      h: 2,
      minW: 3,
      minH: 2,
    },
    {
      i: "monthlyIncome",
      x: 0,
      y: 2,
      w: 6,
      h: 2,
      minW: 3,
      minH: 2,
    },
    {
      i: "monthlyExpenses",
      x: 0,
      y: 4,
      w: 6,
      h: 2,
      minW: 3,
      minH: 2,
    },
    {
      i: "monthlySavings",
      x: 0,
      y: 6,
      w: 6,
      h: 2,
      minW: 3,
      minH: 2,
    },
    {
      i: "cashflow",
      x: 0,
      y: 8,
      w: 6,
      h: 5,
      minW: 4,
      minH: 4,
    },
    {
      i: "savingsGoal",
      x: 0,
      y: 13,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
    },
    {
      i: "recentTransactions",
      x: 0,
      y: 17,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
    },
  ],

  xs: [
    {
      i: "netWorth",
      x: 0,
      y: 0,
      w: 4,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "monthlyIncome",
      x: 0,
      y: 2,
      w: 4,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "monthlyExpenses",
      x: 0,
      y: 4,
      w: 4,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "monthlySavings",
      x: 0,
      y: 6,
      w: 4,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "cashflow",
      x: 0,
      y: 8,
      w: 4,
      h: 5,
      minW: 3,
      minH: 4,
    },
    {
      i: "savingsGoal",
      x: 0,
      y: 13,
      w: 4,
      h: 4,
      minW: 2,
      minH: 3,
    },
    {
      i: "recentTransactions",
      x: 0,
      y: 17,
      w: 4,
      h: 6,
      minW: 3,
      minH: 4,
    },
  ],
};

function isWidgetId(value: string): value is WidgetId {
  return widgetOptions.some((widget) => widget.key === value);
}

function getWidgetTitle(widgetId: WidgetId) {
  return (
    widgetOptions.find((widget) => widget.key === widgetId)
      ?.title ?? widgetId
  );
}

function formatSurplusRate(rate: number | null) {
  if (rate === null) {
    return "Not available";
  }

  const roundedRate = Math.round(rate * 10) / 10;

  if (roundedRate === 0 && rate < 0) {
    return "Below 0%";
  }

  return `${roundedRate}%`;
}

function getStorageNotice(
  storageHealth: StorageHealthState
) {
  const statuses = Object.values(storageHealth);

  if (
    statuses.includes("unavailable") ||
    statuses.includes("write-failed")
  ) {
    return "Changes could not be saved in this browser. They may be lost when you reload the page.";
  }

  if (statuses.includes("invalid")) {
    return "Some saved dashboard data was invalid, so safe defaults are shown instead.";
  }

  if (statuses.includes("recovered")) {
    return "Some invalid saved data was ignored. Valid transactions and dashboard preferences were preserved.";
  }

  return null;
}

function filterLayout(
  layout: Layout | undefined,
  widgetSettings: WidgetSettings
): Layout {
  if (!layout) {
    return [];
  }

  return layout.filter((item) => {
    if (!isWidgetId(item.i)) {
      return false;
    }

    return widgetSettings[item.i];
  });
}

function ExpandedStatCard({
  title,
  value,
  description,
  size,
  secondaryLabel,
  secondaryValue,
  insight,
}: {
  title: string;
  value: string;
  description: string;
  size: WidgetSize;
  secondaryLabel: string;
  secondaryValue: string;
  insight: string;
}) {
  const isWide = size.width >= 5;
  const isTall = size.height >= 3;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 p-5 shadow-lg shadow-black/10">
      <div>
        <p className="text-sm font-medium text-zinc-400">
          {title}
        </p>

        <p className="mt-3 text-3xl font-bold tracking-tight text-white">
          {value}
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      {(isWide || isTall) && (
        <div className="mt-auto pt-5">
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
              {secondaryLabel}
            </p>

            <p className="mt-2 text-lg font-semibold text-zinc-200">
              {secondaryValue}
            </p>

            {isTall && (
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {insight}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [initialTransactions] = useState(() =>
    readStoredTransactions([])
  );

  const [transactionData, setTransactionData] =
    useState(() =>
      createTransactionDataState(
        initialTransactions
      )
    );

  const transactions = getDisplayedTransactions(
    transactionData
  );

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [initialWidgetSettings] = useState(() =>
    readStoredWidgetSettings(defaultWidgetSettings)
  );

  const [widgetSettings, setWidgetSettings] =
    useState<WidgetSettings>(
      initialWidgetSettings.value
    );

  const [initialLayouts] = useState(() =>
    readStoredDashboardLayouts(defaultLayouts)
  );

  const [layouts, setLayouts] =
    useState<DashboardLayouts>(initialLayouts.value);

  const layoutsRef = useRef(layouts);

  const [storageHealth, setStorageHealth] =
    useState<StorageHealthState>(() => ({
      transactions: initialTransactions.status,
      widgetSettings: initialWidgetSettings.status,
      layouts: initialLayouts.status,
    }));

  const [widgetSizes, setWidgetSizes] = useState<
    Record<string, WidgetSize>
  >({});

  const [showCustomizePanel, setShowCustomizePanel] =
    useState(false);

  const [isEditMode, setIsEditMode] =
    useState(false);

  const { width, containerRef, mounted } =
    useContainerWidth({
      measureBeforeMount: true,
    });

  const {
    incomeMinor: monthlyIncomeMinor,
    expensesMinor: monthlyExpensesMinor,
    surplusMinor: monthlySurplusMinor,
    surplusRate,
  } = calculateMonthlyFinancialSummary(
    transactions,
    new Date()
  );
  const monthlyIncome =
    minorUnitsToEuroAmount(monthlyIncomeMinor) ?? 0;
  const monthlyExpenses =
    minorUnitsToEuroAmount(monthlyExpensesMinor) ?? 0;
  const monthlySurplus =
    minorUnitsToEuroAmount(monthlySurplusMinor) ?? 0;

  const storageNotice = getStorageNotice(storageHealth);

  const visibleWidgetIds = useMemo(
    () =>
      widgetOptions
        .map((widget) => widget.key)
        .filter(
          (widgetId) =>
            widgetSettings[widgetId]
        ),
    [widgetSettings]
  );

  const visibleLayouts =
    useMemo<DashboardLayouts>(() => {
      return {
        lg: filterLayout(
          layouts.lg,
          widgetSettings
        ),
        md: filterLayout(
          layouts.md,
          widgetSettings
        ),
        sm: filterLayout(
          layouts.sm,
          widgetSettings
        ),
        xs: filterLayout(
          layouts.xs,
          widgetSettings
        ),
      };
    }, [layouts, widgetSettings]);

  function handleAddTransaction(
    transaction: Transaction
  ) {
    const nextTransactionData =
      addTransactionToData(
        transactionData,
        transaction
      );

    setTransactionData(nextTransactionData);
    persistTransactionMutation(nextTransactionData);
  }

  function handleEditTransaction(
    transaction: Transaction
  ) {
    setEditingTransaction(transaction);
  }

  function handleSaveEditedTransaction(
    updatedTransaction: Transaction
  ) {
    const savedTransaction =
      transactionData.source === "demo"
        ? {
            ...updatedTransaction,
            id: crypto.randomUUID(),
          }
        : updatedTransaction;

    const nextTransactionData =
      updateTransactionInData(
        transactionData,
        savedTransaction
      );

    setTransactionData(nextTransactionData);
    persistTransactionMutation(nextTransactionData);

    setEditingTransaction(null);
  }

  function handleDeleteTransaction(id: string) {
    const nextTransactionData =
      deleteTransactionFromData(
        transactionData,
        id
      );

    setTransactionData(nextTransactionData);
    persistTransactionMutation(nextTransactionData);
  }

  function persistTransactionMutation(
    nextTransactionData: Extract<
      typeof transactionData,
      { source: "user" }
    >
  ) {
    if (
      !canPersistTransactionMutation(
        initialTransactions.status
      )
    ) {
      return;
    }

    recordStorageResult(
      "transactions",
      writeStoredTransactions(
        nextTransactionData.transactions
      )
    );
  }

  function toggleWidget(widgetId: WidgetId) {
    const nextWidgetSettings = {
      ...widgetSettings,
      [widgetId]: !widgetSettings[widgetId],
    };

    setWidgetSettings(nextWidgetSettings);
    recordStorageResult(
      "widgetSettings",
      writeStoredWidgetSettings(nextWidgetSettings)
    );
  }

  function resetDashboard() {
    setWidgetSettings(defaultWidgetSettings);
    setLayouts(defaultLayouts);
    layoutsRef.current = defaultLayouts;
    setWidgetSizes({});

    recordStorageResult(
      "widgetSettings",
      writeStoredWidgetSettings(
        defaultWidgetSettings
      )
    );
    recordStorageResult(
      "layouts",
      removeStoredValue(STORAGE_KEYS.layouts)
    );
  }

  function handleLayoutChange(
    currentLayout: Layout,
    allLayouts: DashboardLayouts
  ) {
    const nextLayouts =
      mergeDashboardLayoutsPreservingHidden(
        layoutsRef.current,
        allLayouts
      );

    layoutsRef.current = nextLayouts;
    setLayouts(nextLayouts);

    if (isEditMode) {
      recordStorageResult(
        "layouts",
        writeStoredDashboardLayouts(nextLayouts)
      );
    }

    setWidgetSizes((currentSizes) => {
      const nextSizes = {
        ...currentSizes,
      };

      currentLayout.forEach((item) => {
        nextSizes[item.i] = {
          width: item.w,
          height: item.h,
        };
      });

      return nextSizes;
    });
  }

  function recordStorageResult(
    area: StorageArea,
    result: StorageWriteResult
  ) {
    const status: StorageHealth =
      result.status === "written"
        ? "valid"
        : result.status === "removed"
          ? "missing"
          : result.status === "unavailable"
            ? "unavailable"
            : "write-failed";

    setStorageHealth((current) => ({
      ...current,
      [area]: status,
    }));
  }

  function getWidgetSize(
    widgetId: WidgetId
  ): WidgetSize {
    return (
      widgetSizes[widgetId] ?? {
        width: 3,
        height: 2,
      }
    );
  }

  function renderWidget(widgetId: WidgetId) {
    const size = getWidgetSize(widgetId);
    const dataSource = getDashboardWidgetDataSource(
      widgetId,
      transactionData
    );

    switch (widgetId) {
      case "netWorth":
        return (
          <ExpandedStatCard
            title="Net worth"
            value={formatCurrency(41_283)}
            description={
              dataSource === "sample"
                ? "Sample data — example only, not calculated from your transactions"
                : "Not available"
            }
            size={size}
            secondaryLabel="Sample assets"
            secondaryValue={formatCurrency(52_283)}
            insight={`This example assumes assets exceed liabilities by ${formatCurrency(41_283)}; Finovo does not track the balances needed to calculate your net worth yet.`}
          />
        );

      case "monthlyIncome":
        return (
          <ExpandedStatCard
            title="Monthly income"
            value={formatCurrency(
              monthlyIncome
            )}
            description="Income received this month"
            size={size}
            secondaryLabel="Average per week"
            secondaryValue={formatCurrency(
              monthlyIncome / 4.33
            )}
            insight="Your monthly income is calculated from income transactions dated in your current calendar month."
          />
        );

      case "monthlyExpenses":
        return (
          <ExpandedStatCard
            title="Monthly expenses"
            value={formatCurrency(
              monthlyExpenses
            )}
            description="Expenses recorded this month"
            size={size}
            secondaryLabel="Average per week"
            secondaryValue={formatCurrency(
              monthlyExpenses / 4.33
            )}
            insight="A larger version of this widget can later show your largest spending category and budget comparison."
          />
        );

      case "monthlySavings":
        return (
          <ExpandedStatCard
            title="Monthly surplus"
            value={formatCurrency(
              monthlySurplus
            )}
            description="Income minus expenses this month"
            size={size}
            secondaryLabel="Surplus rate"
            secondaryValue={formatSurplusRate(surplusRate)}
            insight={
              surplusRate === null
                ? "A surplus rate is unavailable when no income is recorded for the month."
                : surplusRate < 0
                  ? "Expenses are higher than income this month. Reviewing flexible spending may help restore a surplus."
                  : surplusRate >= 20
                    ? "Your current surplus rate is above a common 20% budgeting guideline; the right target depends on your circumstances."
                    : "A common guideline is 20%, but the right surplus rate depends on your circumstances."
            }
          />
        );

      case "cashflow":
        return (
          <DashboardPanel
            title="Monthly cash flow"
            description="Income and expenses over the last six months"
          >
            <div className="h-full min-h-0 w-full overflow-hidden">
              <CashflowChart
                transactions={transactions}
              />
            </div>
          </DashboardPanel>
        );

      case "savingsGoal":
        return (
          <DashboardPanel
            title="Savings goal"
            description={
              dataSource === "sample"
                ? "Sample data — example goal, not based on your transactions"
                : "Not available"
            }
          >
            <div className="flex h-full flex-col">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(11_000)}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    of {formatCurrency(30_000)} saved
                  </p>
                </div>

                <p className="text-sm font-semibold text-blue-500">
                  37%
                </p>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-[37%] rounded-full bg-blue-600" />
              </div>

              <div className="mt-auto pt-5">
                <p className="text-sm text-zinc-400">
                  {formatCurrency(19_000)} remaining
                </p>

                {size.height >= 5 && (
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    This example assumes a {formatCurrency(500)}
                    monthly contribution and would take
                    approximately another 38 months.
                  </p>
                )}
              </div>
            </div>
          </DashboardPanel>
        );

      case "recentTransactions":
        return (
          <div className="h-full overflow-hidden">
            <RecentTransactions
              transactions={transactions}
              isDemo={dataSource === "demo"}
              onEditTransaction={
                handleEditTransaction
              }
              onDeleteTransaction={
                handleDeleteTransaction
              }
            />
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        <Header
          onAddTransaction={
            handleAddTransaction
          }
        />

        <div className="-mt-4 mb-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              setIsEditMode(
                (current) => !current
              )
            }
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              isEditMode
                ? "border-blue-500/30 bg-blue-500/15 text-blue-300"
                : "border-white/10 bg-zinc-900 text-zinc-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {isEditMode ? (
              <Unlock size={17} />
            ) : (
              <Lock size={17} />
            )}

            {isEditMode
              ? "Finish editing"
              : "Edit layout"}
          </button>

          <button
            type="button"
            onClick={() =>
              setShowCustomizePanel(true)
            }
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
          >
            <SlidersHorizontal size={17} />
            Customize dashboard
          </button>
        </div>

        {mounted && transactionData.source === "demo" && (
          <aside
            aria-labelledby="demo-data-title"
            aria-describedby="demo-data-description"
            className="mb-6 rounded-2xl border border-blue-500/25 bg-blue-500/[0.08] px-4 py-3"
          >
            <p
              id="demo-data-title"
              className="text-sm font-semibold text-blue-200"
            >
              Demo data
            </p>

            <p
              id="demo-data-description"
              className="mt-1 text-sm leading-6 text-blue-100/80"
            >
              These financial values are examples and are
              not saved as your financial data. Adding,
              editing or deleting a sample switches to your
              own transaction data without copying the examples.
            </p>
          </aside>
        )}

        {isEditMode && (
          <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.07] px-4 py-3 text-sm text-blue-200">
            Drag widgets using the handle.
            Resize them from the bottom-right
            corner. Larger statistic cards
            automatically reveal more detail.
          </div>
        )}

        {mounted && storageNotice && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-100"
          >
            {storageNotice}
          </div>
        )}

        <div ref={containerRef}>
          {mounted &&
            (visibleWidgetIds.length === 0 ? (
              <section className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                <EyeOff
                  size={26}
                  className="text-zinc-500"
                />

                <h2 className="mt-5 text-xl font-bold">
                  Your dashboard is empty
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setShowCustomizePanel(true)
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Choose widgets
                </button>
              </section>
            ) : (
              <Responsive<DashboardBreakpoint>
                width={width}
                layouts={visibleLayouts}
                breakpoints={{
                  lg: 1200,
                  md: 996,
                  sm: 768,
                  xs: 0,
                }}
                cols={{
                  lg: 12,
                  md: 10,
                  sm: 6,
                  xs: 4,
                }}
                rowHeight={72}
                margin={[20, 20]}
                containerPadding={[0, 0]}
                dragConfig={{
                  enabled: isEditMode,
                  handle:
                    ".finovo-drag-handle",
                  bounded: false,
                  threshold: 3,
                }}
                resizeConfig={{
                  enabled: isEditMode,
                  handles: ["se"],
                }}
                compactor={verticalCompactor}
                onLayoutChange={
                  handleLayoutChange
                }
              >
                {visibleWidgetIds.map(
                  (widgetId) => (
                    <div
                      key={widgetId}
                      className={`group relative ${
                        isEditMode
                          ? "finovo-widget-editing"
                          : ""
                      }`}
                    >
                      {isEditMode && (
                        <button
                          type="button"
                          aria-label={`Move ${getWidgetTitle(widgetId)} widget`}
                          className="finovo-drag-handle absolute right-4 top-4 z-30 flex h-9 w-9 cursor-grab items-center justify-center rounded-xl border border-white/10 bg-zinc-950/90 text-zinc-400 shadow-lg backdrop-blur transition hover:text-white active:cursor-grabbing"
                        >
                          <GripVertical
                            size={17}
                          />
                        </button>
                      )}

                      {renderWidget(widgetId)}
                    </div>
                  )
                )}
              </Responsive>
            ))}
        </div>
      </section>

      {editingTransaction && (
        <AddTransactionModal
          transaction={editingTransaction}
          isDemoTransaction={
            transactionData.source === "demo"
          }
          onClose={() =>
            setEditingTransaction(null)
          }
          onSave={
            handleSaveEditedTransaction
          }
        />
      )}

      {showCustomizePanel && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          onMouseDown={() =>
            setShowCustomizePanel(false)
          }
        >
          <aside
            className="flex h-dvh w-full max-w-md flex-col border-l border-white/10 bg-zinc-950 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between border-b border-white/10 p-6">
              <div>
                <h2 className="text-xl font-bold">
                  Customize dashboard
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Choose which widgets appear on
                  your homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCustomizePanel(false)
                }
                aria-label="Close customization panel"
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {widgetOptions.map(
                  (widget) => {
                    const isVisible =
                      widgetSettings[
                        widget.key
                      ];

                    return (
                      <button
                        key={widget.key}
                        type="button"
                        onClick={() =>
                          toggleWidget(
                            widget.key
                          )
                        }
                        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                          isVisible
                            ? "border-blue-500/20 bg-blue-500/[0.07]"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isVisible
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-zinc-900 text-zinc-500"
                          }`}
                        >
                          {isVisible ? (
                            <Eye
                              size={18}
                            />
                          ) : (
                            <EyeOff
                              size={18}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">
                            {widget.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            {
                              widget.description
                            }
                          </p>
                        </div>

                        <div
                          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                            isVisible
                              ? "bg-blue-600"
                              : "bg-zinc-700"
                          }`}
                        >
                          <div
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                              isVisible
                                ? "left-6"
                                : "left-1"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="border-t border-white/10 p-6">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-zinc-500">
                  Visible widgets
                </span>

                <span className="font-semibold text-white">
                  {
                    visibleWidgetIds.length
                  }{" "}
                  of {widgetOptions.length}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetDashboard}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowCustomizePanel(
                      false
                    )
                  }
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Done
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

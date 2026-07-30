"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Responsive,
  useContainerWidth,
  type Layout,
  type ResponsiveLayouts,
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
  calculateExpenses,
  calculateIncome,
  calculateSavings,
  formatCurrency,
} from "@/lib/finance";

import { sampleTransactions } from "@/lib/sample-transactions";

type WidgetId =
  | "netWorth"
  | "monthlyIncome"
  | "monthlyExpenses"
  | "monthlySavings"
  | "cashflow"
  | "savingsGoal"
  | "recentTransactions";

type DashboardBreakpoint = "lg" | "md" | "sm" | "xs";

type DashboardLayouts = ResponsiveLayouts<DashboardBreakpoint>;

type WidgetSettings = Record<WidgetId, boolean>;

type WidgetSize = {
  width: number;
  height: number;
};

const STORAGE_KEYS = {
  transactions: "finovo-transactions",
  widgetSettings: "finovo-dashboard-widgets",
  layouts: "finovo-dashboard-layouts-v2",
};

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
    description: "Your total financial position.",
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
    title: "Monthly savings",
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
    description: "Progress towards your house deposit.",
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
  const [transactions, setTransactions] =
    useState<Transaction[]>(sampleTransactions);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [widgetSettings, setWidgetSettings] =
    useState<WidgetSettings>(defaultWidgetSettings);

  const [layouts, setLayouts] =
    useState<DashboardLayouts>(defaultLayouts);

  const [widgetSizes, setWidgetSizes] = useState<
    Record<string, WidgetSize>
  >({});

  const [showCustomizePanel, setShowCustomizePanel] =
    useState(false);

  const [isEditMode, setIsEditMode] =
    useState(false);

  const [hasLoaded, setHasLoaded] =
    useState(false);

  const { width, containerRef, mounted } =
    useContainerWidth();

  useEffect(() => {
    const savedTransactions = localStorage.getItem(
      STORAGE_KEYS.transactions
    );

    const savedWidgetSettings = localStorage.getItem(
      STORAGE_KEYS.widgetSettings
    );

    const savedLayouts = localStorage.getItem(
      STORAGE_KEYS.layouts
    );

    if (savedTransactions) {
      try {
        setTransactions(
          JSON.parse(savedTransactions) as Transaction[]
        );
      } catch (error) {
        console.error(
          "Could not load saved transactions:",
          error
        );
      }
    }

    if (savedWidgetSettings) {
      try {
        const parsedSettings = JSON.parse(
          savedWidgetSettings
        ) as Partial<WidgetSettings>;

        setWidgetSettings({
          ...defaultWidgetSettings,
          ...parsedSettings,
        });
      } catch (error) {
        console.error(
          "Could not load widget settings:",
          error
        );
      }
    }

    if (savedLayouts) {
      try {
        const parsedLayouts = JSON.parse(
          savedLayouts
        ) as DashboardLayouts;

        setLayouts({
          lg: parsedLayouts.lg ?? defaultLayouts.lg,
          md: parsedLayouts.md ?? defaultLayouts.md,
          sm: parsedLayouts.sm ?? defaultLayouts.sm,
          xs: parsedLayouts.xs ?? defaultLayouts.xs,
        });
      } catch (error) {
        console.error(
          "Could not load dashboard layouts:",
          error
        );
      }
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEYS.transactions,
      JSON.stringify(transactions)
    );
  }, [transactions, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEYS.widgetSettings,
      JSON.stringify(widgetSettings)
    );
  }, [widgetSettings, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEYS.layouts,
      JSON.stringify(layouts)
    );
  }, [layouts, hasLoaded]);

  const monthlyIncome =
    calculateIncome(transactions);

  const monthlyExpenses =
    calculateExpenses(transactions);

  const monthlySavings =
    calculateSavings(transactions);

  const savingsRate =
    monthlyIncome > 0
      ? Math.round(
          (monthlySavings / monthlyIncome) * 100
        )
      : 0;

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
    setTransactions((current) => [
      transaction,
      ...current,
    ]);
  }

  function handleEditTransaction(
    transaction: Transaction
  ) {
    setEditingTransaction(transaction);
  }

  function handleSaveEditedTransaction(
    updatedTransaction: Transaction
  ) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id ===
        updatedTransaction.id
          ? updatedTransaction
          : transaction
      )
    );

    setEditingTransaction(null);
  }

  function handleDeleteTransaction(id: string) {
    setTransactions((current) =>
      current.filter(
        (transaction) =>
          transaction.id !== id
      )
    );
  }

  function toggleWidget(widgetId: WidgetId) {
    setWidgetSettings((current) => ({
      ...current,
      [widgetId]: !current[widgetId],
    }));
  }

  function resetDashboard() {
    setWidgetSettings(defaultWidgetSettings);
    setLayouts(defaultLayouts);
    setWidgetSizes({});

    localStorage.removeItem(
      STORAGE_KEYS.layouts
    );
  }

  function handleLayoutChange(
    currentLayout: Layout,
    allLayouts: DashboardLayouts
  ) {
    setLayouts({
      lg: allLayouts.lg ?? layouts.lg,
      md: allLayouts.md ?? layouts.md,
      sm: allLayouts.sm ?? layouts.sm,
      xs: allLayouts.xs ?? layouts.xs,
    });

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

    switch (widgetId) {
      case "netWorth":
        return (
          <ExpandedStatCard
            title="Net worth"
            value="£41,283"
            description="Your total financial position"
            size={size}
            secondaryLabel="Assets"
            secondaryValue="£52,283"
            insight="Your estimated assets currently exceed liabilities by £41,283."
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
            insight="Your monthly income is calculated from all income transactions stored in Finovo."
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
            title="Monthly savings"
            value={formatCurrency(
              monthlySavings
            )}
            description="Income minus expenses"
            size={size}
            secondaryLabel="Savings rate"
            secondaryValue={`${savingsRate}%`}
            insight={
              savingsRate >= 20
                ? "Your current savings rate is above the common 20% budgeting target."
                : "Reducing flexible spending could improve your monthly savings rate."
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
            description="Your progress towards a house deposit"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold">
                    £11,000
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    of £30,000 saved
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
                  £19,000 remaining
                </p>

                {size.height >= 5 && (
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    At £500 per month, this goal
                    would take approximately another
                    38 months.
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

        {isEditMode && (
          <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.07] px-4 py-3 text-sm text-blue-200">
            Drag widgets using the handle.
            Resize them from the bottom-right
            corner. Larger statistic cards
            automatically reveal more detail.
          </div>
        )}

        {visibleWidgetIds.length === 0 ? (
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
          <div ref={containerRef}>
            {mounted && (
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
                          aria-label={`Move ${widgetId} widget`}
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
            )}
          </div>
        )}
      </section>

      {editingTransaction && (
        <AddTransactionModal
          transaction={editingTransaction}
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
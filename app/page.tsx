"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Layout } from "react-grid-layout";

import {
  Lock,
  SlidersHorizontal,
  Unlock,
} from "lucide-react";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useHasHydrated } from "@/hooks/useHasHydrated";

import type { Transaction } from "@/lib/types";

import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import GoalOverview from "@/components/dashboard/GoalOverview";
import CashflowChart from "@/components/dashboard/CashflowChart";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import DashboardCustomizer from "@/components/dashboard/DashboardCustomizer";
import DashboardOverviewHero from "@/components/dashboard/DashboardOverviewHero";
import DashboardSectionHeader from "@/components/dashboard/DashboardSectionHeader";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import ExpandedStatCard from "@/components/dashboard/ExpandedStatCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SmartInsightsOverview from "@/components/dashboard/SmartInsightsOverview";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import {
  calculateMonthlyFinancialSummary,
} from "@/lib/finance";
import { calculateMonthlyBudgetSummary } from "@/lib/budget";
import { formatBudgetMonth } from "@/lib/budget-month";
import { readStoredBudgets } from "@/lib/budget-storage";
import { readStoredGoals } from "@/lib/goal-storage";
import { readStoredAccounts } from "@/lib/account-storage";
import { calculateCashflowForecast } from "@/lib/cashflow-forecast";
import { calculateFinancialHealth } from "@/lib/financial-health";
import { readStoredInvestments } from "@/lib/investment-storage";
import { calculateFinancialOverview } from "@/lib/net-worth";
import { calculateNetWorthHistorySummary } from "@/lib/net-worth-history";
import { readStoredNetWorthHistory } from "@/lib/net-worth-history-storage";
import { readStoredRecurringTransactions } from "@/lib/recurring-transaction-storage";
import { generateSmartFinancialInsights } from "@/lib/smart-insights";
import { calculateNetWorthMinor } from "@/lib/accounts";
import { formatCurrency } from "@/lib/money";
import { minorUnitsToEuroAmount } from "@/lib/transaction-amount";
import {
  defaultLayouts,
  defaultWidgetSettings,
  widgetOptions,
} from "@/lib/dashboard-config";
import {
  filterDashboardLayout,
  formatSurplusRate,
  getDashboardStorageNotice,
  type StorageArea,
  type StorageHealth,
  type StorageHealthState,
} from "@/lib/dashboard-helpers";
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
  type DashboardLayouts,
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

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export default function Home() {
  const router = useRouter();

  const [initialAccounts] = useState(() =>
    readStoredAccounts([])
  );

  const accounts = initialAccounts.value;

  const [initialBudgets] = useState(() =>
    readStoredBudgets([])
  );

  const budgets = initialBudgets.value;

  const [initialGoals] = useState(() =>
    readStoredGoals([])
  );

  const goals = initialGoals.value;

  const [initialInvestments] = useState(() =>
    readStoredInvestments([])
  );

  const investments = initialInvestments.value;

  const [initialRecurring] = useState(() =>
    readStoredRecurringTransactions([])
  );

  const recurringItems = initialRecurring.value;

  const [initialNetWorthHistory] = useState(() =>
    readStoredNetWorthHistory([])
  );

  const netWorthHistory = initialNetWorthHistory.value;

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

  const mounted = useHasHydrated();

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

  const netWorthMinor =
    calculateNetWorthMinor(accounts);
  const netWorth =
    minorUnitsToEuroAmount(netWorthMinor) ?? 0;
  const includedAccounts = accounts.filter(
    (account) => account.includedInNetWorth
  );
  const includedAccountCount =
    includedAccounts.length;
  const totalAccountBalanceMinor =
    accounts.reduce(
      (total, account) =>
        total + account.balanceMinor,
      0
    );
  const totalAccountBalance =
    minorUnitsToEuroAmount(
      totalAccountBalanceMinor
    ) ?? 0;

  const currentBudgetMonth = formatBudgetMonth(new Date());
  const monthlyBudgetSummary =
    calculateMonthlyBudgetSummary(
      budgets,
      transactions,
      currentBudgetMonth
    );
  const activeBudgetCount = budgets.filter(
    (budget) => budget.month === currentBudgetMonth
  ).length;

  const primaryGoal =
    goals.find((goal) => goal.status === "active") ??
    goals[0] ??
    null;

  const financialOverview = useMemo(
    () =>
      calculateFinancialOverview(
        accounts,
        investments,
        goals,
        transactions
      ),
    [accounts, investments, goals, transactions]
  );

  const financialHealth = useMemo(
    () => calculateFinancialHealth(financialOverview),
    [financialOverview]
  );

  const netWorthHistorySummary = useMemo(
    () => calculateNetWorthHistorySummary(netWorthHistory),
    [netWorthHistory]
  );

  const forecastStartDate = useMemo(
    () => formatLocalDate(new Date()),
    []
  );

  const forecastEndDate = useMemo(
    () => formatLocalDate(addDays(new Date(), 30)),
    []
  );

  const cashflowForecast = useMemo(
    () =>
      calculateCashflowForecast(
        accounts,
        recurringItems,
        forecastStartDate,
        forecastEndDate
      ),
    [accounts, recurringItems, forecastStartDate, forecastEndDate]
  );

  const smartInsights = useMemo(
    () =>
      generateSmartFinancialInsights(
        financialOverview,
        financialHealth,
        netWorthHistorySummary,
        cashflowForecast
      ),
    [financialOverview, financialHealth, netWorthHistorySummary, cashflowForecast]
  );

  const storageNotice = getDashboardStorageNotice(storageHealth);

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
        lg: filterDashboardLayout(
          layouts.lg,
          widgetSettings
        ),
        md: filterDashboardLayout(
          layouts.md,
          widgetSettings
        ),
        sm: filterDashboardLayout(
          layouts.sm,
          widgetSettings
        ),
        xs: filterDashboardLayout(
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
          <button
            type="button"
            onClick={() => router.push("/accounts")}
            aria-label="Open accounts"
            className="h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-950"
          >
            <ExpandedStatCard
              title="Net worth"
              value={formatCurrency(netWorth)}
              description={
                accounts.length === 0
                  ? "Add accounts to calculate your real net worth"
                  : `Calculated from ${includedAccountCount} included ${
                      includedAccountCount === 1
                        ? "account"
                        : "accounts"
                    }`
              }
              size={size}
              secondaryLabel={
                accounts.length === 0
                  ? "Accounts"
                  : "All account balances"
              }
              secondaryValue={
                accounts.length === 0
                  ? "No accounts yet"
                  : formatCurrency(totalAccountBalance)
              }
              insight={
                accounts.length === 0
                  ? "Open Accounts to add your checking, savings, investment or cash balances."
                  : "Only accounts marked as included contribute to net worth. Select this widget to review your accounts."
              }
            />
          </button>
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

      case "budgetOverview":
        return (
          <BudgetOverview
            summary={monthlyBudgetSummary}
            activeBudgets={activeBudgetCount}
            onOpenBudget={() => router.push("/budget")}
          />
        );

      case "savingsGoal":
        return (
          <DashboardPanel
            title="Savings goal"
            description={
              primaryGoal
                ? "Progress toward your primary active goal"
                : "Add a goal to start tracking progress"
            }
          >
            <GoalOverview
              goal={primaryGoal}
              size={size}
              onOpenGoals={() =>
                router.push("/goals")
              }
            />
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

        {mounted && (
          <div className="mb-8">
            <DashboardOverviewHero
              netWorthMinor={netWorthMinor}
              monthlySurplusMinor={
                monthlySurplusMinor
              }
              financialHealthScore={
                financialHealth.score
              }
              forecastEndingBalanceMinor={
                cashflowForecast.endingBalanceMinor
              }
              forecastDays={30}
            />
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-end gap-3">
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

        {mounted && (
          <section className="mb-10">
            <DashboardSectionHeader
              eyebrow="Intelligence"
              title="Your financial signals"
              description="Finovo combines your cash flow, forecast, goals and financial health to surface the items that matter most."
            />

            <div className="mt-5">
              <SmartInsightsOverview
                insights={smartInsights}
                maxItems={4}
              />
            </div>
          </section>
        )}

        <section>
          <DashboardSectionHeader
            eyebrow="Workspace"
            title="Your dashboard"
            description="Arrange and resize the widgets below to match the way you manage your finances."
          />

          <div className="mt-5">
            <DashboardGrid
          mounted={mounted}
          isEditMode={isEditMode}
          visibleWidgetIds={visibleWidgetIds}
          visibleLayouts={visibleLayouts}
          onChooseWidgets={() =>
            setShowCustomizePanel(true)
          }
          onLayoutChange={handleLayoutChange}
          renderWidget={renderWidget}
            />
          </div>
        </section>
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

      <DashboardCustomizer
        isOpen={showCustomizePanel}
        widgetSettings={widgetSettings}
        visibleWidgetCount={
          visibleWidgetIds.length
        }
        onClose={() =>
          setShowCustomizePanel(false)
        }
        onReset={resetDashboard}
        onToggleWidget={toggleWidget}
      />
    </main>
  );
}

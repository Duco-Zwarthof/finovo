# Finovo Budget Architecture

> **Version:** 1.0
> **Status:** Proposed for founder approval
> **Scope:** Budgeting MVP
> **Owner:** Founder
> **Last reviewed:** 2026-08-01

---

# Purpose

This document defines the architecture of Finovo's first budgeting system.

The budgeting feature should help users answer three questions:

1. How much did I plan to spend this month?
2. How much have I already spent?
3. How much can I still spend without exceeding my plan?

Budgeting must improve financial clarity without introducing unnecessary complexity.

---

# MVP Decisions

The first budgeting version uses the following rules.

## Monthly category budgets

A budget applies to one expense category in one calendar month.

Examples:

- Groceries — August 2026 — €300.00
- Entertainment — August 2026 — €150.00
- Transport — August 2026 — €100.00

## No separate overall-budget record

The total monthly budget is derived from the sum of all category budgets for the selected month.

This avoids conflicts between:

- one overall spending limit; and
- several category spending limits.

A separate overall-budget model may be added later if users need it.

## Expense transactions only

Only transactions with type `expense` count toward budget usage.

Income transactions never consume a budget.

## Category matching

An expense counts toward a budget only when:

- its category matches the budget category; and
- its transaction date falls within the budget month.

## Calendar-month reporting

A budget month uses the format:

```text
YYYY-MM
```

The month follows the user's local calendar.

## EUR minor units

Budget limits and all calculated monetary values use integer euro cents.

Example:

```text
€300.00 = 30000
```

No budgeting calculation may use floating-point euro amounts as its canonical representation.

## One budget per category per month

A user may have at most one budget for the same category and month.

Editing an existing budget replaces its limit rather than creating a duplicate.

## No demo budgets

The first budgeting version does not create sample budgets automatically.

When no budgets exist, Finovo shows an honest empty state.

Transaction demo data may still be displayed according to the existing transaction-data rules, but demo transactions must be clearly identified and must not silently create saved budget data.

---

# Domain Model

Create the budget domain model separately from persisted storage models.

```ts
export type BudgetMonth = string;

export type Budget = {
  id: string;
  month: BudgetMonth;
  category: BudgetCategory;
  limitMinor: number;
};
```

`BudgetCategory` should contain only categories that may be budgeted.

Recommended initial categories:

```ts
export const BUDGET_CATEGORIES = [
  "Housing",
  "Groceries",
  "Transport",
  "Entertainment",
  "Subscriptions",
  "Other",
] as const;
```

`Salary` is excluded because it is an income category.

`Investments` is excluded from the first budgeting version because investment contributions should eventually be represented as transfers rather than normal consumption expenses.

---

# Budget Month Validation

A budget month must strictly match:

```text
YYYY-MM
```

It must represent a valid calendar month from `01` through `12`.

Examples:

Valid:

```text
2026-01
2026-08
2027-12
```

Invalid:

```text
2026-00
2026-13
26-08
August 2026
```

Create pure utilities for:

- parsing a budget month;
- formatting a `Date` as a local budget month;
- checking whether a transaction date belongs to a budget month;
- comparing budget months;
- moving to the previous or next month.

Do not duplicate date logic already available in `lib/date.ts`.

---

# Canonical Calculations

Budget calculations belong in a pure utility module, recommended:

```text
lib/budget.ts
```

The core result for one budget should be:

```ts
export type BudgetProgress = {
  budgetId: string;
  month: BudgetMonth;
  category: BudgetCategory;
  limitMinor: number;
  spentMinor: number;
  remainingMinor: number;
  usagePercentage: number | null;
  status: BudgetStatus;
  transactionCount: number;
};
```

Recommended statuses:

```ts
export type BudgetStatus =
  | "unused"
  | "on-track"
  | "near-limit"
  | "over-budget";
```

## Spending

```text
spentMinor = sum of matching expense transaction amountMinor values
```

## Remaining budget

```text
remainingMinor = limitMinor - spentMinor
```

A negative result means the budget is exceeded.

## Usage percentage

```text
usagePercentage = spentMinor / limitMinor × 100
```

If `limitMinor` is zero, usage percentage is unavailable.

The normal UI should not allow a zero limit, but calculation utilities must still handle it safely.

## Status thresholds

Recommended MVP thresholds:

- `unused`: no matching expenses
- `on-track`: usage below 80%
- `near-limit`: usage from 80% through 100%
- `over-budget`: usage above 100%

These thresholds are presentation guidance, not financial advice.

Store them as named constants rather than magic numbers inside components.

## Monthly totals

Create a derived monthly overview:

```ts
export type MonthlyBudgetSummary = {
  month: BudgetMonth;
  totalLimitMinor: number;
  totalSpentMinor: number;
  totalRemainingMinor: number;
  usagePercentage: number | null;
  budgetedCategoryCount: number;
  overBudgetCategoryCount: number;
};
```

The total limit is the sum of category budget limits.

The total spent amount should include spending only for categories that have a budget in the selected month.

Unbudgeted spending should be reported separately:

```ts
unbudgetedSpentMinor: number;
```

This prevents unbudgeted expenses from disappearing from the user's financial picture.

---

# Safe-Integer Rules

All budget limits, spending totals and remaining values use safe integer arithmetic.

The calculation layer must reject or explicitly fail when an aggregate exceeds JavaScript's safe integer range.

Do not silently return an unsafe monetary result.

Reuse the existing minor-unit safety patterns from Finovo's transaction and financial calculation utilities.

---

# Storage Architecture

Use a separate localStorage key:

```text
finovo-budgets
```

Budgets must not be embedded in the transaction payload.

Use a versioned persisted envelope from the first implementation:

```ts
export type PersistedBudgetV1 = {
  id: string;
  month: string;
  category: BudgetCategory;
  limitMinor: number;
};

export type PersistedBudgetDataV1 = {
  version: 1;
  budgets: PersistedBudgetV1[];
};
```

## Storage requirements

The budget storage layer must:

- validate raw JSON at runtime;
- distinguish missing, valid, partially recoverable, invalid and unavailable storage;
- preserve valid records from a partially malformed array where safe;
- reject duplicate month/category combinations deterministically;
- never overwrite malformed or unsupported-version payloads automatically;
- avoid initialization writes;
- write only after an explicit user mutation;
- preserve an intentionally empty budget array;
- remain browser- and device-specific for the MVP.

Prefer extending the existing storage patterns rather than mixing budget parsing directly into React components.

Budget storage logic may be implemented in a focused module such as:

```text
lib/budget-storage.ts
```

Do not make `lib/storage.ts` substantially larger unless shared helpers are first extracted cleanly.

---

# State and CRUD

Budget state should be separate from transaction state.

Recommended operations:

```ts
createBudget(...)
updateBudget(...)
deleteBudget(...)
upsertBudget(...)
```

`upsertBudget` is useful because the business rule permits only one budget per category and month.

Each operation must:

- preserve immutable state;
- validate the category, month and limit;
- maintain unique IDs;
- prevent duplicate month/category records;
- persist only validated user-owned budgets.

A large global state library is not required.

---

# UI Architecture

The budgeting feature should be built in small stages.

## Budget page

Recommended route:

```text
app/budget/page.tsx
```

The page should answer:

```text
How am I performing against this month's spending plan?
```

Initial page sections:

1. Month selector
2. Monthly budget summary
3. Category budget list
4. Add or edit budget action
5. Honest empty state

## Recommended components

```text
components/budget/
  BudgetHeader.tsx
  BudgetMonthSelector.tsx
  BudgetSummaryCard.tsx
  BudgetCategoryList.tsx
  BudgetCategoryRow.tsx
  BudgetProgressBar.tsx
  BudgetFormModal.tsx
  BudgetEmptyState.tsx
```

Keep calculations outside these components.

## Budget form

The form should collect:

- category;
- monthly limit;
- month.

The amount input is decimal euro text at the form boundary and is converted to `limitMinor` before creating the domain object.

The form must:

- reject empty values;
- reject zero and negative limits;
- reject more than two decimal places;
- prevent duplicate category/month budgets;
- provide visible validation feedback;
- preserve exact cent values when editing.

## Dashboard widget

After the page is stable, add one dashboard widget answering:

```text
Am I staying within my budgets this month?
```

The widget should show:

- total budget;
- total spent;
- remaining amount;
- total usage percentage;
- number of categories over budget.

It should link to the full Budget page.

Do not add the widget in the first implementation batch.

---

# Responsive Behavior

## Desktop

- Summary cards may be displayed horizontally.
- Category rows may show limit, spent, remaining and progress in one row.
- Add/edit actions may use a modal.

## Mobile

- Summary cards stack vertically.
- Each category becomes a compact card.
- Progress and monetary values remain readable without horizontal scrolling.
- Budget creation must not depend on hover or drag interactions.

---

# Accessibility

Budget UI must:

- use semantic form labels;
- expose progress values to assistive technology;
- not communicate status using color alone;
- provide visible focus states;
- support keyboard operation;
- give buttons descriptive accessible names;
- explain over-budget and near-limit states in text.

A progress bar should expose at least:

```text
aria-valuemin
aria-valuemax
aria-valuenow
aria-label
```

For usage above 100%, visual width may be capped while the textual percentage remains accurate.

---

# Empty, Error and Recovery States

## No budgets

Show an honest message such as:

```text
No budgets for this month yet.
Create a category budget to start planning your spending.
```

## No matching transactions

Show the budget with:

- spent: €0.00;
- full amount remaining;
- status: unused.

## Storage unavailable

Budgets remain usable in memory for the current session, with a visible warning that changes may not be saved.

## Invalid stored data

Do not crash or silently replace the raw payload.

Use the established Finovo recovery-warning pattern.

## Unsupported storage version

Do not interpret or overwrite it.

Show a compatibility warning.

---

# Testing Strategy

Create pure unit tests before building the full UI.

Recommended test modules:

```text
lib/budget.test.ts
lib/budget-storage.test.ts
```

## Domain and validation tests

Cover:

- valid and invalid budget months;
- valid and invalid categories;
- zero, negative, fractional and unsafe limits;
- one budget per category/month;
- immutable add, edit, delete and upsert operations.

## Calculation tests

Cover:

- no transactions;
- matching expense transactions;
- income excluded;
- other months excluded;
- other categories excluded;
- exact cent arithmetic;
- remaining positive, zero and negative;
- 0%, 80%, 100% and above-100% statuses;
- transaction count;
- monthly total limits;
- total budgeted spending;
- unbudgeted spending;
- safe-integer overflow.

## Storage tests

Cover:

- missing storage;
- valid empty V1 envelope;
- valid records;
- malformed JSON;
- malformed envelope;
- partially malformed records;
- duplicate category/month records;
- unsupported version;
- read and write failures;
- no initialization write;
- user mutations write V1;
- malformed and unsupported payloads remain untouched.

## UI tests

After the calculation and storage layers are stable, add focused tests for:

- empty state;
- creating a budget;
- editing a budget;
- deleting a budget;
- switching month;
- visible over-budget status;
- exact amount display.

Avoid large snapshots of the entire page.

---

# Implementation Phases

## Phase B1 — Domain foundation

Add:

```text
lib/budget-types.ts
lib/budget-month.ts
lib/budget.ts
```

Include:

- types;
- constants;
- month validation;
- calculation utilities;
- CRUD helpers;
- pure tests.

No UI and no persistence yet.

## Phase B2 — Persistence

Add:

```text
lib/budget-storage.ts
lib/budget-storage.test.ts
```

Implement:

- V1 envelope;
- runtime validation;
- safe read/write behavior;
- explicit warnings/statuses.

## Phase B3 — Budget page

Add the route and focused UI components.

Connect:

- budget state;
- transaction state;
- month selection;
- CRUD;
- persistence.

## Phase B4 — Navigation

Make the sidebar Budget item navigate to the Budget page.

Ensure the dashboard route continues working.

## Phase B5 — Dashboard widget

Add the compact monthly-budget widget after the page is stable.

## Phase B6 — Documentation reconciliation

Update:

- `docs/FEATURES.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/CHANGELOG.md`
- `docs/TERMINOLOGY.md`

Update feature status only after the corresponding behavior is implemented and validated.

---

# Out of Scope for the First Budgeting Version

Do not include yet:

- weekly budgets;
- rollover budgets;
- shared budgets;
- automatic recommendations;
- notifications;
- recurring budget templates;
- separate account budgets;
- cash versus card allocation;
- AI-generated limits;
- predictive spending;
- cloud synchronization;
- budget history charts;
- an independent overall-budget constraint.

These may be considered after the monthly category-budget workflow is proven useful.

---

# Definition of Done

The Budgeting MVP is complete when:

- users can create, edit and delete monthly category budgets;
- duplicate category/month budgets cannot exist;
- budget progress is calculated from real expense transactions;
- income and other months are excluded;
- all calculations use integer minor units;
- unbudgeted spending remains visible;
- storage is validated and versioned;
- empty and recovery states are honest;
- the page works on desktop and mobile;
- accessibility basics are met;
- lint, TypeScript, tests and production build pass;
- documentation matches the implementation.

---

# Final Principle

A budget should not merely show a limit.

It should help the user understand what was planned, what has happened and what remains possible.

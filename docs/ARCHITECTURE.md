# Finovo Architecture

> **Version:** 2.0  
> **Status:** Active  
> **Implementation model:** Local-first modular Next.js application

---

# Purpose

This document describes the architecture currently used by Finovo and the direction for future refactoring.

It exists to help contributors and AI agents understand:

- where code belongs;
- how financial data is represented;
- how browser persistence works;
- how pages, components and domain modules interact;
- which architectural limitations are temporary.

Documentation must describe the actual implementation, not an idealized architecture that the code does not yet follow.

---

# Current Technology

Finovo currently uses:

- Next.js App Router
- React client components
- TypeScript
- Tailwind CSS
- Vitest
- `react-grid-layout`
- browser `localStorage`

The current alpha has no authentication, server database, cloud synchronization or external bank connection.

---

# Project Structure

```text
app/
  page.tsx
  accounts/page.tsx
  budget/page.tsx
  investments/page.tsx

components/
  accounts/
  budget/
  dashboard/
  investments/
  layout/

lib/
  domain types
  pure financial calculations
  persistence boundaries
  sample and transaction state
  focused unit tests

docs/
  product, architecture and development documentation
```

---

# Architectural Principles

## 1. Financial values use whole minor units

Domain money values are stored as safe integer cents.

```ts
amountMinor: number
```

Floating-point euro values are accepted only at input and presentation boundaries.

Conversions are centralized in:

```text
lib/transaction-amount.ts
```

Calculations must not mix decimal euro values with minor-unit domain values.

---

## 2. Business logic belongs in `lib`

Pure validation, CRUD and financial calculations live in domain modules such as:

```text
lib/finance.ts
lib/budget.ts
lib/accounts.ts
lib/investments.ts
```

Presentation components may call these functions but should not reimplement their formulas.

---

## 3. Persisted JSON is untrusted

Browser-stored data is parsed and runtime-validated before it enters application state.

Current persistence modules include:

```text
lib/storage.ts
lib/budget-storage.ts
lib/account-storage.ts
lib/investment-storage.ts
```

Each module:

- owns its storage key;
- owns its persistence version;
- validates stored payloads;
- returns an explicit read status;
- avoids overwriting malformed or unsupported payloads during initialization;
- reports unavailable or failed writes without crashing the interface.

---

## 4. Local-first is a temporary product boundary

The alpha stores data in the current browser profile and origin.

This provides:

- no cross-device synchronization;
- no durable backup guarantee;
- no user authentication;
- no server-side authorization;
- no protection from someone who can access the same browser profile;
- no automatic encryption of local values.

Finovo must not present browser-local persistence as secure cloud storage.

---

## 5. Demo data and user data remain separate

Sample transactions are display-only.

The transaction state explicitly distinguishes:

```text
demo
user
```

A user mutation transitions to user-owned state without copying sample rows into stored financial history.

Static example values must be visibly identified unless a real data source exists.

---

# Current Application Layers

The current implementation can be understood as four practical layers.

## Route layer

Located in `app/`.

Routes currently handle:

- page composition;
- client state;
- storage initialization;
- persistence decisions;
- modal state;
- orchestration of domain calculations.

This is more responsibility than the long-term target. Accounts, Budget and Investments currently repeat similar route-level patterns. A planned cleanup will move reusable behavior into shared hooks and helpers.

## Feature component layer

Located in feature folders under `components/`.

Examples:

```text
components/accounts/
components/budget/
components/investments/
components/dashboard/
```

These components are responsible for presentation and user interaction.

Feature components may be domain-aware, but formulas and persistence validation should remain in `lib`.

## Domain layer

Located in `lib/`.

This layer contains:

- domain types;
- runtime validation;
- pure calculations;
- immutable CRUD operations;
- date and money helpers.

Domain functions should be deterministic and covered by focused tests.

## Persistence layer

Also located in `lib/`, using dedicated `*-storage.ts` modules.

This layer converts untrusted JSON into validated domain data and writes versioned payloads.

---

# Domain Modules

## Transactions

Primary files:

```text
lib/types.ts
lib/transaction-amount.ts
lib/persisted-transactions.ts
lib/storage.ts
lib/transaction-data.ts
lib/finance.ts
lib/cashflow.ts
```

Transactions use canonical `amountMinor` values.

The storage boundary supports legacy reads and versioned writes while preserving the demo-data boundary.

## Budgets

Primary files:

```text
lib/budget-types.ts
lib/budget-month.ts
lib/budget.ts
lib/budget-storage.ts
```

A budget is identified by month and category.

Budget calculations derive:

- spent amount;
- remaining amount;
- usage percentage;
- status;
- monthly totals;
- unbudgeted spending.

## Accounts

Primary files:

```text
lib/account-types.ts
lib/accounts.ts
lib/account-storage.ts
```

Accounts contain a balance and an `includedInNetWorth` flag.

Net worth is the sum of included account balances.

## Investments

Primary files:

```text
lib/investment-types.ts
lib/investments.ts
lib/investment-storage.ts
```

Holdings currently store:

- name and symbol;
- asset type;
- quantity;
- average buy price;
- current price.

Current calculations cover cost, value and unrealized return. Historical performance and market-price integrations are not yet implemented.

---

# Dashboard Architecture

The dashboard currently combines:

- widget configuration;
- responsive layouts;
- storage orchestration;
- transaction mutation handling;
- financial calculations;
- widget rendering;
- customization interface.

Most of this currently lives in:

```text
app/page.tsx
```

This file is intentionally scheduled for decomposition.

Planned boundaries:

```text
lib/dashboard-config.ts
hooks/use-dashboard-storage.ts
components/dashboard/DashboardGrid.tsx
components/dashboard/DashboardCustomizer.tsx
components/dashboard/widgets/
```

The exact split should be introduced incrementally without changing stored widget IDs or layout behavior.

---

# Shared Behavior Planned for Extraction

The following behavior is duplicated across feature pages and should become shared infrastructure:

- hydration detection;
- storage read/write health mapping;
- reusable storage notice presentation;
- guarded persistence after invalid or unsupported reads;
- common page shells and skeleton patterns.

Potential locations:

```text
hooks/use-has-hydrated.ts
lib/storage-health.ts
components/shared/StorageNotice.tsx
components/layout/AppPageShell.tsx
```

Extraction must preserve current behavior and tests.

---

# Testing Strategy

Pure domain logic and persistence boundaries should have focused Vitest coverage.

Current test areas include:

- dates;
- money and amount conversion;
- financial summaries;
- cash flow;
- transaction persistence and state transitions;
- budgets;
- accounts;
- investments.

UI tests are not yet a major part of the codebase. Until they are introduced, every completed UI feature requires a manual browser check in addition to:

```bash
npx tsc --noEmit --incremental false
npm test
npm run lint
npm run build
```

---

# Privacy and Security Boundary

Finovo currently stores financial values in browser-local storage.

The application must never store:

- bank passwords;
- PIN codes;
- full payment-card credentials;
- secret API keys;
- authentication tokens in ordinary local storage.

Authentication, cloud synchronization and external financial integrations require a separate reviewed security architecture before implementation.

---

# Refactoring Rules

Refactors must:

1. preserve domain behavior;
2. preserve existing storage keys unless a migration is designed;
3. preserve supported persisted versions;
4. keep malformed and unsupported data untouched during initialization;
5. keep the demo-data boundary intact;
6. maintain or increase test coverage;
7. avoid combining unrelated feature changes with structural cleanup.

---

# Current Architectural Priorities

1. Synchronize documentation with the implementation.
2. Extract shared hydration behavior.
3. Extract common storage-health helpers and UI.
4. Reduce repeated route-level persistence logic.
5. Decompose the dashboard route.
6. Establish privacy and security documentation.
7. Continue product development on top of the cleaned foundation.

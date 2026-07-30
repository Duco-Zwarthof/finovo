# Finovo Architecture

> **Version:** 1.0
> **Status:** Active

---

# Purpose

This document describes the architecture of Finovo.

Its purpose is to help contributors and AI agents understand how the application is organized before implementing new functionality.

The architecture prioritizes:

- scalability
- maintainability
- readability
- reusability
- separation of concerns

---

# Core Principles

Finovo should be easy to extend.

Adding a new feature should require adding code, not rewriting existing code.

Always prefer extending the architecture over bypassing it.

---

# Architectural Philosophy

Finovo follows a modular architecture.

The project should consist of small reusable building blocks rather than large tightly coupled modules.

Prefer many focused components over a few large components.

---

# Layered Architecture

Application layers should remain separated.

```
Pages / Routes

↓

Layouts

↓

Widgets

↓

Components

↓

Hooks

↓

Services

↓

Utilities

↓

Data
```

Each layer has a single responsibility.

---

# Responsibilities

## Routes

Responsible for:

- page composition
- metadata
- routing

Routes should contain almost no business logic.

---

## Layouts

Responsible for:

- positioning
- page structure
- responsive layout

Layouts should never contain financial calculations.

---

## Widgets

Widgets are the primary building blocks of Finovo.

Every widget answers exactly one financial question.

Widgets may use components internally.

Widgets should never depend on other widgets.

---

## Components

Components are reusable UI elements.

Examples:

- buttons
- cards
- charts
- dialogs
- inputs
- progress bars

Components should remain generic whenever possible.

---

## Hooks

Hooks contain reusable behavior.

Examples:

- localStorage
- responsive helpers
- calculations
- preferences
- dashboard state

Hooks should avoid UI.

---

## Services

Services communicate with external systems.

Examples:

- authentication
- APIs
- storage
- future banking integrations

Business logic belongs here whenever external communication is involved.

---

## Utilities

Utilities contain pure helper functions.

Examples:

- formatting
- currency
- dates
- percentages
- calculations

Utilities should be deterministic.

---

# Business Logic

Business logic should never live inside presentation components.

Instead:

```
UI

↓

Hook

↓

Service

↓

Utility
```

The UI should describe.

The logic should decide.

---

# Financial Calculations

Financial calculations should always be centralized.

Never duplicate formulas.

Never perform financial calculations directly inside components.

Instead create reusable functions.

Examples:

- compound interest
- surplus rate
- investment growth
- budget calculations
- financial health score

## Current Monthly Summary

Current-month reporting is implemented with two pure utility boundaries:

- `lib/date.ts` strictly parses and formats local `YYYY-MM-DD` calendar dates and determines calendar-month membership.
- `lib/finance.ts` aggregates current-month income and expenses, then derives monthly surplus and surplus rate.

UI components consume these results and do not define their own date parsers or monthly financial formulas. A reference date can be supplied to the financial summary function so reporting-period behavior remains deterministic in tests.

Invalid or impossible transaction dates are excluded from date-based summaries and chart groupings rather than normalized into another date.

## Currency Presentation

Currency presentation is centralized in `lib/money.ts` and remains separate from financial calculations.

- All normal monetary values use EUR with the `en-IE` locale and exactly two decimal places.
- Compact EUR formatting is reserved for chart axes; cards, transactions, filters, prose and chart tooltips use exact formatting.
- Editable amount fields use the currency symbol derived by the shared formatter while retaining their existing numeric input values.

This boundary changes presentation only. Transaction amounts remain numbers in the existing transaction and storage schemas.

---

# Testing

Focused pure utility tests are colocated in `lib/*.test.ts` and run with Vitest in a Node environment. Financial and calendar behavior should use injected reference dates instead of depending on the machine clock.

---

# State Management

State should remain as local as possible.

Only share state when necessary.

Guidelines:

- Local component state first.
- Shared state second.
- Persistent storage only when valuable.

Avoid unnecessary global state.

## Browser-Local Persistence

The dashboard currently persists three independent state slices in browser `localStorage` under stable keys:

- `finovo-transactions` stores the current transaction persistence envelope.
- `finovo-dashboard-widgets` stores widget visibility settings.
- `finovo-dashboard-layouts-v2` stores responsive widget layouts, including position and dimensions.

`lib/storage.ts` is the boundary for reading, parsing, validating, writing and removing these values. UI components do not parse stored JSON directly. `lib/persisted-transactions.ts` defines the persisted transaction model separately from the domain model in `lib/types.ts`.

New transaction writes use the V1 envelope:

```ts
{
  version: 1,
  transactions: Transaction[]
}
```

The storage key and transaction values remain unchanged. Existing unversioned transaction arrays remain readable and are not rewritten during initialization. Automatic legacy migration is intentionally deferred; the next explicit transaction change is written in the current V1 format through the normal storage boundary.

Stored JSON is treated as untrusted input:

- The transaction envelope must use the supported version and contain a transaction array. Unsupported versions and malformed envelopes are invalid.
- Transaction entries must contain a non-empty ID and title, a supported category and type, a finite positive amount and a date accepted by the strict local-date utility.
- In a partially invalid transaction array, valid entries are retained in their original order. Invalid entries and later entries with duplicate IDs are discarded.
- Widget settings are accepted only for known widget IDs with boolean values. Invalid or missing fields use their in-code defaults without resetting other valid settings.
- Responsive layouts accept only known widget IDs and valid grid positions and dimensions. Missing or invalid widget layouts use their breakpoint defaults.
- Layout updates merge with the complete saved layout so hiding a widget does not erase its stored position or size.

Reads distinguish missing, valid, partially recovered, invalid and unavailable storage. Malformed JSON, unsupported transaction versions and wholly structurally invalid payloads produce the invalid outcome. Missing or unusable values return in-code fallbacks, while partially valid values return a sanitized result. Initialization never rewrites storage: legacy, missing, invalid and partially recovered payloads remain untouched until the user explicitly changes that state slice. The next successful user change writes the current validated state; transaction writes use the V1 envelope, while dashboard reset deliberately removes the layout key so breakpoint defaults apply on the next load. Storage access and quota failures return an explicit failure result without crashing the dashboard, and the UI warns that changes may not survive a reload.

Persisted state is initialized lazily in the client component without an initial persistence write. Browser globals are guarded during server rendering, and the responsive dashboard content waits for its client-side container measurement so server fallback state cannot cause a hydration mismatch.

This data belongs only to the current origin and browser profile on the current device. It is not authenticated, cloud-synchronized, shared across browsers or devices, or backed up. Clearing site data or using ephemeral/private browsing can remove it.

## Demo and User Transaction State

`lib/transaction-data.ts` converts the transaction-storage read result into a `TransactionDataState` whose source is explicitly either `demo` or `user`. The sample array remains separate from browser-local user transactions and is supplied only for display while the state source is `demo`.

Initial selection is deterministic:

| Transaction storage result | Transaction state |
|----------------------------|-------------------|
| Missing key | Demo source with the in-code sample transactions |
| Valid empty array | User source with an intentional empty dataset |
| Recovered array with no retained entries | User source with an empty recovery dataset |
| Valid or recovered array with user entries | User source with the validated entries |
| Valid or recovered array containing only exact legacy seed rows | Demo source with the in-code sample transactions |
| Invalid or unavailable value | User source with an empty recovery dataset and a visible storage warning |

Earlier Finovo versions could persist the known sample rows through transaction actions. For compatibility, exact field-for-field copies of those legacy seed rows are removed from otherwise valid or recovered user arrays. A legacy array containing only exact seed rows is presented as demo data. Any changed row, including one that reuses a seed ID but differs in another field, remains user data so this compatibility rule does not discard an edited transaction.

Demo transitions preserve the boundary:

- Adding a transaction creates user state containing only the new transaction.
- Editing a demo row creates user state containing only the edited transaction as a new user-owned record.
- Deleting a demo row creates an intentional empty user state.
- User-state changes continue to operate on the user array normally.
- Deleting the last user transaction persists a V1 envelope whose `transactions` value is `[]`; reloading keeps the dashboard empty and does not reactivate demo data.

The demo array is never written to `finovo-transactions` or merged into a user write. Initialization performs no storage write. If an explicit change cannot be saved, the in-memory state remains user-owned and the existing storage warning explains that the change may be lost on reload; storage itself remains untouched.

When transaction state is demo, the dashboard renders a visible, accessible explanation that the displayed values are examples and are not saved as the user's financial data. Net-worth and savings-goal values still have no user-data source, so those widgets remain explicitly labelled as sample examples in both transaction states.

The demo boundary does not change the transaction storage key, amount representation, widget IDs or dashboard layouts. Transaction persistence now uses the separately documented V1 envelope without changing demo-state selection or transitions.

---

# Dashboard

The dashboard is the application's home.

Its purpose is answering:

"How are my finances today?"

Every widget should contribute to answering this question.

---

# Widget System

Widgets should be:

- independent
- reusable
- configurable
- draggable
- responsive

Widgets should never assume where they are rendered.

Widgets receive data.

Widgets render insights.

---

# Data Flow

Data should move in one direction.

```
Source

↓

Processing

↓

Calculation

↓

Presentation
```

Avoid circular dependencies.

Avoid bidirectional data flow.

---

# Component Size

Prefer small files.

Recommended sizes:

Components:
100–250 lines

Hooks:
50–200 lines

Utilities:
Small focused functions

Large files should be split.

---

# Naming

Use descriptive names.

Good:

SavingsWidget

InvestmentGrowthChart

BudgetProgressCard

Bad:

Widget1

Helper

Utils2

Names should explain purpose.

---

# Folder Structure

Every folder should have a clear responsibility.

Avoid dumping unrelated files into the same directory.

Prefer feature grouping over random grouping.

---

# Reusability

Before creating new code ask:

Can this become reusable?

If yes:

Extract it.

Future development should become easier, not harder.

---

# Performance

Optimize only when necessary.

Prefer:

- memoization for expensive calculations
- lazy loading
- reusable rendering
- efficient state updates

Avoid premature optimization.

---

# Error Handling

Never fail silently.

Always:

- validate inputs
- show meaningful errors
- recover gracefully
- log unexpected failures

---

# Future Scalability

The architecture should support future additions such as:

- banking integrations
- investment portfolios
- AI financial coach
- recurring transactions
- subscriptions
- shared household budgets
- premium features

New functionality should integrate naturally.

---

# Final Principle

Architecture exists to make future development easier.

Every architectural decision should reduce complexity rather than increase it.

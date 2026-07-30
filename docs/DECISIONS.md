# Finovo Decisions

> **Version:** 1.0
> **Status:** Active

---

# Purpose

This document records important architectural and product decisions made during the development of Finovo.

Its purpose is to preserve the reasoning behind decisions so contributors and AI agents do not repeat discussions or unintentionally reverse established choices.

---

# Decision 001 — Next.js

**Status:** Accepted

## Decision

Finovo uses Next.js as its application framework.

## Reason

- Modern React framework
- Excellent performance
- File-based routing
- Server Components support
- Long-term ecosystem

---

# Decision 002 — TypeScript

**Status:** Accepted

## Decision

The project uses TypeScript throughout the codebase.

## Reason

- Better maintainability
- Strong typing
- Better AI-generated code
- Easier refactoring

---

# Decision 003 — Tailwind CSS

**Status:** Accepted

## Decision

Tailwind CSS is the primary styling solution.

## Reason

- Fast development
- Consistent design
- Easy responsive layouts
- Minimal CSS maintenance

---

# Decision 004 — Dashboard First

**Status:** Accepted

## Decision

The dashboard is the central page of Finovo.

## Reason

Users should immediately understand their financial situation after opening the application.

---

# Decision 005 — Widget-Based Design

**Status:** Accepted

## Decision

The dashboard is built from reusable widgets.

## Reason

- Personalization
- Reusability
- Scalability
- Cleaner architecture

---

# Decision 006 — Financial Clarity Before Complexity

**Status:** Accepted

## Decision

Every feature must improve financial understanding before adding advanced functionality.

## Reason

Finovo focuses on clarity instead of overwhelming users with data.

---

# Decision 007 — Calendar-Month Reporting and Surplus Terminology

**Status:** Accepted

## Decision

Dashboard summaries labelled as monthly use the user's current local calendar month. Income minus expenses is called monthly surplus, and its percentage of monthly income is called the surplus rate.

Savings contributions, savings balances and savings goals remain separate concepts. The persisted dashboard widget key `monthlySavings` is retained temporarily for storage compatibility and is not product terminology.

## Reason

- Monthly summaries must have a precise and predictable reporting period.
- Date-only transactions should not change day or month because of UTC conversion.
- Surplus describes a period calculation without implying that the amount was transferred to savings.
- Retaining the existing widget key avoids an unplanned storage migration.

---

# Decision 008 — EUR Presentation Formatting

**Status:** Accepted

## Decision

Finovo presents every monetary value in EUR. The shared money utility uses the `en-IE` locale so the English interface has consistent euro symbols, grouping and decimal punctuation.

Normal monetary values always show exactly two decimal places. Compact EUR formatting is used only for chart axes, while chart tooltips and all other monetary values remain exact.

This is a presentation decision only. It does not introduce multi-currency support or change transaction amounts, calculations or storage schemas.

## Reason

- EUR is Finovo's first and only presentation currency for the current MVP.
- `en-IE` combines an English-language presentation with native EUR formatting.
- One shared utility prevents currency symbols and decimal precision from drifting between widgets and components.
- Keeping presentation separate avoids coupling a UI change to future money-model or storage work.

---

# Decision 009 — Validated Browser-Local Persistence

**Status:** Accepted

## Decision

For the current MVP, Finovo persists transactions, dashboard widget visibility and responsive layouts in browser `localStorage` using the existing keys:

- `finovo-transactions`
- `finovo-dashboard-widgets`
- `finovo-dashboard-layouts-v2`

Persisted JSON is treated as untrusted input. Each state slice is parsed and runtime-validated independently during lazy client-state initialization. A missing or unusable value falls back to its in-code default. A partially invalid transaction array retains valid entries in their original order and ignores invalid entries; the first valid transaction wins when IDs are duplicated.

Initialization does not write to storage. A missing, invalid, recovered or unavailable payload remains untouched until the user explicitly changes the relevant state slice. A successful user change then stores the current validated state, except dashboard reset deliberately removes the layout key so defaults apply on the next load. Read or write failures keep the application usable in memory and produce a visible warning that changes may be lost on reload.

At the time of this decision, the storage keys, payload shapes, transaction amount representation and widget IDs remained unchanged. Decision 011 later supersedes only the transaction payload-shape portion by introducing versioned writes; the validation, initialization and failure-handling rules remain active.

Browser-local persistence is limited to the current origin and browser profile on the current device. It does not provide authentication, cloud synchronization, cross-device access or backup.

## Reason

- Runtime validation prevents malformed saved data from entering rendering and financial calculations.
- Independent fallback keeps one invalid state slice from preventing other valid state from loading.
- Lazy initialization and explicit user-driven writes prevent defaults or recovered fallbacks from overwriting stored payloads during hydration.
- Retaining the existing keys and payloads preserves compatible user data without an unnecessary migration.
- Explicit browser and device limitations prevent local persistence from being mistaken for durable account storage.

---

# Decision 010 — Explicit Demo Data Boundary

**Status:** Accepted

## Decision

Finovo keeps sample transactions separate from browser-local user transactions. Transaction state has an explicit `demo` or `user` source, and sample rows exist only in the display value of demo state.

A missing `finovo-transactions` key activates the first-visit demo presentation. A valid empty array is intentional user data and remains empty. Valid and partially recovered arrays remain user data after validation. Invalid or unavailable storage produces an empty recovery view with a visible warning instead of showing examples that could hide a data problem.

Earlier versions could persist the known sample seed rows after a transaction action. Exact field-for-field copies of those rows are removed when loading an otherwise valid or recovered user array. A legacy payload containing only exact seed rows is treated as demo data; changed rows are preserved as user data.

The first explicit add, edit or delete action in demo state switches to user state without copying or merging any sample transactions. Deleting all user transactions persists a valid empty array, so a reload remains empty. A failed write leaves the in-memory state in user mode, leaves storage untouched and displays the existing warning that the change may be lost on reload.

Demo values are identified with visible, accessible text. The static net-worth and savings-goal widgets remain labelled as sample examples because Finovo does not yet have account or goal data sources.

At the time of this decision, no initialization write, storage-key rename, payload migration, transaction-model change, widget-ID change or dashboard-layout change was introduced. Decision 011 later adds versioned transaction writes without changing this demo behavior.

Before this boundary, the storage fallback placed sample transactions into ordinary transaction state. Initialization did not save them, but a later add, edit or delete could persist samples alone or mixed with user entries. That behavior is no longer allowed.

## Reason

- Example data must never be mistaken for saved financial information.
- Preserving valid empty datasets respects an explicit user state and prevents deleted data from reappearing.
- Separating samples from user state prevents demonstration values from entering financial history through transaction actions.
- Empty recovery with a warning exposes malformed or inaccessible storage instead of masking possible data loss with plausible values.
- Narrow legacy-seed recognition repairs prior sample persistence without changing the storage schema or discarding edited user records.

---

# Decision 011 — Versioned Transaction Persistence Envelope

**Status:** Accepted

## Decision

New transaction writes use a V1 persistence envelope under the existing `finovo-transactions` key:

```ts
{
  version: 1,
  transactions: Transaction[]
}
```

The persisted envelope is defined separately from the domain transaction model. The storage boundary validates the envelope version and its transaction entries, then continues to return domain `Transaction[]` values to the application.

Existing unversioned transaction arrays remain readable and are not rewritten during initialization. This decision does not introduce automatic legacy migration. The next explicit transaction change uses the current V1 write format through the normal persistence path.

The transaction fields, values, amount representation, storage key, demo behavior and application-facing storage API remain unchanged. Unsupported versions are treated as invalid stored data and follow the existing safe fallback and warning behavior.

## Reason

- An explicit version creates a safe discriminator for future persistence changes.
- Keeping persistence types separate prevents storage metadata from entering the domain transaction model.
- Continuing to read legacy arrays preserves existing user behavior without silently rewriting browser data.
- Centralized validation keeps untrusted stored JSON outside dashboard and financial logic.
- Retaining the existing key avoids an unnecessary second storage location.

---

# Future Decisions

Every significant decision should be added here using the same format.

Examples:

- Database choice
- Authentication provider
- State management
- Banking integrations
- AI architecture
- Premium features

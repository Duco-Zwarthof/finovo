# Finovo Changelog

## Unreleased

### Added

#### Dashboard and transactions

- Added a responsive dashboard with configurable, draggable and resizable widgets.
- Added persistent dashboard widget visibility and responsive layouts.
- Added transaction creation, editing and deletion.
- Added an explicit demo-versus-user transaction boundary.
- Added current-month income, expense, surplus and surplus-rate calculations.
- Added six-month cash-flow aggregation and visualization.
- Added a live monthly-budget dashboard widget.
- Added a live net-worth dashboard widget backed by account data.

#### Money and persistence

- Added canonical whole-cent `amountMinor` values for financial domain data.
- Added centralized EUR formatting and amount-conversion helpers.
- Added versioned, runtime-validated browser-local persistence.
- Added safe handling for missing, malformed, recovered, unsupported and unavailable stored data.
- Added focused tests for money, dates, transactions, storage and financial summaries.

#### Budgeting

- Added monthly category budgets with add, edit and delete flows.
- Added budget validation, duplicate protection and monthly identity rules.
- Added budget progress, remaining amount, usage percentage and status calculations.
- Added monthly budget summaries, unbudgeted spending and category-level progress.
- Added versioned budget storage with validation and recovery behavior.
- Added a responsive Budget page with month selection and storage notices.

#### Accounts

- Added checking, savings, investment and cash account types.
- Added account creation, editing and deletion.
- Added optional inclusion of individual accounts in net-worth calculations.
- Added versioned account storage with runtime validation.
- Added a live Accounts page with account cards, type totals and asset allocation.
- Added a premium accounts overview showing net worth, account count and included-account count.

#### Investments

- Added ETF, stock, crypto, bond, fund and other investment asset types.
- Added holding creation, editing and deletion.
- Added holding cost, current value and unrealized-return calculations.
- Added portfolio cost, value, gain and gain-percentage calculations.
- Added versioned investment storage with runtime validation.
- Added an Investments page with portfolio overview, holdings and an add/edit modal.

#### Navigation and interface

- Added route-aware sidebar navigation for Dashboard, Accounts, Budget and Investments.
- Added hydration-safe loading states for browser-backed pages.
- Added visible notices for storage and recovery conditions.

### Changed

- Renamed the income-minus-expenses metric to monthly surplus and surplus rate.
- Standardized displayed monetary values to EUR with two decimal places.
- Changed successful transaction writes to the versioned V2 persistence format.
- Changed net worth from a static example to an account-backed calculation.
- Changed the Accounts page from a basic list to a consolidated financial overview.

### Fixed

- Fixed monthly calculations so transactions outside the current local calendar month are excluded.
- Prevented malformed or unavailable browser storage from crashing initialization.
- Prevented hidden widgets from losing saved responsive positions.
- Prevented demo transactions from being persisted as user data.
- Preserved intentionally empty stored transaction datasets across reloads.
- Prevented invalid and duplicate budgets, accounts and investment holdings from entering persisted state.

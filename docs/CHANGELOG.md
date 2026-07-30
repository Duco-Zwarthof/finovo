# Finovo Changelog

## Unreleased

### Added

- Added strict local-calendar date utilities and focused unit tests for date and monthly-summary behavior.
- Added centralized exact and compact EUR formatters using the `en-IE` locale.
- Added a centralized, runtime-validated browser-storage boundary with focused recovery and failure tests.
- Added an explicit demo/user transaction-state boundary with focused transition and persistence tests.
- Added visible demo-data disclosure and always-visible sample labels for the net-worth and savings-goal widgets.

### Changed

- Renamed the dashboard's income-minus-expenses metric and percentage to monthly surplus and surplus rate.
- Standardized monetary values across dashboard cards, goals, transactions, filters and charts to EUR with two decimal places.
- Initialized persisted dashboard state lazily and preserved existing local-storage keys and payload shapes.
- Deferred persistence until explicit user changes and added a visible warning for storage recovery or write failures.
- Made sample transactions display-only; the first explicit transaction change now switches to user data without merging in examples.

### Fixed

- Fixed monthly income, expenses, surplus and surplus rate by excluding transactions outside the user's current local calendar month.
- Prevented malformed or unavailable browser storage from crashing dashboard initialization.
- Prevented hidden widgets from losing their saved responsive positions and dimensions during layout updates.
- Resolved the dashboard hydration lint failure without suppressing ESLint rules.
- Prevented demo transactions from being written through transaction add, edit or delete operations.
- Preserved an intentionally empty saved transaction dataset across reloads instead of restoring demo data.

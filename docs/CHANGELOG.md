# Finovo Changelog

## Unreleased

### Added

- Added strict local-calendar date utilities and focused unit tests for date and monthly-summary behavior.
- Added centralized exact and compact EUR formatters using the `en-IE` locale.
- Added a centralized, runtime-validated browser-storage boundary with focused recovery and failure tests.
- Added an explicit demo/user transaction-state boundary with focused transition and persistence tests.
- Added visible demo-data disclosure and always-visible sample labels for the net-worth and savings-goal widgets.
- Added a V1 transaction persistence envelope and a separate persisted transaction model.
- Added focused coverage for legacy transaction migration through add, edit and delete operations, including demo-data and failure boundaries.
- Added a required canonical `amountMinor` domain field with pure whole-cent conversion, validation and compatibility helpers.
- Added a V2 persisted transaction envelope that stores canonical whole-cent `amountMinor` values while retaining V1 reads.

### Changed

- Renamed the dashboard's income-minus-expenses metric and percentage to monthly surplus and surplus rate.
- Standardized monetary values across dashboard cards, goals, transactions, filters and charts to EUR with two decimal places.
- Initialized persisted dashboard state lazily and preserved existing local-storage keys and domain values.
- Deferred persistence until explicit user changes and added a visible warning for storage recovery or write failures.
- Made sample transactions display-only; the first explicit transaction change now switches to user data without merging in examples.
- Changed new transaction writes to use the versioned envelope while keeping legacy arrays readable and untouched during initialization.
- Formalized legacy transaction migration on the next successful user mutation while preserving valid empty data and leaving malformed or unsupported payloads untouched.
- Kept transaction persistence V1 amount-only while deriving cent-accurate domain values at the storage and transaction-input boundaries.
- Changed successful transaction writes to V2; legacy arrays and V1 envelopes migrate only through the existing user-mutation path and remain untouched during initialization.

### Fixed

- Fixed monthly income, expenses, surplus and surplus rate by excluding transactions outside the user's current local calendar month.
- Prevented malformed or unavailable browser storage from crashing dashboard initialization.
- Prevented hidden widgets from losing their saved responsive positions and dimensions during layout updates.
- Resolved the dashboard hydration lint failure without suppressing ESLint rules.
- Prevented demo transactions from being written through transaction add, edit or delete operations.
- Preserved an intentionally empty saved transaction dataset across reloads instead of restoring demo data.

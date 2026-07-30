# Finovo Changelog

## Unreleased

### Added

- Added strict local-calendar date utilities and focused unit tests for date and monthly-summary behavior.
- Added centralized exact and compact EUR formatters using the `en-IE` locale.

### Changed

- Renamed the dashboard's income-minus-expenses metric and percentage to monthly surplus and surplus rate.
- Standardized monetary values across dashboard cards, goals, transactions, filters and charts to EUR with two decimal places.

### Fixed

- Fixed monthly income, expenses, surplus and surplus rate by excluding transactions outside the user's current local calendar month.

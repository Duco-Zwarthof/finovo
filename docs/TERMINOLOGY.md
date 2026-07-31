# Finovo Terminology

> **Version:** 1.0
> **Status:** Active

---

# Reporting Periods

## Current calendar month

The current calendar month starts on the first day of the month and ends on its final day in the user's local calendar. Date-only transaction values use `YYYY-MM-DD` and are not interpreted as UTC timestamps.

---

# Financial Summaries

## Monthly income

The total of income transactions dated within the current calendar month.

## Monthly expenses

The total of expense transactions dated within the current calendar month.

## Monthly surplus

Monthly income minus monthly expenses for the current calendar month.

Monthly surplus is not a savings contribution, savings balance or savings goal.

## Surplus rate

Monthly surplus divided by monthly income, expressed as a percentage. The surplus rate is unavailable when monthly income is zero.

---

# Transaction Amounts

## Transaction amount minor units

`amountMinor` is the canonical domain transaction amount measured in whole euro cents. For example, €12.34 is `1234`. It is always a non-negative safe integer; transaction direction is represented separately by income or expense type.

The euro `amount` field remains temporarily available for backward compatibility, and persisted transaction V1 remains amount-only until a later versioned storage migration.

# Data Sources

## Demo data

Fixed example data shown to demonstrate Finovo. Demo data is visibly labelled, is not the user's financial information and is never persisted or merged into user transaction data.

## User transaction data

Validated browser-local transactions created by the user or retained from existing saved data. An empty user transaction array is a valid intentional dataset and does not activate demo data.

## Demo presentation state

The first-visit presentation used when no transaction value exists in browser storage. Recognized legacy sample-only storage also uses this state. The first explicit add, edit or delete action exits it without copying the example transactions into user data.

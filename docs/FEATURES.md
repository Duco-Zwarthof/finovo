# Finovo Features

> **Version:** 1.0
> **Status:** Active

---

# Purpose

This document provides an overview of every feature in Finovo.

It serves as the central reference for contributors and AI agents.

Before creating a new feature:

- Check if it already exists.
- Check whether it fits the product vision.
- Determine whether an existing feature can be extended instead.

---

# Feature Status Legend

| Status | Meaning |
|---------|---------|
| ✅ | Implemented |
| 🚧 | In Progress |
| 📋 | Planned |
| 💡 | Future Idea |

---

# Dashboard

Status: 🚧

Purpose:

Provide a complete overview of the user's financial situation.

Implemented functionality:

- Current-calendar-month income summary
- Current-calendar-month expense summary
- Monthly surplus and surplus rate
- Transaction-driven financial summaries
- Consistent EUR presentation with two decimal places
- Validated browser-local persistence for transactions, widget visibility and responsive layouts, including a V1 transaction envelope
- Visibly labelled, display-only demo transactions when no saved transaction value exists
- Deterministic separation between demo transactions and browser-local user transactions, including intentional empty datasets

Current limitations:

- Saved data is available only in the current browser profile on the current device; account and cloud synchronization are not implemented.
- Net worth and savings-goal values remain labelled examples because account and goal data sources are not implemented.
- Legacy transaction arrays remain readable without an initialization write and migrate to V1 on the next successful user transaction mutation. Valid empty legacy arrays remain intentional empty user data; malformed and unsupported payloads remain untouched.

Planned functionality:

- Custom dashboard
- Draggable widgets
- Responsive layouts
- Widget resizing
- Personalized dashboard

---

# Budgeting

Status: 📋

Purpose:

Help users understand and control spending.

Features:

- Monthly budgets
- Category budgets
- Budget progress
- Budget history
- Spending alerts
- Budget recommendations

---

# Transactions

Status: 📋

Purpose:

Track income and expenses.

Features:

- Add transactions
- Edit transactions
- Delete transactions
- Categories
- Search
- Filters
- Notes
- Attachments

---

# Savings

Status: 📋

Purpose:

Help users save consistently.

Features:

- Savings goals
- Progress tracking
- Milestones
- Goal projections
- Monthly recommendations

---

# Investments

Status: 📋

Purpose:

Help users understand investment growth.

Features:

- Investment calculator
- Compound growth
- Portfolio overview
- Expected return
- Contribution planner
- Investment projections

---

# Financial Health

Status: 💡

Purpose:

Summarize the user's financial situation.

Potential metrics:

- Surplus rate
- Emergency fund
- Investment growth
- Cash flow
- Budget performance
- Goal completion

---

# AI Coach

Status: 💡

Purpose:

Help users better understand their finances.

Potential capabilities:

- Spending explanations
- Personalized insights
- Financial summaries
- Goal recommendations
- Investment education
- Budget suggestions

AI should explain.

Never replace user decisions.

---

# Widgets

Status: 🚧

Current direction:

Every widget should answer one financial question.

Examples:

- Savings
- Budget
- Investments
- Cash Flow
- Spending Categories
- Monthly Progress
- Goals

Widgets should remain:

- independent
- reusable
- configurable
- responsive

---

# Analytics

Status: 📋

Purpose:

Transform financial data into insights.

Potential features:

- Spending trends
- Income trends
- Net worth growth
- Category comparisons
- Yearly summaries
- Monthly summaries

---

# Notifications

Status: 💡

Potential notifications:

- Budget warnings
- Savings milestones
- Goal completion
- Investment reminders
- Monthly summaries

Notifications should motivate.

Never create unnecessary urgency.

---

# Settings

Status: 📋

Potential features:

- Theme
- Currency
- Language
- Dashboard preferences
- Widget settings
- Notification preferences

---

# Authentication

Status: 📋

Potential features:

- Sign in
- Sign up
- Password reset
- Email verification
- Two-factor authentication

---

# Future Integrations

Status: 💡

Possible integrations:

- Banking APIs
- Investment brokers
- Open Banking
- CSV imports
- Tax reporting
- Export to Excel
- Export to PDF

---

# Feature Requirements

Every feature should:

- improve financial clarity
- solve a real user problem
- align with PRODUCT_PRINCIPLES.md
- follow PROJECT_RULES.md
- integrate naturally with existing functionality

---

# Future Features

Ideas under consideration:

- Subscription tracking
- Bill reminders
- Shared budgets
- Household finances
- Debt payoff planner
- Retirement planner
- Mortgage planner
- FIRE calculator
- Financial calendar
- Credit score tracking
- Net worth tracker
- AI financial planning
- Recurring transaction detection
- Smart spending insights

---

# Final Principle

Features should never exist because they are technically possible.

Features should exist because they meaningfully improve the user's financial life.

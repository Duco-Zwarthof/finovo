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
- savings rate
- investment growth
- budget calculations
- financial health score

---

# State Management

State should remain as local as possible.

Only share state when necessary.

Guidelines:

- Local component state first.
- Shared state second.
- Persistent storage only when valuable.

Avoid unnecessary global state.

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
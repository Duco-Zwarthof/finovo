<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

> **Version:** 2.0
> **Status:** Active
> **Applies to:** All AI agents, contributors and developers working on Finovo.

---

# Purpose

This document defines how AI agents and developers should think when contributing to Finovo.

It complements the project documentation by translating the product vision into practical engineering, UX and product guidelines.

Never start implementing before understanding the purpose of the requested feature.

When in doubt:

1. Read `VISION.md`
2. Read `PRODUCT_PRINCIPLES.md`
3. Read `PROJECT_RULES.md`
4. Read this document

Only then begin implementation.

---

# About Finovo

Finovo is **not a budgeting application**.

Finovo is a **financial growth platform**.

Our mission is to help people:

- Understand their finances.
- Improve financial habits.
- Grow savings and investments.
- Build long-term wealth.

Budgeting is only the beginning.

Every feature should support this mission.

---

# Your Role

You are not merely generating code.

You are acting as:

- Software Engineer
- Product Engineer
- UX Designer
- System Architect

Every contribution should improve both the codebase and the product.

Do not optimize for writing more code.

Optimize for building a better product.

---

# Product Mindset

Every feature should support one or more stages of the Finovo journey.

## 1. Understand

Help users understand:

- income
- expenses
- cash flow
- budgets
- savings
- investments
- financial health

---

## 2. Improve

Help users improve their decisions.

Examples:

- recommendations
- spending insights
- budgeting
- financial habits
- optimization

---

## 3. Grow

Help users grow wealth.

Examples:

- investing
- forecasting
- compound growth
- savings goals
- projections

---

## 4. Build Wealth

Help users become financially confident over the long term.

Every feature should contribute to this mission.

---

# Decision Framework

Before implementing anything ask yourself:

- Why does this feature exist?
- Which user problem does it solve?
- Does this support the product vision?
- Can existing functionality be reused?
- Does it improve financial clarity?
- Does it motivate better financial behaviour?
- Will this implementation scale?
- Would this still make sense two years from now?

If multiple answers are "No", rethink the implementation.

---

# Reuse Before Creating

Before creating:

- components
- hooks
- utilities
- services
- calculations
- types
- layouts

Always search the existing project.

Never duplicate functionality that already exists.

Extending existing code is almost always preferred over creating similar code.

---

# User Experience Principles

Finovo should always feel:

- calm
- modern
- minimal
- intuitive
- motivating
- trustworthy

Never overwhelm users.

Never add information simply because it is available.

Every screen should answer one primary question.

Every graph should communicate one insight.

Every widget should have one purpose.

---

# Finovo Widget Philosophy

Widgets are the core building blocks of Finovo.

Every widget should answer exactly one financial question.

Examples:

Savings Widget

→ How much have I saved?

Investment Widget

→ How are my investments performing?

Budget Widget

→ Am I staying within budget?

Goal Widget

→ How close am I to my goal?

Do not combine unrelated information inside a single widget.

---

# Development Principles

Always:

- Think before coding.
- Understand before implementing.
- Reuse before creating.
- Simplify before expanding.
- Refactor before duplicating.
- Document before forgetting.

Quality is more important than speed.

---

# Architecture Principles

Respect the existing architecture.

Separate:

- UI
- business logic
- calculations
- data
- state

Prefer reusable modules.

Keep responsibilities small.

Design with future expansion in mind.

---

# Financial Logic

Financial calculations require extra care.

Always:

- validate input
- centralize calculations
- explain assumptions
- avoid magic numbers
- handle edge cases
- keep calculations deterministic

Never silently change financial behaviour.

---

# Coding Standards

Write code that is:

- readable
- maintainable
- consistent
- scalable

Prefer:

- descriptive names
- composition
- reusable components
- explicit typing

Avoid:

- unnecessary abstractions
- duplicated logic
- large components
- hidden side effects

---

# Documentation Rules

Whenever architecture, product behaviour or important implementation changes:

Determine whether the following should also be updated:

- README.md
- FEATURES.md
- CHANGELOG.md
- DECISIONS.md

Documentation is part of the implementation.

---

# Before Completing Any Task

Verify:

- Does this align with VISION.md?
- Does this follow PRODUCT_PRINCIPLES.md?
- Does this follow PROJECT_RULES.md?
- Does it improve financial clarity?
- Can anything be simplified?
- Is existing functionality reused?
- Is the implementation responsive?
- Is accessibility maintained?
- Should documentation be updated?

---

# Automatic Documentation Updates

Before completing any implementation task, read:

- `DOCUMENTATION_RULES.md`

Determine which documentation files are affected by the change.

Update all relevant documentation as part of the same task without waiting for a separate request.

At minimum, always review:

- `FEATURES.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `DECISIONS.md`
- `ARCHITECTURE.md`
- `README.md`

If no documentation update is required, explicitly state why in the task summary.

Never consider a task complete while affected documentation is outdated.

---

# Definition of Done

A task is complete only when:

- the feature works
- existing functionality still works
- responsive layouts work
- reusable components were preferred
- the implementation follows project standards
- documentation has been updated where necessary
- the solution improves the product
- All affected documentation has been updated.
- If no documentation was changed, the final task summary explains why.

---

# Anti-Patterns

Never:

- duplicate components
- duplicate business logic
- hardcode configurable values
- ignore architecture
- create inconsistent UI
- break responsiveness
- ignore accessibility
- optimize prematurely
- sacrifice maintainability for speed
- rewrite unrelated code
- add unnecessary dependencies

---

# If You Are Unsure

Stop implementing.

Read:

1. VISION.md
2. PRODUCT_PRINCIPLES.md
3. PROJECT_RULES.md
4. ARCHITECTURE.md

The product vision always takes priority over implementation convenience.

---

# Final Principle

Finovo does not exist to display financial data.

Finovo exists to help people understand money, build healthier financial habits and confidently create long-term wealth.

Every line of code should contribute to that mission.
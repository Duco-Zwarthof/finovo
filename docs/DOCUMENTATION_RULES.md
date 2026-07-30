# Finovo Documentation Rules

> **Version:** 1.0
> **Status:** Active
> **Applies to:** All contributors and AI agents working on Finovo.

---

# Purpose

This document defines when project documentation must be updated.

Documentation updates are part of implementation work.

A task is not complete until the relevant documentation has been reviewed and updated.

---

# General Rule

After every meaningful code or product change, determine which documentation files are affected.

Do not wait for the user to explicitly request documentation updates.

Update the relevant documentation as part of the same task.

Never leave documentation knowingly outdated.

---

# Required Updates

## New Feature

When adding a new feature, update:

- `FEATURES.md`
- `CHANGELOG.md`

Also update when relevant:

- `ROADMAP.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `README.md`

---

## Existing Feature Changed

When changing the behaviour, scope or design of an existing feature, update:

- `FEATURES.md`
- `CHANGELOG.md`

Also update:

- `ARCHITECTURE.md` when the implementation structure changes
- `DECISIONS.md` when an important product or technical choice is made
- `README.md` when usage or setup changes

---

## New Widget

When adding a new dashboard widget, update:

- `FEATURES.md`
- `CHANGELOG.md`

Also document:

- the question the widget answers
- the data it uses
- its configurable behaviour
- its responsive behaviour

Update `ARCHITECTURE.md` if the widget introduces a new technical pattern.

---

## Architecture Change

When changing project structure, data flow, state management, services or shared patterns, update:

- `ARCHITECTURE.md`
- `DECISIONS.md`
- `CHANGELOG.md`

Update `PROJECT_RULES.md` if the change introduces a new permanent engineering rule.

---

## Important Technical Decision

When choosing or replacing a framework, library, service, provider or architectural pattern, update:

- `DECISIONS.md`
- `CHANGELOG.md`

Also update:

- `ARCHITECTURE.md`
- `README.md`
- `PROJECT_RULES.md`

when relevant.

---

## Dependency Change

When adding, replacing or removing an important dependency, update:

- `CHANGELOG.md`
- `DECISIONS.md` if the dependency represents a significant long-term choice
- `README.md` if installation or setup changes

Do not create a decision entry for minor implementation-only dependencies unless they materially affect the architecture.

---

## Setup or Installation Change

When commands, environment variables, prerequisites or configuration change, update:

- `README.md`
- `CHANGELOG.md`

Never leave setup instructions outdated.

---

## Roadmap Change

When product priorities, phases or planned scope change, update:

- `ROADMAP.md`

Also update:

- `FEATURES.md` when feature status changes
- `DECISIONS.md` when the change reflects an important product decision

---

## Feature Status Change

When a feature moves between planned, in progress or implemented, update:

- `FEATURES.md`
- `ROADMAP.md` when the feature appears there
- `CHANGELOG.md` when the change is user-relevant

---

## Product Principle Change

When product philosophy, UX expectations or decision priorities change, update:

- `PRODUCT_PRINCIPLES.md`
- `VISION.md` when the long-term product direction changes
- `AGENTS.md` when agent behaviour must change
- `DECISIONS.md` when the change records an important product decision

---

## AI Agent Rule Change

When instructions for AI agents or contributors change, update:

- `AGENTS.md`
- `PROJECT_RULES.md` when the rule is also an engineering standard
- `CHANGELOG.md` when relevant

---

## Bug Fix

For a minor bug fix, update:

- `CHANGELOG.md` when the fix is user-visible or important

Also update documentation when the bug revealed that current documentation was incorrect.

A minor internal fix does not require updates to every document.

---

## Breaking Change

When introducing a breaking change, update:

- `CHANGELOG.md`
- `README.md`
- `FEATURES.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`

Clearly describe:

- what changed
- why it changed
- what users or developers must do
- whether migration is required

---

# Decision Entry Rules

Add an entry to `DECISIONS.md` when a decision:

- affects architecture
- affects long-term maintainability
- changes an important dependency
- changes data storage
- changes authentication
- changes state management
- changes the widget system
- affects security or privacy
- is difficult or expensive to reverse

Do not add entries for trivial styling changes or small implementation details.

---

# Change Log Rules

Use `CHANGELOG.md` for meaningful project changes.

Group changes under:

- Added
- Changed
- Fixed
- Removed
- Security

Write entries from the perspective of what changed in the product or codebase.

Avoid vague entries such as:

- Updated code
- Made improvements
- Fixed some issues

Prefer:

- Added persistent mobile dashboard layouts.
- Centralized compound-interest calculations in the finance utilities.
- Fixed widgets resetting after viewport changes.

---

# Completion Checklist

Before completing any task, verify:

- Does `FEATURES.md` need an update?
- Does `ROADMAP.md` need an update?
- Does `CHANGELOG.md` need an update?
- Does `DECISIONS.md` need an update?
- Does `ARCHITECTURE.md` need an update?
- Does `README.md` need an update?
- Do any project rules or product principles need an update?

If documentation was not updated, briefly state why no update was required.

---

# Final Rule

Documentation is not optional follow-up work.

Documentation is part of the implementation.
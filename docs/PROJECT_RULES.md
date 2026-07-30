# Finovo Project Rules

> **Version:** 1.0
> **Status:** Active

---

# Purpose

This document defines the engineering and implementation rules for Finovo.

Every contribution to the project should follow these rules.

If a change violates these rules, it should be reconsidered before implementation.

---

# 1. General Rules

- Always prefer readability over clever code.
- Keep files small and focused.
- Avoid unnecessary complexity.
- Prefer composition over duplication.
- Build for long-term maintainability.
- Remove dead code.
- Never leave TODO comments without context.

---

# 2. Architecture

- Follow the existing project structure.
- Do not move files without reason.
- Separate UI from business logic.
- Separate calculations from components.
- Use reusable modules whenever possible.

---

# 3. Components

Every component should have one responsibility.

Rules:

- Keep components small.
- Prefer reusable components.
- Avoid deeply nested JSX.
- Extract repeated UI.
- Keep props simple.
- Avoid large components (>250 lines whenever possible).

---

# 4. Styling

Use Tailwind consistently.

Rules:

- Never use inline styles unless necessary.
- Reuse utility patterns.
- Use spacing consistently.
- Prefer design tokens.
- Keep layouts responsive.

---

# 5. State Management

- Keep state as local as possible.
- Avoid prop drilling.
- Lift state only when necessary.
- Persist only important user data.
- Keep localStorage access centralized.

---

# 6. Financial Calculations

Financial calculations are critical.

Rules:

- Never duplicate calculation logic.
- Centralize calculations.
- Document assumptions.
- Avoid magic numbers.
- Always validate user input.
- Handle edge cases.
- Round values consistently.
- Never silently ignore invalid input.

---

# 7. Widgets

Widgets are the core of Finovo.

Rules:

- One widget answers one question.
- Widgets should work independently.
- Widgets must be draggable.
- Widgets must remain responsive.
- Widgets should load quickly.
- Widgets should degrade gracefully.

---

# 8. Dashboard

The dashboard should answer:

"How are my finances today?"

Rules:

- Most important widgets first.
- Support customization.
- Preserve layout.
- Keep information scannable.

---

# 9. TypeScript

Rules:

- Avoid any.
- Prefer explicit types.
- Define interfaces.
- Keep types reusable.
- Avoid duplicated interfaces.

---

# 10. Performance

Rules:

- Lazy load where appropriate.
- Avoid unnecessary renders.
- Memoize expensive calculations.
- Optimize large lists.
- Minimize bundle size.

---

# 11. Accessibility

Rules:

- Semantic HTML.
- Keyboard navigation.
- Proper labels.
- Screen reader support.
- Color-independent indicators.

---

# 12. Documentation

Every significant feature should update:

- FEATURES.md
- CHANGELOG.md
- DECISIONS.md (if architectural)
- README.md (if setup changes)

---

# 13. Testing

Before merging a feature:

- Build succeeds.
- Type checking succeeds.
- No console errors.
- Responsive layouts work.
- Existing functionality still works.

---

# 14. AI Contribution Rules

When implementing a feature, AI should:

1. Understand the problem.
2. Read related documentation.
3. Reuse existing components.
4. Avoid duplication.
5. Explain important architectural decisions.
6. Keep code consistent with existing patterns.
7. Update documentation when necessary.

AI should never:

- Rewrite unrelated code.
- Introduce breaking changes without explanation.
- Ignore project conventions.
- Create duplicate functionality.
- Add unnecessary dependencies.

---

# Definition of Done

A feature is complete only if:

- It solves the intended user problem.
- It follows PRODUCT_PRINCIPLES.md.
- It follows PROJECT_RULES.md.
- The code is clean.
- Documentation is updated.
- It works on desktop and mobile.
- It introduces no known regressions.

---

# Final Rule

Every line of code should make Finovo easier to understand, easier to maintain, or more valuable for its users.

If it doesn't, it probably shouldn't be added.
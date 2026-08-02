# Finovo Roadmap

> **Version:** 2.0  
> **Status:** Active  
> **Current stage:** Local-first alpha

---

# Vision

Finovo aims to become a clear, trustworthy financial platform that helps people understand, manage and grow their finances.

Development remains local-first during the alpha phase. Cloud features, authentication and external financial integrations are intentionally deferred until the product model and security architecture are mature enough.

---

# Guiding Principles

The roadmap prioritizes:

1. Financial clarity
2. Correct calculations
3. Honest data-source labeling
4. Privacy by design
5. Maintainable architecture
6. Useful features before feature volume
7. Gradual movement from local prototype to secure product

---

# Current Product Status

## Implemented

### Dashboard

- ✅ Responsive dashboard
- ✅ Configurable widgets
- ✅ Dragging and resizing
- ✅ Persistent layouts and widget visibility
- ✅ Current-month income, expenses and surplus
- ✅ Six-month cash-flow chart
- ✅ Live budget overview
- ✅ Live account-backed net worth
- ✅ Recent transactions

### Transactions

- ✅ Add, edit and delete
- ✅ Categories
- ✅ Canonical whole-cent amounts
- ✅ Demo-data boundary
- ✅ Versioned local persistence
- ✅ Runtime validation and recovery behavior

### Budgeting

- ✅ Monthly category budgets
- ✅ Add, edit and delete
- ✅ Category progress and statuses
- ✅ Monthly summaries
- ✅ Unbudgeted spending detection
- ✅ Dashboard integration
- ✅ Versioned local persistence

### Accounts

- ✅ Checking, savings, investment and cash accounts
- ✅ Add, edit and delete
- ✅ Include or exclude from net worth
- ✅ Net-worth calculation
- ✅ Totals by account type
- ✅ Asset allocation
- ✅ Dashboard integration
- ✅ Versioned local persistence

### Investments

- ✅ ETF, stock, crypto, bond, fund and other holdings
- ✅ Add, edit and delete
- ✅ Cost, value and unrealized gain calculations
- ✅ Portfolio totals and return percentage
- ✅ Versioned local persistence
- ✅ Initial Investments page and holding cards

---

# Phase 1 — Alpha Foundation

**Goal:** Complete a stable, local-first personal-finance product.

## Current priorities

- 🚧 Shared hooks for hydration and browser-backed state
- 🚧 Shared storage-status and notice helpers
- 🚧 Reduce duplication across Accounts, Budget and Investments routes
- 🚧 Split dashboard configuration and rendering out of `app/page.tsx`
- 🚧 Synchronize architecture, changelog, roadmap and security documentation
- 🚧 Add quality gates for every completed feature batch

## Remaining product work

- Goals and savings-goal data model
- Investment allocation by asset type
- Investment sorting and filtering
- Better empty, loading and error states
- Mobile navigation
- Import and export of local data
- Delete-all-local-data control
- Privacy and local-storage disclosure

---

# Phase 2 — Complete Local MVP

**Goal:** Make Finovo useful as a daily local personal-finance tool.

Planned capabilities:

- Savings goals and progress tracking
- Goal forecasting
- Investment performance history
- Portfolio allocation and filtering
- Monthly reports
- Better dashboard analytics
- CSV import and export
- Local backup and restore
- Settings and privacy controls
- Accessibility and mobile polish

Exit criteria:

- All core calculations covered by focused tests
- No static example value presented as user data
- Shared state and storage patterns used consistently
- Documentation matches the implementation
- Production build passes consistently

---

# Phase 3 — Secure Beta

**Goal:** Introduce optional user accounts and cross-device synchronization.

Planned capabilities:

- Authentication
- Server-side authorization
- Secure session management
- Encrypted transport
- Cloud persistence
- Account-level data isolation
- User data export and deletion
- Audit-friendly storage and migration strategy
- Privacy policy and retention rules

This phase begins only after the security and privacy architecture has been reviewed.

---

# Phase 4 — Connected Finance

**Goal:** Add external integrations without handling bank credentials directly.

Potential capabilities:

- Open-banking provider integration
- Automatic transaction import
- Automatic categorization
- Broker or portfolio imports
- Subscription detection
- Notification rules

External integrations must use regulated or established providers and must not require Finovo to store bank passwords, PINs or full payment-card credentials.

---

# Phase 5 — Financial Intelligence

**Goal:** Turn Finovo into a decision-support platform.

Potential capabilities:

- Financial health score
- Spending forecasts
- Intelligent budgeting suggestions
- Goal probability and scenario modeling
- Mortgage and housing planner
- Retirement and FIRE planning
- Tax estimates
- Personalized insights with transparent assumptions

---

# Prioritization Framework

Features are prioritized using:

1. User value
2. Financial correctness
3. Privacy and security impact
4. Technical dependency
5. Maintainability
6. Simplicity
7. Validation through actual use

A feature should not be prioritized only because it is visually impressive or interesting to build.

---

# Quality Gate

Before merging a completed feature batch:

```bash
npx tsc --noEmit --incremental false
npm test
npm run lint
npm run build
```

The changed functionality must also be checked manually in the browser.

---

# Long-Term Direction

Finovo should grow in deliberate stages:

```text
Local-first alpha
→ Complete local MVP
→ Secure cloud beta
→ Connected finance
→ Financial intelligence platform
```

Each stage must preserve user trust, calculation correctness and clear data ownership.

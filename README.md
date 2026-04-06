# Fintrak — Personal Finance Dashboard

A clean, interactive personal finance dashboard built with React + Vite. Track balances, manage budgets, set savings goals, monitor net worth, and understand spending patterns — with role-based UI, multi-currency support, and a polished design system.

---

## ✨ Feature Overview

### 6 Pages / Sections

| Page | Description |
|------|-------------|
| **Overview** | Summary KPI cards, balance trend chart with time range toggle, spending breakdown donut, recent transactions |
| **Transactions** | Full sortable/filterable table, inline edit & delete (Admin), CSV export, search |
| **Budget Planner** | Monthly category budgets with animated ring progress, over-budget alerts |
| **Goals & Savings** | Financial goals with milestone markers, deadline tracking, contributions |
| **Net Worth** | Assets vs liabilities, trend chart, CRUD for individual items |
| **Insights** | Contextual spending alerts, monthly comparison chart, category progress bars |

### Core Functionality
- **Role-Based UI** — Segmented `Viewer / Admin` toggle. Admins can create, edit, and delete transactions, goals, assets, and liabilities. Viewers get a clean read-only experience.
- **Full CRUD on Transactions** — Add, edit, delete with a validated modal. Inline edit/delete icons appear on row hover (Admin only).
- **Budget Planner** — Set monthly spending limits per category. Animated SVG rings fill as you spend, turning amber at 80% and red when exceeded. Filtered to the current calendar month only.
- **Goals & Savings** — Create financial goals with target amounts, deadlines, icons, and colors. Milestone badges at 25/50/75/100%. Add contributions with live formatted preview. Edit deadlines inline on the card.
- **Net Worth Tracker** — Track assets (cash, investments, property, gold) and liabilities (loans, credit cards). Animated count-up for total net worth. Bar chart shows 12-month trend.
- **Insights** — Auto-generated contextual cards: spending alerts, savings rate, monthly comparison, top category analysis.

### Data & Visualization
- **Balance Trend Chart** — Time range toggle: `1M / 3M / 6M / 1Y`. Smooth monotone area chart with gradient fill. Linear regression forecast shown as a dashed line projecting next month. Click any data point to filter Recent Transactions to that month.
- **Spending Breakdown** — Interactive donut chart. Hover shows category + amount in the center ring. Click any slice or legend row to navigate directly to filtered transactions.
- **Cross-Filtering** — Clicking chart elements (donut slices, trend line points) filters data across the dashboard in real time.
- **Predictive Forecasting** — Linear regression on the selected time range projects next month's income and expenses.

### Utilities
- **Multi-Currency** — Toggle between INR, USD, EUR from the globe icon in the header. All monetary values (cards, charts, tables, goals, net worth) convert live.
- **CSV Export** — Download the currently filtered transaction list at any time. Header export button respects active filters on the Transactions page.
- **CSV Import** — Drag and drop a `.csv` file to bulk-import transactions. Preview table lets you select/deselect individual rows before confirming.
- **Alerts Center** — Bell icon in the header with badge count. Shows budget over-limit warnings, goal deadline alerts, and completion notifications. Dismiss individually or clear all.
- **Dark Mode** — Full dark theme toggle, persisted in localStorage.
- **Data Persistence** — All transactions, budgets, goals, and settings are saved to localStorage via Zustand's `persist` middleware.

### Navigation
- **Slide-in Drawer** — The sidebar is hidden by default on all screen sizes. On tablet and desktop a slim icon rail is always visible on the left for one-click page switching. Clicking the Fintrak logo or the hamburger (mobile) slides the full labeled drawer in. Press `Escape` or click the backdrop to close.

### UI & Animations
- Teal + cool-gray design system (`#007C89` primary, `#F0F4F8` background, `#102A43` text)
- Glassmorphism sidebar with `backdrop-filter: blur`
- Framer Motion staggered entrance animations on all dashboard cards
- Count-up animation on all KPI numbers on page load
- Hover-reveal Edit/Delete icons on transaction rows
- iOS-style segmented control for role and range switching
- Spring-animated pill indicator on range toggle
- Toast notifications (Sonner) for all create/update/delete actions

---

## 🛠 Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| Zustand | 4 | Global state + localStorage persistence |
| Framer Motion | 11 | Animations and transitions |
| Recharts | 2 | Area, bar, donut charts |
| Sonner | 1 | Toast notifications |
| Lucide React | 0.383 | Icon library |
| date-fns | 3 | Date formatting |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/BhavyaParashar-codes/finance-dashboard.git
cd finance-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

### Live Demo 
The project is live and automatically deploys on every push to the main branch via Vercel.

Production URL: https://finance-dashboard-seven-tau-62.vercel.app/

Environment: Production

Routing: SPA routing handled via vercel.json.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx              # App shell — icon rail + slide drawer + main area
│   │   ├── Sidebar.jsx             # Slide-in drawer + permanent icon rail
│   │   └── Header.jsx              # Sticky header — role toggle, currency, alerts, export
│   ├── dashboard/
│   │   ├── Dashboard.jsx           # Overview page
│   │   ├── SummaryCards.jsx        # KPI cards with count-up + Framer Motion stagger
│   │   ├── BalanceTrend.jsx        # Area chart with 1M/3M/6M/1Y toggle + forecast
│   │   ├── SpendingBreakdown.jsx   # Donut chart with center hover display
│   │   └── RecentTransactions.jsx  # Mini list, filtered by selected chart month
│   ├── transactions/
│   │   ├── Transactions.jsx        # Sortable/filterable table with inline CRUD
│   │   └── TransactionModal.jsx    # Add/Edit modal with validation + toast
│   ├── budget/
│   │   └── BudgetPlanner.jsx       # Monthly budget rings per category
│   ├── goals/
│   │   └── GoalsSavings.jsx        # Goal cards, milestones, contributions, deadline edit
│   ├── networth/
│   │   └── NetWorth.jsx            # Net worth display, bar chart, assets/liabilities CRUD
│   ├── insights/
│   │   └── Insights.jsx            # Insight cards, bar chart, category progress bars
│   ├── alerts/
│   │   └── AlertsCenter.jsx        # Bell dropdown with budget + goal alerts
│   └── import/
│       └── CSVImportModal.jsx      # Drag-drop import, preview, row selection
├── data/
│   └── mockData.js                 # 12-month 2026 data, categories, colors
├── hooks/
│   └── useCountUp.js               # rAF-based count-up animation hook
├── store/
│   └── useStore.js                 # Zustand store — all app state + localStorage
├── utils/
│   └── helpers.js                  # Currency conversion, CSV parse/export, filters
├── App.jsx                         # Root — page router + Toaster
├── main.jsx
└── index.css                       # Tailwind base + custom component classes
```

---

## 🔐 Role-Based UI

Switch roles using the `Viewer / Admin` segmented control in the header:

| Feature | Viewer | Admin |
|---------|:------:|:-----:|
| View all pages | ✅ | ✅ |
| Filter & search transactions | ✅ | ✅ |
| Export CSV | ✅ | ✅ |
| Add transaction | ❌ | ✅ |
| Edit transaction | ❌ | ✅ |
| Delete transaction | ❌ | ✅ |
| Import CSV | ❌ | ✅ |
| Add/edit/delete goals | ❌ | ✅ |
| Add contributions to goals | ❌ | ✅ |
| Edit goal deadlines | ❌ | ✅ |
| Add/edit/delete assets & liabilities | ❌ | ✅ |
| Edit category budgets | ❌ | ✅ |

---

## 💱 Multi-Currency

Click the globe icon (🌍) in the header to switch between:

| Currency | Symbol | Rate (approx.) |
|----------|--------|----------------|
| INR (default) | ₹ | 1.00 |
| USD | $ | 0.012 |
| EUR | € | 0.011 |

All amounts — summary cards, chart tooltips, transaction table, budget rings, goals, net worth — convert in real time. The selected currency is persisted in localStorage.

---

## 📥 CSV Import Format

To import transactions, the CSV must have these columns:

```
Date,Description,Category,Type,Amount
2026-04-01,Monthly Salary,Salary,income,88000
2026-04-02,Swiggy Order,Food & Dining,expense,850
```

**Valid categories:** Food & Dining, Shopping, Transportation, Healthcare, Entertainment, Utilities, Salary, Freelance, Investment, Rent

**Type:** `income` or `expense`

Unrecognized categories default to `Food & Dining`. A sample CSV can be downloaded directly from the import modal.

---

## 📐 Design Decisions

- **Typography**: DM Serif Display (logo/display) + DM Sans (body) — authoritative yet approachable. JetBrains Mono for all numeric values for easy scanning.
- **Color palette**: Deep teal `#007C89` for primary actions and trust; cool gray `#F0F4F8` for surfaces; navy `#102A43` for text; turquoise `#81E6D9` for accents.
- **Animation philosophy**: Meaningful entrance animations (stagger on load), purposeful micro-interactions (hover reveals, count-up), no looping or distracting motion.
- **State management**: Zustand over Redux — minimal boilerplate, built-in `persist` middleware, no Provider wrapping needed.
- **Budget scope**: Budget Planner intentionally filters to the current calendar month only, so it always reflects live spending vs your monthly limits.

---

## 🧠 Assumptions & Limitations

- No real backend — all data lives in localStorage via Zustand persist.
- Role switching is a UI simulation only — no authentication or session management.
- Currency conversion rates are hardcoded approximations, not live exchange rates.
- Forecast projections (May–Dec 2026) in `MONTHLY_DATA` are illustrative estimates.
- Percentage trend badges on summary cards are hardcoded for demo purposes.
- The "vs last month" change on Net Worth compares against the second-to-last entry in `netWorthHistory`, not live calculations.

---

## 📄 License

MIT

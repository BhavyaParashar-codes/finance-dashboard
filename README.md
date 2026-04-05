# Fintrak — Finance Dashboard

A clean, interactive finance dashboard built with React + Vite. Track balances, explore transactions, and understand spending patterns — with role-based UI and thoughtful design.

![Fintrak Dashboard](https://via.placeholder.com/1200x630/007C89/FFFFFF?text=Fintrak+Finance+Dashboard)

## ✨ Features

### Core
- **Dashboard Overview** — Summary cards (Balance, Income, Expenses) with count-up animations, area chart for balance trends, donut chart for spending breakdown
- **Transactions** — Full table with search, filter by type/category, column sorting, and hover-reveal action buttons
- **Insights** — Contextual insight cards with actionable suggestions, 3-month bar chart comparison, category progress bars
- **Role-Based UI** — Segmented control toggle (Viewer / Admin). Admins can add, edit, and delete transactions; viewers get a read-only experience with a smooth fade animation on the Add button

### Design Highlights
- Teal + cool-gray color system (`#007C89`, `#F0F4F8`, `#102A43`)
- Glassmorphism sidebar with `backdrop-filter: blur`
- Count-up animation on all KPI values on page load
- Hover reveals "More Options" / Edit+Delete per transaction row
- iOS-style segmented control for role switching
- Staggered entrance animations on cards and nav items
- Fully responsive — collapsible mobile sidebar

### Optional Enhancements Included
- 🌙 **Dark Mode** — toggle in header, persisted in localStorage
- 💾 **Data Persistence** — Zustand + localStorage persist transactions and settings
- 📤 **CSV Export** — download all transactions with one click
- ✨ **Animations** — slide-in, fade-in, count-up, stagger delays throughout

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Zustand | State management + persistence |
| Recharts | Charts (area, donut, bar) |
| Lucide React | Icons |
| date-fns | Date formatting |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/finance-dashboard.git
cd finance-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview  # preview production build locally
```

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) and it auto-deploys on every push.

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx       # Main shell (sidebar + header + main)
│   │   ├── Sidebar.jsx      # Glassmorphism nav sidebar
│   │   └── Header.jsx       # Sticky header with role toggle
│   ├── dashboard/
│   │   ├── Dashboard.jsx    # Dashboard page
│   │   ├── SummaryCards.jsx # KPI cards with count-up
│   │   ├── BalanceTrend.jsx # Area chart
│   │   ├── SpendingBreakdown.jsx # Donut chart
│   │   └── RecentTransactions.jsx # Mini transaction list
│   ├── transactions/
│   │   ├── Transactions.jsx # Full transaction table
│   │   └── TransactionModal.jsx # Add/Edit modal
│   └── insights/
│       └── Insights.jsx     # Insights cards + charts
├── data/
│   └── mockData.js          # Static mock data
├── hooks/
│   └── useCountUp.js        # Count-up animation hook
├── store/
│   └── useStore.js          # Zustand global store
├── utils/
│   └── helpers.js           # Formatting and filter utilities
├── App.jsx
├── main.jsx
└── index.css
```

## 🔐 Role-Based UI

Switch roles using the segmented control in the top-right header:

| Feature | Viewer | Admin |
|---------|--------|-------|
| View dashboard | ✅ | ✅ |
| View transactions | ✅ | ✅ |
| Filter & search | ✅ | ✅ |
| Add transaction | ❌ | ✅ |
| Edit transaction | ❌ | ✅ |
| Delete transaction | ❌ | ✅ |

## 📐 Design Decisions

- **Typography**: DM Serif Display (headings) + DM Sans (body) — authoritative yet approachable
- **Colors**: Deep teal primary for trust; cool grays for calm; turquoise accents for energy
- **Animation philosophy**: Entrance animations on load, hover micro-interactions, no distracting looping animations
- **State**: Zustand chosen for its minimal boilerplate and built-in `persist` middleware — no Redux overhead for a dashboard this size

## 🧠 Assumptions Made

- Data is mocked for June 2025 with realistic INR amounts
- "Monthly comparison" compares to the previous month's hardcoded baseline
- Percentage trends on summary cards are illustrative (hardcoded for demo)
- No authentication — role switching is purely a UI simulation

## 📄 License

MIT

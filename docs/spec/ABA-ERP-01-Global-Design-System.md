# BuyNaija ERP — Document 1: Global Design System & Application Shell

**Status:** Draft v1 for approval · **Audience:** Frontend developers, QA, product
**Stack assumed:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui-style primitives, TanStack Query, React Hook Form + Zod, Recharts.
**Series:** Doc 1 Design System (this) · Doc 2 Core Modules · Doc 3 Operations & Finance · Doc 4 Referrals, Reporting & Admin · Doc 5 Cross-Module Workflows

> **Note on existing-app mapping (Brief §19):** This document defines the _target_. The "Existing vs Target" table in §17 is a template to be filled from a route/component audit of `apps/web`. Until that audit is supplied, statements about what already exists are marked **[AUDIT]**.

---

## 1. Brand & Visual Direction

| Attribute    | Decision                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| Personality  | Reliable, precise, calm. A tool people use for 8 hours, not a marketing site.                                         |
| Visual style | Clean flat surfaces, thin borders, restrained shadows, one strong brand color used sparingly.                         |
| Density      | **Comfortable-compact.** 40px default control height, 44px table rows (36px in "compact" toggle).                     |
| Approach     | **Desktop-first** for ERP/admin/finance screens; **mobile-first** for Merchant POS and customer account pages.        |
| Hierarchy    | Page title > section heading > card heading > label > body. Color signals meaning (status, action), never decoration. |
| Voice        | Plain business English. Verbs on buttons ("Approve payout", not "Submit"). Amounts always with currency symbol.       |

**UX principles**

1. One primary action per screen region.
2. Every list row is clickable through to a detail page; every detail page links to its related records (order → customer → payments → inventory movements).
3. Never destroy silently: destructive/financial actions need confirmation and are audit-logged.
4. Status is always a badge, never plain text.
5. Cross-module links are first-class: a Commission row links to its Referral, Order and Payout.
6. Every screen must define loading, empty, error, and no-permission states (§12).
7. Money is displayed in **₦ (NGN)** by default, tabular numerals, right-aligned; store amounts as integer minor units (kobo) in the API layer.

---

## 2. Color System

Implement as CSS variables (`:root` and `.dark`) mapped into Tailwind theme tokens. **Never use raw hex in components.**

### 2.1 Brand

| Token         | Hex       | Usage                              |
| ------------- | --------- | ---------------------------------- |
| `--brand-50`  | `#EEF4FF` | Selected row bg, subtle highlights |
| `--brand-100` | `#DCE8FF` | Hover on selected, chips           |
| `--brand-500` | `#2F6BFF` | Links, focus ring base             |
| `--brand-600` | `#1F55E0` | **Primary buttons**, active nav    |
| `--brand-700` | `#1843B3` | Primary hover/pressed              |
| `--brand-900` | `#0F2A6B` | Rare: dark headers                 |

> If the client supplies brand colors, replace only the `--brand-*` scale; everything else stays.

### 2.2 Neutrals (slate)

| Token             | Hex       | Usage                                             |
| ----------------- | --------- | ------------------------------------------------- |
| `--bg`            | `#F6F7F9` | App background                                    |
| `--surface`       | `#FFFFFF` | Cards, tables, modals                             |
| `--surface-2`     | `#F1F3F6` | Table header, input disabled, zebra hover         |
| `--border`        | `#E3E6EB` | Default borders/dividers                          |
| `--border-strong` | `#C9CED6` | Input border, focused-neighbor                    |
| `--text`          | `#111827` | Primary text                                      |
| `--text-muted`    | `#5B6472` | Secondary text, labels (4.6:1 on white)           |
| `--text-subtle`   | `#8A93A0` | Placeholders, captions (large/non-essential only) |
| `--sidebar-bg`    | `#0F172A` | Sidebar                                           |
| `--sidebar-text`  | `#CBD5E1` | Sidebar items                                     |

### 2.3 Semantic

| Meaning             | Text/Icon | Background | Border    |
| ------------------- | --------- | ---------- | --------- |
| Success             | `#15803D` | `#ECFDF3`  | `#ABEFC6` |
| Warning             | `#B45309` | `#FFFAEB`  | `#FEDF89` |
| Error / Destructive | `#B42318` | `#FEF3F2`  | `#FECDCA` |
| Info                | `#175CD3` | `#EFF8FF`  | `#B2DDFF` |
| Neutral             | `#475467` | `#F2F4F7`  | `#E4E7EC` |

### 2.4 Interaction states

| State            | Rule                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Primary action   | `brand-600` bg, white text                                                                      |
| Secondary action | white bg, `border-strong`, `text`                                                               |
| Ghost/tertiary   | transparent, `text-muted`, hover `surface-2`                                                    |
| Destructive      | `error` bg for confirm buttons only; outline-red for triggers                                   |
| Hover            | Buttons: one step darker; rows: `surface-2`                                                     |
| Selected         | `brand-50` bg + 2px `brand-600` left indicator (nav/rows)                                       |
| Focus            | 2px `brand-500` ring, 2px offset — **always visible on keyboard focus**                         |
| Disabled         | 50% opacity, `cursor-not-allowed`, no hover; add tooltip explaining why when permission-related |

### 2.5 Status color map (single source of truth)

| Color   | Statuses across modules                                                                 |
| ------- | --------------------------------------------------------------------------------------- |
| Neutral | Draft, Inactive, Archived, Closed                                                       |
| Info    | Pending, Submitted, Open, In Review, Processing, Scheduled                              |
| Warning | Awaiting Approval, Partially Received, Partially Paid, On Hold, Low Stock, Overdue-soon |
| Success | Approved, Completed, Paid, Received, Active, Delivered, Reconciled                      |
| Error   | Rejected, Cancelled, Failed, Overdue, Out of Stock, Reversed, Suspended                 |

Implement one `statusMap.ts`: `{ [domain]: { [status]: { label, tone } } }`. `<StatusBadge domain="order" status="partially_paid" />` reads from it. **No module may define its own badge colors.**

### 2.6 Chart palette

Series order: `#2F6BFF`, `#12B76A`, `#F79009`, `#7A5AF8`, `#06AED4`, `#F04438`, `#667085`. Max 7 series; group remainder into "Other". Always pair color with legend labels/patterns (not color alone).

### 2.7 Dark mode

Out of scope for v1, but tokens must be variable-based so it can be added. POS may add a high-contrast theme later.

---

## 3. Typography

**Font:** Inter (variable) via `next/font`, fallback `system-ui, sans-serif`. Numeric columns use `font-variant-numeric: tabular-nums`. Mono (`JetBrains Mono`) for IDs, SKUs, referral codes, reference numbers.

| Role                 | Size / Line height | Weight | Tracking          | Notes                 |
| -------------------- | ------------------ | ------ | ----------------- | --------------------- |
| Page title (H1)      | 24 / 32            | 600    | -0.01em           | One per page          |
| Section heading (H2) | 18 / 28            | 600    | 0                 |                       |
| Card heading (H3)    | 16 / 24            | 600    | 0                 |                       |
| Sub-heading (H4)     | 14 / 20            | 600    | 0                 | Form group titles     |
| Body                 | 14 / 20            | 400    | 0                 | Default               |
| Body large           | 16 / 24            | 400    | 0                 | Empty-state text, POS |
| Label                | 13 / 18            | 500    | 0                 | Form labels           |
| Table header         | 12 / 16            | 600    | 0.04em, uppercase | `text-muted`          |
| Table cell           | 14 / 20            | 400    | 0                 |                       |
| Caption              | 12 / 16            | 400    | 0                 | Timestamps, meta      |
| Helper text          | 12 / 16            | 400    | 0                 | `text-muted`          |
| Error text           | 12 / 16            | 500    | 0                 | `error` color + icon  |
| Button               | 14 / 20            | 500    | 0                 | Sentence case         |
| KPI value            | 28 / 36            | 600    | -0.02em           | tabular-nums          |
| POS total            | 36 / 44            | 700    | -0.02em           | POS only              |

Mobile: H1 becomes 20/28; KPI value 24/32. Minimum body size on mobile is 14px; inputs 16px (prevents iOS zoom).

---

## 4. Spacing System

4px base. Tokens: `1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48`.

| Context                     | Spec                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| Page container              | Max width 1440px, centered; horizontal padding 24px (≥1024), 16px (<768)                 |
| Page header → content       | 24px                                                                                     |
| Between sections            | 24px (32px on dashboards)                                                                |
| Card padding                | 20px (16px on mobile / compact cards)                                                    |
| Card grid gap               | 16px                                                                                     |
| Card header → body          | 16px                                                                                     |
| Form field vertical gap     | 16px; group gap 24px; label→input 6px; input→helper 4px                                  |
| Form columns gap            | 16px                                                                                     |
| Table cell padding          | 12px vertical / 16px horizontal (compact: 8px / 12px)                                    |
| Toolbar (search/filter row) | 12px gap, 16px below                                                                     |
| Modal                       | Padding 24px; header/body gap 16px; footer gap 12px                                      |
| Drawer                      | Padding 24px; sticky footer with 16px padding                                            |
| Sidebar item                | 40px height, 12px horizontal padding, 8px gap icon→label, 2px vertical gap between items |
| Buttons                     | Padding 16px horizontal; icon-text gap 8px; button groups 8px                            |
| Inputs                      | Height 40px (36 compact, 48 POS); horizontal padding 12px                                |

---

## 5. Radius, Shadows & Surfaces

| Element                       | Radius                                    |
| ----------------------------- | ----------------------------------------- |
| Inputs, buttons, selects      | 8px                                       |
| Badges                        | 999px (pill)                              |
| Cards, tables container       | 12px                                      |
| Modals                        | 16px                                      |
| Drawers                       | 16px on the inner edge only               |
| Tooltips, popovers, dropdowns | 8px                                       |
| Avatars                       | 999px (users) / 8px (merchants, products) |

**Shadows:** `sm` `0 1px 2px rgba(16,24,40,.06)` cards on hover/inputs focus-neighbor; `md` `0 4px 12px rgba(16,24,40,.10)` dropdowns/popovers; `lg` `0 16px 40px rgba(16,24,40,.16)` modals/drawers. Cards at rest use **border only, no shadow**.

**Surface hierarchy:** `bg` (canvas) → `surface` (cards, tables) → `surface-2` (headers, wells) → overlays (`surface` + `lg` shadow + 40% black scrim `rgba(15,23,42,.4)`).

---

## 6. Application Shell

```
┌───────────┬──────────────────────────────────────────────┐
│           │ Header (64px): breadcrumbs · search · actions │
│  Sidebar  ├──────────────────────────────────────────────┤
│  (256px)  │ Page header: title · description · actions    │
│           │ Page content (scrolls)                        │
└───────────┴──────────────────────────────────────────────┘
```

Only the content area scrolls; sidebar and header are fixed. Next.js: `app/(erp)/layout.tsx` renders `<AppShell>`; POS uses separate `app/(pos)/layout.tsx`; auth pages use `app/(auth)/layout.tsx`.

### 6.1 Sidebar

**Widths:** Expanded 256px · Collapsed 72px (icons + tooltip on hover) · Mobile: off-canvas drawer, 288px.
**Persistence:** collapsed state saved in `localStorage` per user.
**Structure** (improved from the brief to match workflows; ordered by daily frequency):

```text
Dashboard

SALES
├── Orders                 (badge: pending count)
├── Customers
├── Referrals
└── Merchant POS  ↗        (opens /pos, separate layout)

CATALOG
├── Products
├── Categories
├── Merchants
└── Suppliers

SUPPLY CHAIN
├── Procurement            (Purchase Requests · Purchase Orders · Receiving · Supplier Invoices)  (badge: awaiting approval)
├── Inventory              (Stock Levels · Movements · Transfers · Adjustments · Warehouses)      (badge: low-stock)
└── Production             (Production Orders · BOMs · Work in Progress)

MONEY
├── Payments
├── Commissions            (badge: pending approval)
├── Payouts                (badge: pending approval)
└── Finance                (Overview · Ledger · Receivables · Payables · Periods · Reconciliation)

INSIGHTS
└── Reports

ADMINISTRATION
├── Users
├── Roles & Permissions
├── Audit Logs
└── Settings
```

Changes vs. brief: renamed "Operations/Commerce" into workflow-aligned groups; **Categories** made explicit; **Stock Transfers** moved under Inventory; **Settings** added (tax, currency, numbering, notifications, POS config).

**Rules**

- Group labels: 11px uppercase `--sidebar-text` at 60% opacity; hidden when collapsed (replaced by 1px divider).
- Item: icon (20px, Lucide) + label. Active: `brand-600/20` bg, white text, 2px left bar in `brand-500`. Hover: white 6% bg.
- Nested items expand accordion-style (single-open per group); active child auto-expands its parent. Collapsed mode shows nested items in a flyout popover.
- **Permission-based:** items are rendered only if user has `<module>.view`. Empty groups are hidden entirely. Never show disabled nav items.
- **Badges:** pill, `error` for "needs action" counts (overdue/low-stock), `brand` for informational; cap at "99+"; sourced from `GET /nav/counts` polled every 60s and invalidated on relevant mutations.
- Footer: user avatar, name, role, and "Collapse" toggle.

### 6.2 Global Header (64px, white, bottom border)

| Zone   | Content                                                             | Behavior                                                                                                                                                                                                                                   |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Left   | Mobile menu button (<1024), **breadcrumbs**                         | Breadcrumb max 4 levels; middle levels collapse to "…" menu; last item is non-link.                                                                                                                                                        |
| Center | **Global search** (⌘K / Ctrl+K)                                     | Command palette: searches orders (`#`), customers, products (SKU), merchants, suppliers, POs, users. Grouped results; recent searches; arrow-key nav; Enter opens. Min 2 chars, 250ms debounce. Also lists quick actions ("Create order"). |
| Right  | Context selectors, Quick create (+), Help, Notifications, User menu | See below.                                                                                                                                                                                                                                 |

- **Merchant selector** (only for users with multi-merchant scope or platform admin): combobox; choosing "All merchants" or one merchant scopes dashboard, orders, inventory, reports. Persisted in URL query `?merchant=` and store.
- **Business period selector** (dashboard/finance/reports only): presets Today, 7d, 30d, This month, Last month, This quarter, This year, Custom. Persisted in URL `?from=&to=`. Finance pages additionally show the **open financial period** chip.
- **Quick create (+):** menu filtered by permission: New Order, New Customer, New Product, New Purchase Request, New Production Order, Record Payment, Add Expense.
- **Help:** menu → Documentation, Contact support, Keyboard shortcuts.
- **Notifications:** bell with unread count; popover (400px) with tabs _All / Approvals / Alerts_; item = icon, title, description, relative time, unread dot; click marks read and navigates; "Mark all as read"; footer link to `/notifications`.
- **User menu:** avatar, name, role, "My profile", "Security", "Sign out".

**Header adaptation by module**

| Context                      | Changes                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| Dashboard/Reports/Finance    | Shows period selector                                        |
| Inventory/Sales/POS-adjacent | Shows merchant/warehouse selector                            |
| Admin                        | No selectors                                                 |
| Record detail pages          | Breadcrumb ends with record ref (e.g., `Orders / ORD-10482`) |
| POS                          | Header replaced by POS top bar (§14.5)                       |

### 6.3 Page header (below global header)

Title (H1) + optional description (muted) + status badge (detail pages) + right-aligned actions (max 1 primary, ≤2 secondary, rest in "More ⋯" menu). Sticky on scroll for detail pages so status/actions remain visible.

### 6.4 Page templates

| Template             | Structure                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **List**             | Page header → toolbar (search, filters, column toggle, export) → table → pagination                   |
| **Detail**           | Page header (with status + actions) → summary cards row → tabs (Overview, related records, Activity)  |
| **Dashboard**        | Page header + period → KPI row → chart grid → tables/alerts                                           |
| **Form (full page)** | Page header → form sections in cards (max width 880px) → sticky footer (Cancel / Save draft / Submit) |
| **Report**           | Filter bar → summary KPIs → chart → table → export                                                    |
| **Settings**         | Left sub-nav (240px) + content card                                                                   |

Grids: 12 columns, 16px gutter. KPI cards span 3 columns (4 across ≥1280, 2 across 768–1279, 1–2 across mobile).

---

## 7. Navigation & Information Architecture

### 7.1 URL convention

`/{module}` list · `/{module}/new` create · `/{module}/[id]` detail · `/{module}/[id]/edit` · `/{module}/[id]?tab=payments` tabs via query. Filters, sort, page, search are in the URL query so views are shareable and back-button safe.

### 7.2 Interconnected navigation rules

- Every ID/name reference in any table or detail page is a link (`<EntityLink type="customer" id />`), rendered in `brand-600`, with hover-card preview (name, status, key metric) after 400ms.
- Detail pages include a **"Related" tab or panel** listing linked records across modules.
- Post-action navigation: after creating a record, go to its detail page with a success toast; after approve/reject, stay in place and refresh.

### 7.3 Role model (summary; full matrix in Doc 4)

Super Admin · Admin · Finance Manager · Accountant · Procurement Officer · Inventory Manager · Production Manager · Sales Manager · Merchant Owner · Merchant Staff/Cashier · Referrer/Customer (customer portal) · Auditor (read-only).
Permission keys: `<module>.<action>` with actions `view, create, edit, delete, approve, export, process, cancel, refund, settings`. Frontend exposes `usePermission('orders.refund')` and `<Can perm="orders.refund">…</Can>`; the API remains the authority.

---

## 8. Dashboard Design (Main ERP dashboard)

**Route:** `/dashboard` · **Permission:** `dashboard.view` (widgets individually gated by underlying module view permission) · **Period:** header selector, default Last 30 days, compared to previous equal period.

### 8.1 KPI cards

Anatomy: icon (32px tinted circle) · label (13px muted) · value (28px) · trend chip (▲/▼ % vs previous period, green/red; for cost-type metrics like Pending Payouts, up = red) · supporting text (caption) · sparkline (optional, 7 pts). Entire card is a link. Loading: skeleton. Error: small "Couldn't load · Retry" inside card.

| KPI               | Value                                         | Supporting text          | Click →                            |
| ----------------- | --------------------------------------------- | ------------------------ | ---------------------------------- |
| Total Sales       | Sum of completed order totals                 | "{n} orders"             | `/orders?status=completed&from&to` |
| Revenue           | Recognized revenue (net of returns/discounts) | "Gross ₦x"               | `/finance?tab=revenue`             |
| Orders            | Count                                         | "{n} pending"            | `/orders`                          |
| Customers         | Total active                                  | "+{n} new"               | `/customers?sort=newest`           |
| Inventory Value   | Qty × avg cost                                | "{n} SKUs low stock"     | `/inventory?tab=valuation`         |
| Pending Payments  | Sum of unpaid/partially paid orders           | "{n} overdue"            | `/payments?status=pending`         |
| Pending Payouts   | Sum awaiting approval/processing              | "{n} requests"           | `/payouts?status=pending`          |
| Procurement Value | Sum of POs issued                             | "{n} awaiting approval"  | `/procurement/purchase-orders`     |
| Production Output | Units finished                                | "{n} orders in progress" | `/production`                      |
| Commissions       | Generated in period                           | "₦x pending approval"    | `/commissions`                     |
| Profit / Loss     | Revenue − COGS − expenses                     | "Margin x%"              | `/finance/reports/profit-and-loss` |

Show 8 by default in two rows; role decides which (Sales Manager: sales/orders/customers/commissions; Finance: revenue/pending payments/payouts/P&L; Merchant: own sales/orders/stock/commissions). "Customize" is a v2 item.

### 8.2 Charts (grid below KPIs, 2 columns ≥1280, 1 column below)

| Chart                      | Type                                                                          | Data             | Controls              | Tooltip                                            |
| -------------------------- | ----------------------------------------------------------------------------- | ---------------- | --------------------- | -------------------------------------------------- |
| Sales over time            | Area+line, current vs previous period dashed                                  | Sales per bucket | Day/Week/Month toggle | Date, sales, orders, AOV, Δ vs previous            |
| Revenue vs Expenses        | Grouped bars + profit line                                                    | Monthly          | Period                | Revenue, expenses, profit                          |
| Orders by status           | Donut with center total                                                       | Count by status  | —                     | Status, count, % ; click segment → filtered orders |
| Sales by product (Top 10)  | Horizontal bar                                                                | Revenue          | Revenue/Units toggle  | Product, units, revenue, share                     |
| Sales by merchant (Top 10) | Horizontal bar                                                                | Revenue          | —                     | Merchant, revenue, orders                          |
| Inventory movement         | Stacked bars (In: procurement, production, returns / Out: sales, adjustments) | Units per bucket | Warehouse select      | Per category units                                 |
| Procurement trend          | Line                                                                          | PO value + count | Supplier select       | Value, count                                       |
| Production output          | Column + line (planned vs actual)                                             | Units            | Product select        | Planned, actual, yield %                           |
| Commission trend           | Stacked area (Pending/Approved/Paid)                                          | Amount           | —                     | Per state                                          |
| Customer growth            | Line (cumulative) + bars (new)                                                | Customers        | —                     | New, total                                         |
| Payment trends             | Stacked bars by method (Cash, Transfer, Card, Wallet)                         | Amount           | —                     | Per method                                         |

Behavior: hover crosshair tooltip; click on a data point/segment navigates to the pre-filtered list; legend toggles series; each chart card has a "⋯" menu (Download PNG, Export CSV, View report). Empty: "No data for this period" with muted axes. Skeleton while loading. Charts lazy-load below the fold (`next/dynamic`).

### 8.3 Other dashboard sections

- **Action Center** (right column ≥1280): Pending approvals grouped (PRs, POs, commissions, payouts, refunds), each row: title, requester, age, "Review" button; low-stock alerts; overdue supplier invoices; failed payments; open POS sessions past 24h.
- **Recent orders** table: last 10; columns Order #, Customer, Merchant, Total, Payment status, Status, Date; row → detail; "View all".
- **Recent activity** feed: last 10 audit entries the user may view.

---

## 9. Layout of Global Patterns

### 9.1 Modals vs Drawers vs Pages — decision rule

| Use                               | When                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| **Confirm dialog** (400px)        | Yes/no on an action, ≤1 optional reason field                                            |
| **Modal** (480/640px)             | Short form ≤5 fields, single step                                                        |
| **Drawer** (right, 480/640/800px) | Quick view/edit of a record, filters panel, record preview from tables, 6–12 fields      |
| **Full page**                     | Anything with line items, multiple sections, or >12 fields (orders, POs, BOMs, products) |

Rules: focus trapped; `Esc` closes unless form dirty (then confirm "Discard changes?"); scrim click closes only non-dirty view-only overlays; return focus to trigger; footer has primary action right, Cancel left of it; loading state disables actions and shows spinner in primary button; server error appears as inline Alert at top of body; success closes overlay + toast. Max one modal at a time; confirm dialogs may stack over drawers.

### 9.2 Confirmation dialogs

- **Standard:** title (action as question), one sentence of consequence, Cancel + confirm button (verb, e.g., "Cancel order").
- **Destructive:** red confirm button; for irreversible or financial actions (delete, reverse commission, refund, approve payout, close period) require **typed confirmation** or mandatory **reason** (min 10 chars), depending on severity: Delete/close period = type record ref; refund/reversal/rejection = reason.

### 9.3 Notifications system

| Type                                 | Component                                                 | Duration                 | Position                         |
| ------------------------------------ | --------------------------------------------------------- | ------------------------ | -------------------------------- |
| Success                              | Toast                                                     | 4s                       | Top-right (bottom-center mobile) |
| Info                                 | Toast                                                     | 5s                       | same                             |
| Warning                              | Toast                                                     | 8s, dismissible          | same                             |
| Error                                | Toast (persistent until dismissed) with "Retry"/"Details" | —                        | same                             |
| Blocking/page-level                  | Inline Alert (banner)                                     | persistent               | Top of content/form              |
| System (maintenance, period closing) | Full-width banner under header                            | until dismissed/resolved |                                  |

Max 3 stacked; identical messages deduped. Toast copy: `{Record} {action}` e.g., "Purchase order PO-2041 approved." Error copy: what failed + what to do next; show API `requestId` in "Details".
Channels (email/SMS/push) are defined per module in Docs 2–4; frontend responsibility is the **preferences UI** (Settings → Notifications: matrix of event × channel).

---

## 10. Reusable Component Library

Location: `src/components/ui` (primitives), `src/components/patterns` (composed), `src/features/<module>` (module-specific only if reused nowhere else). **No feature may re-implement a component below.** File cap per project convention: ≤250 lines per file.

### 10.1 Primitives

| Component                          | Variants                                                                                                 | States                                               | Key props                                         | Behavior / responsive                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Button**                         | primary, secondary, ghost, destructive, link; sizes sm(32)/md(40)/lg(48) ; icon-only                     | default, hover, focus, active, loading, disabled     | `variant,size,loading,leftIcon,rightIcon,asChild` | Loading keeps width, shows spinner; icon-only requires `aria-label`; full-width on mobile forms                  |
| **Input**                          | text, email, password (toggle), number, currency (₦ prefix, thousand separators), phone (+234), textarea | default, focus, error, disabled, readOnly            | `label,helperText,error,prefix,suffix,maxLength`  | Error shows icon + message linked via `aria-describedby`                                                         |
| **Select**                         | native (mobile), custom                                                                                  | open, error, disabled                                | `options,value,placeholder`                       | ≤7 options use Select; more use Combobox                                                                         |
| **Combobox**                       | single, multi (chips), async search, creatable                                                           | loading, empty ("No results"), error                 | `loadOptions(query),debounce,onCreate`            | Async entity pickers: Customer, Product, Supplier, Merchant, Warehouse, User. Shows secondary text (SKU, phone). |
| **DatePicker / DateRangePicker**   | single, range with presets                                                                               | disabled dates, error                                | `min,max,presets`                                 | Format `DD MMM YYYY`; stores ISO; range picker shows 2 months ≥768, 1 month below; typed input supported         |
| **SearchInput**                    | default                                                                                                  | typing, loading, has-value (clear ✕)                 | `onSearch,debounce=300`                           | `/` focuses it on list pages                                                                                     |
| **Checkbox / Radio / Switch**      | —                                                                                                        | checked, indeterminate, disabled                     |                                                   | 44px hit area on touch                                                                                           |
| **Badge / StatusBadge**            | tone: neutral/info/success/warning/error; with dot                                                       | —                                                    | `domain,status`                                   | Always via status map (§2.5)                                                                                     |
| **Avatar**                         | user (initials fallback), merchant/product (square)                                                      | sm/md/lg; group (+N)                                 |                                                   | Deterministic color from name hash                                                                               |
| **Tabs**                           | line (page), pill (in card)                                                                              | active, disabled, with count                         | `tabs[{key,label,count}]`                         | Synced to `?tab=`; scroll horizontally on mobile                                                                 |
| **Dropdown menu**                  | action menu, user menu                                                                                   |                                                      | items with icon, danger item                      | Keyboard: arrows, type-ahead                                                                                     |
| **Tooltip**                        | —                                                                                                        | —                                                    | `content,side`                                    | 300ms delay; not for essential info; not on touch                                                                |
| **Popover / HoverCard**            | —                                                                                                        | —                                                    |                                                   | Entity previews                                                                                                  |
| **Alert**                          | info/success/warning/error                                                                               | dismissible                                          | `title,description,action`                        | Persistent, inline                                                                                               |
| **Toast**                          | 4 tones                                                                                                  |                                                      | `title,description,action`                        | See §9.3                                                                                                         |
| **Modal / Drawer / ConfirmDialog** | sizes sm/md/lg                                                                                           | open, submitting                                     | `title,description,footer,onClose,dirty`          | Drawer becomes full-screen sheet <768                                                                            |
| **FileUploader**                   | dropzone; single/multi                                                                                   | idle, dragover, uploading (progress), success, error | `accept,maxSizeMB,maxFiles,onUpload`              | Docs: PDF/JPG/PNG ≤10MB; shows file list with remove; mobile: "Take photo"                                       |
| **ImageUploader**                  | avatar, product gallery (drag reorder, first = primary)                                                  |                                                      | `aspect,min dimensions`                           | Crop for avatar; ≤2MB per product image recommended                                                              |
| **Skeleton**                       | text, card, table-row, chart                                                                             | —                                                    |                                                   | Match final layout dimensions to prevent shift                                                                   |
| **Spinner / ProgressBar**          |                                                                                                          |                                                      |                                                   |                                                                                                                  |
| **Breadcrumbs, Pagination**        |                                                                                                          |                                                      |                                                   | Pagination: page size 10/25/50/100, "Showing 1–25 of 1,204"; mobile: prev/next only                              |

### 10.2 Composed patterns

| Component                                  | Purpose & content                                                                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **PageHeader**                             | Title, description, badges, actions, breadcrumbs slot                                                                                                                                            |
| **KpiCard**                                | See §8.1; props `label,value,format,delta,deltaTone,helper,icon,href,loading`                                                                                                                    |
| **StatCardGroup**                          | Responsive KPI grid                                                                                                                                                                              |
| **DataTable**                              | See §11                                                                                                                                                                                          |
| **FilterBar / FilterDrawer**               | Inline filters (≤4) + "More filters" drawer; active filters shown as removable chips; "Clear all"; count badge on button                                                                         |
| **ChartCard**                              | Title, subtitle, range/granularity controls, "⋯" menu, chart, legend, loading/empty/error                                                                                                        |
| **Timeline**                               | Vertical list: dot (tone by event), title, actor, timestamp, optional detail; used for order/PO/production/payout lifecycles; latest first (activity) or chronological (lifecycle) — set by prop |
| **ActivityFeed**                           | Audit-backed list with actor avatar, verb phrase, entity link, relative time                                                                                                                     |
| **DescriptionList**                        | Label/value pairs, 2-col grid, used for summaries; copy button for IDs                                                                                                                           |
| **EntityLink / EntityCard**                | Cross-module link with hover preview                                                                                                                                                             |
| **AmountText**                             | Formats money, tabular, negative in red with parentheses option for finance                                                                                                                      |
| **LineItemsEditor**                        | Editable table for order/PO/BOM/production lines: product combobox, qty, unit price, discount, tax, line total; add/remove rows; keyboard-friendly; totals footer                                |
| **ApprovalPanel**                          | Shows approval chain (steps, approver, status, comment, time) + Approve/Reject actions when user is current approver                                                                             |
| **StepIndicator**                          | Horizontal stepper for lifecycle status (Draft → Approved → Ordered → Received)                                                                                                                  |
| **EmptyState / ErrorState / NoPermission** | See §12                                                                                                                                                                                          |
| **ConfirmProvider (`useConfirm`)**         | Promise-based confirm dialog hook                                                                                                                                                                |
| **ExportMenu**                             | CSV / Excel / PDF; respects current filters; large exports (>10k rows) queue async job with notification                                                                                         |
| **CommandPalette**                         | Global search                                                                                                                                                                                    |

---

## 11. Data Tables

Single `DataTable` (TanStack Table) used by **every** list. Server-side pagination/sorting/filtering by default.

**Anatomy:** toolbar → (selection bar when rows selected) → table → footer (pagination). Container has border, 12px radius, sticky header, horizontal scroll with sticky first column (identifier) and sticky last column (actions).

**Column config** (declarative): `{ id, header, accessor, type: text|number|money|date|status|entity|avatar|actions, sortable, filterable, width, align, hideBelow: 'md'|'lg', defaultVisible }`. Money/number right-aligned; dates `DD MMM YYYY, HH:mm` (relative in tooltip); status = badge; entity = link; long text truncated with tooltip.

**Behaviors**
| Feature | Spec |
|---|---|
| Sorting | Click header cycles asc → desc → none; single-column default, indicator arrow; server param `sort=field:dir` |
| Search | Toolbar input, debounced 300ms, `q=` param; highlights not required |
| Filters | Status (multi), date range, entity pickers, numeric ranges; URL-synced |
| Pagination | Server `page,pageSize`; cursor pagination allowed for ledger/audit (`cursor`) |
| Column visibility | "Columns" popover; persisted per user per table id (`table:<id>:columns`) |
| Density | Comfortable/Compact toggle, persisted |
| Row selection | Checkbox column; header checkbox selects page; "Select all {n} matching" banner for cross-page |
| Bulk actions | Appear in selection bar (e.g., Approve, Export, Assign, Deactivate); permission-gated; confirmation for destructive; partial-failure result dialog ("18 succeeded, 2 failed" with reasons) |
| Row actions | Kebab menu (View, Edit, Duplicate, domain actions, Delete last in red); row click = View |
| Export | ExportMenu; file name `{module}-{date}.csv`; exports all filtered rows, not just page |
| Saved views | v2 |

**States:** Loading → 8 skeleton rows; Empty (no records) → EmptyState with primary create action; Empty (no results) → "No results for “{q}”" + "Clear filters"; Error → ErrorState with Retry and requestId; No permission → NoPermission block; refetch in background shows thin top progress bar without clearing rows.

**Mobile (<768):** table converts to **card list**: each row = card with title (identifier + status badge), 2–3 key fields (defined via `mobilePrimary/mobileSecondary`), amount right-aligned, kebab menu; filters open as bottom sheet; pagination becomes "Load more".

**What belongs where:** Tables show identification, status, the 3–6 fields used to triage, amount, and date. Addresses, notes, full line items, timelines, documents, and audit history belong on detail pages.

---

## 12. Empty, Loading, Error & Success States (global)

| State                     | Pattern                                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Empty (first use)         | 48px muted illustration/icon, H3 "No {records} yet", one sentence of value, primary CTA ("Create {record}"), optional secondary (Import, Learn more) |
| Empty (filtered)          | "No results" + active filter chips + "Clear filters"                                                                                                 |
| Loading (page)            | Skeleton matching layout; no spinner-only pages; >10s shows "Still loading…" hint                                                                    |
| Loading (action)          | Button spinner, form disabled; long jobs show progress toast                                                                                         |
| Error (fetch)             | ErrorState: icon, "Something went wrong loading {x}", detail line, **Retry**, requestId (copyable)                                                   |
| Error (network)           | Banner "You appear to be offline" + auto-retry when online                                                                                           |
| 403                       | NoPermission: lock icon, "You don't have access to {module}", "Contact your administrator", link to Dashboard                                        |
| 404 / Deleted record      | "This {record} doesn't exist or was deleted" + back-to-list                                                                                          |
| Action failed             | Toast (error) + inline Alert in dialog/form; form values preserved                                                                                   |
| Success                   | Toast; navigate per §7.2; for irreversible financial actions also show a success confirmation panel with reference number                            |
| Session expired (401)     | Modal "Session expired — sign in again", preserves current URL and returns after login; unsaved form data kept in `sessionStorage` draft             |
| Stale data (409 conflict) | Alert "This record was updated by {user}. Reload to see changes" with Reload button                                                                  |

---

## 13. Forms & Validation

**Stack:** React Hook Form + Zod; one schema per form in `features/<module>/schemas.ts`, shared by create/edit; API error mapper converts `422 { errors: { field: [msg] } }` to field errors.

| Topic             | Rule                                                                                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout            | Single column by default (max 560px in modal/drawer). Full-page forms use 2-column grid (≥1024) for short related fields (first/last name, qty/unit), single column below; long text/textarea and line items span full width. Group into cards with H3 titles. |
| Labels            | Above fields, always visible (no placeholder-as-label). Required marked with red `*` and `aria-required`; optional fields say "(optional)" only when most are required.                                                                                        |
| Placeholders      | Example values only (`e.g. 0803 000 0000`)                                                                                                                                                                                                                     |
| Helper text       | Under field, 12px muted, for format/constraint hints                                                                                                                                                                                                           |
| Validation timing | On blur first; then on change after first error; full validation on submit; focus + scroll to first invalid field; top summary Alert when >3 errors                                                                                                            |
| Messages          | Specific and actionable: "Enter a valid Nigerian phone number (e.g. 0803 000 0000)". Never "Invalid input".                                                                                                                                                    |
| Server errors     | Field errors mapped inline; general errors in Alert at top of form; network error keeps values                                                                                                                                                                 |
| Submit            | Primary button shows loading; double-submit prevented; idempotency key header on payments/payouts/orders                                                                                                                                                       |
| Unsaved changes   | `beforeunload` + in-app route guard "Discard changes?" when dirty                                                                                                                                                                                              |
| Cancel            | Returns to previous page; confirms if dirty                                                                                                                                                                                                                    |
| Drafts            | Documents with lifecycle (PR, PO, Order, Production Order, BOM) support **Save draft** (server-side status `draft`, no validation of optional fields); simple forms don't                                                                                      |
| Dependent fields  | Conditional fields animate in; hidden values cleared and excluded from payload                                                                                                                                                                                 |
| Destructive       | §9.2                                                                                                                                                                                                                                                           |
| Standard formats  | Phone `+234` normalization; email lowercased; money ≥0 with 2 decimals; percent 0–100; SKU uppercase, unique (async check on blur); dates not in past where semantically required                                                                              |

---

## 14. Responsive Behavior

| Breakpoint | Range     | Behavior                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile     | <640      | Off-canvas sidebar; header shows menu, title, notifications, avatar; search is an icon opening full-screen palette; single-column; tables → cards; drawers/modals → full-screen sheets (bottom sheet for pickers/filters); KPI cards 2-up compact or horizontal scroll snap; charts full width, legend below, tooltips on tap; sticky bottom action bar for primary form actions |
| Tablet     | 640–1023  | Sidebar collapsed (72px) by default with overlay expand; 2-column KPI; tables scroll horizontally with sticky first column; drawers 480px                                                                                                                                                                                                                                        |
| Laptop     | 1024–1439 | Sidebar expanded (collapsible); 3–4 KPI across; full tables                                                                                                                                                                                                                                                                                                                      |
| Desktop    | ≥1440     | Content capped at 1440px; action center rail on dashboard                                                                                                                                                                                                                                                                                                                        |

**Touch:** ≥44px targets, no hover-only functionality (hover cards become tap-to-open), swipe-to-open sidebar edge, pull-to-refresh not required. Modals: swipe-down closes bottom sheets.

### 14.5 Merchant POS (separate shell)

Route group `(pos)`; full-screen, no ERP sidebar. Optimized for tablet landscape (primary), phone portrait (secondary), desktop.

- **Top bar (56px):** merchant/shop name, cashier, session status chip (Open since 09:12), online/offline indicator, held orders (count), menu (Returns, Cash in/out, Close session, Exit to ERP).
- **Tablet/desktop layout:** left 62% product area (search/scan bar always focused, category chips, product grid with 96px+ tiles showing name, price, stock chip); right 38% cart panel (customer selector, line items with qty stepper, discount, tax summary, total 36px, big **Pay** button, secondary Hold).
- **Phone:** product grid full width; bottom sticky cart bar (item count + total) opens cart as full-screen sheet.
- Controls sized 48px+; numeric keypad for quantity/cash tendered; barcode scanner via keyboard-wedge input; keyboard shortcuts on desktop (F2 search, F4 pay, F6 hold).
- Detailed POS flows (session open/close, split payment, receipts, returns) are specified in Doc 2.

---

## 15. Accessibility (WCAG 2.1 AA)

| Area             | Requirement                                                                                                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic HTML    | `header, nav, main, aside`, one `h1` per page, real `<table>` with `<th scope>`, lists for nav, `<button>` vs `<a>` used correctly (navigation = link, action = button)                                                                            |
| Keyboard         | Full operability; skip link "Skip to content"; visible focus ring; logical tab order; `Esc` closes overlays; arrow keys in menus/tabs/comboboxes; tables: actions reachable via Tab; shortcuts documented and disable-able                         |
| Focus management | Trap in modals/drawers; restore to trigger on close; move focus to page `h1` on route change; focus first error on submit fail                                                                                                                     |
| Contrast         | Text ≥4.5:1, large text/UI ≥3:1; `text-subtle` never used for essential text; status never color-only (icon + label)                                                                                                                               |
| Screen readers   | `aria-live="polite"` region for toasts, `assertive` for errors; loading regions `aria-busy`; charts have text summary + data table alternative ("View as table"); icon buttons labeled; badges include status text; sorted column uses `aria-sort` |
| Forms            | `<label for>`; errors linked via `aria-describedby` and `aria-invalid`; required via `aria-required`; grouped controls in `fieldset/legend`; autocomplete attributes (`email`, `current-password`, `tel`)                                          |
| Motion           | Respect `prefers-reduced-motion`; transitions ≤200ms                                                                                                                                                                                               |
| Zoom/reflow      | Usable at 200% zoom and 320px width                                                                                                                                                                                                                |
| Testing          | axe in CI on key pages; manual keyboard + VoiceOver/NVDA pass on POS and forms                                                                                                                                                                     |

---

## 16. API-Ready Frontend Architecture

### 16.1 Folder structure (target)

```text
apps/web/src/
  app/
    (auth)/  login, forgot-password, reset-password
    (erp)/   dashboard, orders, customers, products, merchants, suppliers,
             procurement, inventory, production, payments, commissions,
             payouts, finance, referrals, reports, admin/...
    (pos)/   pos/...
  components/ui/          primitives (§10.1)
  components/patterns/    composed (§10.2)
  features/<module>/
    api.ts        // endpoint functions
    types.ts      // domain types
    schemas.ts    // zod
    queries.ts    // query keys + hooks
    mutations.ts  // mutation hooks
    mocks/        // mock handlers + fixtures
    components/   // module-only UI
  lib/ http/, auth/, permissions/, format/, statusMap.ts
  providers/ QueryProvider, AuthProvider, PermissionProvider, ToastProvider
```

### 16.2 API service layer

- Single `http` client (fetch wrapper) with base URL from env, bearer/cookie auth, `requestId` header, JSON error normalization to `ApiError { status, code, message, fieldErrors?, requestId }`, 401 → refresh once → logout, 429 retry-after handling.
- **Standard response envelope:**

```ts
type Paginated<T> = {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};
type Single<T> = { data: T };
```

- Money as `{ amount: number /* minor units */, currency: 'NGN' }`; dates ISO 8601 UTC; IDs are strings; enums are lowercase snake_case matching `statusMap`.
- Endpoint convention: `GET /orders?page&pageSize&q&status&from&to&merchantId&sort`, `GET /orders/:id`, `POST /orders`, `PATCH /orders/:id`, `POST /orders/:id/{action}` for state transitions (`approve, cancel, refund, receive, pay`).

### 16.3 Mock-first strategy

- Every `features/<m>/api.ts` exports functions with the **real signatures**. A single switch `NEXT_PUBLIC_API_MODE=mock|live` selects implementation. Mock layer uses **MSW** (preferred; components stay unaware) or in-memory repositories with `delay(300–800ms)` and random failure injection toggle for testing error states.
- Fixtures typed with the real domain types; cross-referentially consistent (an order's customer exists; commission references real referral/order; inventory movement references PO/order). Requirements per module: ≥40 records for lists (to exercise pagination), all statuses represented, some records with edge cases (long names, zero amounts, partial states), and deterministic seed.
- Mock mutations mutate the in-memory store so flows (create order → stock decreases → payment → finance entry) feel real end to end.

### 16.4 Query & mutation conventions (TanStack Query)

- Key factory: `orderKeys.list(filters)`, `orderKeys.detail(id)`; filters object is part of the key.
- `useOrders(filters)` uses `placeholderData: keepPreviousData` for smooth pagination; `staleTime` 30s lists, 5min reference data (categories, warehouses), 0 for POS stock and finance balances.
- **Mutation invalidation map (cross-module):** e.g. `receiveGoods` invalidates `po.detail, po.list, inventory.*, finance.payables, nav.counts`; `completeOrder` invalidates `orders.*, inventory.*, payments.*, finance.*, dashboard.*, commissions.*`. Maintain this map in one file `lib/invalidation.ts`.
- **Optimistic updates** only for low-risk UI actions (mark notification read, toggle active, column prefs, POS cart). **Never** optimistic for payments, payouts, approvals, refunds, stock changes.
- Error handling: global `onError` shows toast for unexpected errors; forms handle `ApiError.fieldErrors`; `403` redirects to NoPermission; retries: 2 for GET (not for 4xx), 0 for mutations.
- Prefetch detail on row hover (200ms) for tables.

### 16.5 Auth & permission state

- `AuthProvider`: `user, roles, permissions[], merchantScope[], session` from `GET /auth/me`; stored in memory + httpOnly cookie session (preferred) or short-lived token in memory with refresh cookie. No tokens in `localStorage`.
- Route protection via Next.js middleware (redirect to `/login?next=`) and `PermissionProvider` for UI gating (`useCan`, `<Can>`, `<RequirePermission>`). Server data is still authoritative.
- Idle timeout warning at 25 min, auto-logout at 30 min (configurable).

---

## 17. Existing Application Integration Template (fill after audit)

Rules: preserve working screens; migrate them onto the shared tokens/components incrementally (module by module) rather than a big-bang rewrite; do not change URLs without a redirect.

Known from project context: customer portal (`/account/dashboard`), merchant area (`/merchant/dashboard`), admin (`/admin`), public storefront (`/`), converted from an HTML/Bootstrap template. **[AUDIT]** to confirm routes, shared components, and mock data structure.

| Area                     | Existing route/component                                                           | Classification    | Action                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| Storefront               | `/` **[AUDIT]**                                                                    | Retain            | Only align tokens; out of ERP scope                                       |
| Customer portal          | `/account/*` **[AUDIT]**                                                           | Modify            | Adopt PageHeader, StatusBadge, DataTable; keep flows                      |
| Merchant area            | `/merchant/*` **[AUDIT]**                                                          | Modify/Complete   | Merge into `(erp)` with merchant-scoped permissions; POS moves to `(pos)` |
| Admin                    | `/admin/*` **[AUDIT]**                                                             | Modify/Complete   | Restructure to sidebar in §6.1                                            |
| Bootstrap-derived styles | global CSS **[AUDIT]**                                                             | Replace gradually | Map to Tailwind tokens; remove Bootstrap classes per file when touched    |
| Missing modules          | Procurement, Inventory, Production, Finance, Audit, Reports, Suppliers **[AUDIT]** | New               | Build per Docs 2–4                                                        |

Migration order: (1) tokens + primitives, (2) AppShell + navigation, (3) DataTable/FilterBar/PageHeader, (4) migrate existing screens, (5) build new modules in dependency order: Products → Inventory → Suppliers/Procurement → Sales/POS → Payments → Referrals/Commissions/Payouts → Production → Finance → Reports → Audit.

---

## 18. Definition of Done for Any Screen

1. Uses shell, PageHeader, and shared components only.
2. Loading, empty, filtered-empty, error, and no-permission states implemented.
3. Permissions gate nav, page, and each action.
4. Data via `features/<m>/api.ts` + query hooks (mock or live).
5. Filters/sort/pagination in URL.
6. Responsive at 375 / 768 / 1280 verified; keyboard and screen-reader pass.
7. Mutations invalidate per the invalidation map and are audit-relevant events documented.
8. File size ≤250 lines; no duplicated components.

---

_Next: Document 2 — Core ERP Modules (Authentication & Users, Customers, Products, Merchants, Suppliers, Sales & Orders, Merchant POS), each following the 14-part module template from the brief._

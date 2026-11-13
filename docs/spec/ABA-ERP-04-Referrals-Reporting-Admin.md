# BuyNaija ERP — Document 4: Referrals, Reporting & Administration

**Covers:** Referral Management · Reporting & Analytics · Role-based Dashboards · Audit & Activity Tracking · Users, Roles & Permissions (full matrix) · Settings
**Depends on:** Doc 1 (components, DataTable, states), Doc 2 (Customers, Orders, Users basics), Doc 3 (Commissions, Payouts, Finance).
**Conventions:** as in Docs 2–3.

---

# 1. REFERRAL MANAGEMENT

## 1.1 Purpose

Manage the referral network that drives ABA's sales model: codes/links, who referred whom, qualification of referrals, the upline/downline hierarchy, conversion, and performance. Referrals are the **origin** of commissions (Doc 3 §6); this module owns the network and its rules, not the money.

## 1.2 Users

Referrers (customers with portal access), Sales/Partnerships Manager, Admin, Fraud/Compliance reviewer (Finance), Merchants (if merchants can refer).

## 1.3 Permissions

`referrals.view` (own network by default), `referrals.view_all`, `create` (manual link), `edit` (reassign upline, Admin only), `approve` (qualify/disqualify manually), `export`, `settings` (program rules). Reassigning uplines is high-risk: requires reason + approval (see §1.9).

## 1.4 Navigation

```text
/referrals                        Dashboard
/referrals/records                Referral records
/referrals/network                Network explorer (tree)
/referrals/codes                  Codes & links
/referrals/flags                  Suspicious referrals (review queue)
/referrals/settings               Program rules
/referrals/[id]                   Referral detail
Portal: /account/referrals        My referrals   |   /account/referrals/share  Share tools   |   /account/referrals/leaderboard  Top Earners Spotlight
```

## 1.5 Dashboard

KPIs: **Total Referrers, Active Referrers (referred in period), New Referrals, Qualified Referrals, Conversion Rate (referred → qualified), Referral Sales (₦ from referred customers), Commission Generated (link to Commissions)**.
Charts: Referrals over time (bars: new vs qualified), Conversion funnel (Invited/Signed up → Ordered → Paid → Qualified), Top referrers (horizontal bar, toggle by count/sales/commission), Network depth distribution (bar by level), Referral sources/channels (donut: link, code, QR, POS entry).
Sections: Flagged referrals count (link), Pending qualification (waiting for holding/paid trigger), Recent referrals table.

## 1.6 Referral records

- **Search:** referrer, referred customer, phone, code. **Filters:** Status, Referrer, Level (direct/indirect), Source channel, Merchant, Date range, Qualified date, Flagged (yes/no), Has commission.
- **Columns:** Referral #, Referrer (avatar, name, code), Referred customer, Level (relative to root), Source, Date referred, First order (link + value), Qualified date, Commission generated, Status, Flags, Actions.
- **Bulk:** Export; Approve qualification (manual-mode plans); Flag for review.
- **Row actions:** View, View referrer, View referred customer, Qualify/Disqualify (`referrals.approve`), Flag, Reassign upline (Admin).
- **Export:** CSV/Excel.

## 1.7 Referral detail `/referrals/[id]`

Header: Referral #, status, referrer → referred (avatars with arrow). Cards: Referred customer lifetime value, Orders count, Commission generated, Days to first order.
Tabs: **Overview** (how the referral happened: code/link used, channel, device/IP hash, timestamp; qualification rule and evidence: "First order ORD-10482 paid on 12 Sep meets Plan 'Default v3' trigger"), **Orders** (referred customer's orders that generated commissions), **Commissions** (records with per-level split), **Upline chain** (path to root with each beneficiary and level), **Flags & Notes** (fraud signals, reviewer notes), **Timeline**.

## 1.8 Codes & links

Each customer with referral eligibility gets a unique code (`ABA-XXXXXX`, non-guessable, immutable except Admin regenerate). Page lists: Code, Owner, Clicks, Signups, Conversions, Status (Active/Disabled), Created; row actions: Copy link, QR download, Disable/Enable, Regenerate (Admin, confirm; old links keep attribution for 30 days).
**Link format:** `https://{storefront}/r/{code}` → stores attribution cookie/param (30-day window, setting) → on signup/first order attaches referrer.
**Attribution rules:** (1) code entered manually at signup/POS overrides link cookie; (2) first attribution wins — cannot change after first qualified order; (3) self-referral blocked; (4) circular chains blocked (A→B→A).
**Portal share tools:** big copy-link button, QR, WhatsApp/SMS/email share buttons with editable prefilled message, stats (clicks, signups, qualified).

## 1.9 Network explorer

- **Tree view:** root selector (customer combobox; default: current user in portal). Expandable nodes to configured max depth; node = avatar, name, status dot, downline count, personal sales (period), commission contributed. Lazy-load children (`GET /referrals/network?root&depth`). Search within tree; "Focus on this node".
- **List view:** flattened table by level with same columns; export.
- **Summary bar:** total downline, active downline, sales by level, commissions by level.
- **Reassign upline (Admin):** drawer: customer, current upline, new upline, reason\* — shows impact preview ("Affects 14 downline members; 6 pending commissions will be recalculated; paid commissions unaffected"). Blocked if the customer has any qualified order (setting override with dual approval). Loop detection.
- Mobile: tree becomes indented accordion list.

## 1.10 Unattributed Sales & Round-Robin Allocation

Organic or "orphan" signups (users registering or purchasing without a referral code) still generate a commission structure.

- **First-Line Pool:** A configured pool of "first-line" chief promoters (e.g., core shareholders/partners).
- **Round-Robin Assignment:** Unattributed sales are automatically assigned to one of the first-line promoters using a round-robin algorithm.
- **Benefit:** Ensures that all sales contribute to the MLM structure and provides ongoing incentives to the platform's core promoters.

## 1.11 Qualification

Configured in Settings (defaults come from the commission plan's trigger). Referral lifecycle:

```text
Link click/code → Signed up (Registered) → First order placed (Ordered)
→ Payment complete / delivery per rule (Qualified) → Commission engine fires (Doc 3)
Not converting within window → Expired
Fraud check hit → Flagged → Reviewed → Qualified / Disqualified
```

Manual mode: qualification requires `referrals.approve`.

## 1.12 Suspicious referral queue `/referrals/flags`

Signals (auto): same phone/device/IP/bank account as referrer or within chain, burst of signups from one IP, new accounts with immediate orders then refunds, mismatched names on payout bank accounts, unusually high velocity. Each flag has severity (Low/Med/High) and evidence. Actions: **Clear** (note), **Hold commissions** (sets linked commissions `on_hold`), **Disqualify** (reason; cascades commission reversal), **Escalate**. Decisions audited.

## 1.13 Program settings `/referrals/settings`

| Setting               | Options                                                            |
| --------------------- | ------------------------------------------------------------------ |
| Program status        | On/Off                                                             |
| Who can refer         | All customers / Verified customers / Selected groups / Merchants   |
| Max levels tracked    | Number (aligns with commission plan levels)                        |
| Attribution window    | Days                                                               |
| Qualification trigger | Mirrors commission plan (link)                                     |
| Referral expiry       | Days from signup with no order                                     |
| Limits                | Max referrals/day per referrer; block same-device chains           |
| Terms & conditions    | Rich text shown at portal enrollment; versioned; acceptance logged |
| Messaging             | Share message templates, SMS/email templates                       |
| Round-Robin Pool      | Manage the list of "first-line" promoters for unattributed sales   |

## 1.14 Statuses

Registered (info), Ordered (info), Pending Qualification (warning), Qualified (success), Expired (neutral), Flagged (warning), Disqualified (error).

## 1.15 Workflow

See Doc 5 (Referral workflow): Customer → Code/Link → Referred customer → Order → Qualified → Commission → Approval → Payout → Finance → Reporting.

## 1.16 Relationships

Customers (referred-by, code), Orders/Payments (qualification events), Commissions (engine), Payouts, Finance, Reports, Audit.

## 1.17 Notifications & states

Referrer (SMS/push/email): someone signed up with your code, referral qualified, commission earned, referral expired.
Round-Robin Winner (Email/In-app): "Congratulations on your new sale; your topline person that facilitated this trade is XYZ."
Staff: high-severity flag, reassign approval needed. Empty portal state: "Share your link to start earning" with share tools. Empty admin list standard. Invalid/disabled code at signup → inline message "This referral code isn't valid. Continue without a code or check with your referrer."

**Audited:** code generation/regeneration/disable, attribution set/changed, qualification decisions, flags, reassignments, settings changes, round-robin assignments.

---

# 2. REPORTING & ANALYTICS

## 2.1 Purpose

Consistent, filterable, exportable reports across all modules, each drillable to underlying records.

## 2.2 Users

Executives/Owners, Sales, Finance, Procurement, Inventory, Production managers, Merchants (scoped), Auditors.

## 2.3 Permissions

`reports.view` + per-category view permissions (`reports.sales`, `reports.inventory`, `reports.finance`, `reports.procurement`, `reports.production`, `reports.customers`, `reports.referrals`); `reports.export`; `reports.schedule`; `reports.settings`. Data is additionally scoped by merchant/warehouse.

## 2.4 Navigation

```text
/reports                              Report hub (catalogue with search, favorites, recent)
/reports/{category}/{report}          Report page
/reports/scheduled                    Scheduled reports (email)
/reports/exports                      Export history (async jobs)
```

Categories in hub: Sales · Inventory · Finance · Procurement · Production · Customers · Referrals & Commissions · Payments & Payouts · Audit & Compliance.

## 2.5 Standard report page anatomy (all reports use this template)

1. **Header:** report title, description, favorite ☆, **Export** menu, **Schedule** (permissioned), Print.
2. **Filter bar** (sticky): Date range (presets + custom; compare-to toggle: Previous period / Previous year), **Group by** (Day/Week/Month/Quarter/Product/Category/Merchant/Customer/Supplier… per report), report-specific filters, Merchant/Warehouse scope. **Apply** re-runs; filters in URL; "Reset".
3. **Summary KPI cards** (3–6).
4. **Chart** (1–2, per report) with granularity toggle, tooltip and legend behavior as Doc 1 §8.2, "View as table" for a11y.
5. **Data table** (DataTable): sortable columns, totals row (sticky footer), column visibility, pagination or "show all" for exports.
6. **Drill-down:** any chart point/table row/amount navigates to a pre-filtered detail (another report level or the record list); breadcrumb "Report › Product: Sneaker X" shows the drill path with back.
7. **States:** loading skeleton, "No data for the selected filters", error+retry, "Report is large — generating…" for >100k rows (async job with notification).

**Export:** CSV (raw rows, respects filters), Excel (formatted sheets: Summary + Data + Filters used), PDF (report layout with company header, filters, timestamp, page numbers; landscape for wide tables). Large exports → background job; appears in Export history; notification with download link (expires 7 days). Every export is audit-logged (who, report, filters, rows).
**Scheduling:** frequency (Daily/Weekly/Monthly), day/time, recipients (users/emails), format, filters saved; runs as report owner's permissions.
**Consistency rules:** amounts in ₦ unless multi-currency; timezone Africa/Lagos; "as of" timestamp displayed; numbers formatted identically across reports; totals reconcile with Finance (definition tooltips on each KPI).

## 2.6 Report catalogue

### Sales

| Report                         | Filters (beyond date)                     | Group by                          | Charts                                                  | Table columns                                                               | Drill-down                        |
| ------------------------------ | ----------------------------------------- | --------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------- |
| **Sales Summary**              | Merchant, Channel, Status, Customer group | Day/Week/Month, Channel, Merchant | Sales over time (area, compare), Sales by channel (bar) | Period, Orders, Units, Gross sales, Discounts, Returns, Net sales, Tax, AOV | Period → Orders list              |
| **Product Sales**              | Category, Product, Merchant               | Product/Category/Variant          | Top 10 products (bar), Sales mix (donut)                | Product, SKU, Units, Net sales, Cost, Margin, Margin %, Returns %           | Product → orders for product      |
| **Merchant Sales**             | Merchant tier, State                      | Merchant                          | Merchant ranking (bar), Trend (multi-line top 5)        | Merchant, Orders, Net sales, Avg order, Returns, Commission, Growth %       | Merchant → merchant detail/orders |
| **Customer Sales**             | Customer group, Referral (yes/no)         | Customer                          | Top customers (bar), Concentration (Pareto)             | Customer, Orders, Net sales, AOV, Last order, Wallet                        | Customer → profile                |
| **Daily/Weekly/Monthly Sales** | Merchant                                  | Day/Week/Month                    | Column chart with 7/30-day moving avg                   | Date, Orders, Net sales, Payments by method                                 | Day → orders                      |
| **Sales by Payment Method**    | Merchant                                  | Method                            | Stacked bar                                             | Method, Count, Amount, Fees                                                 | → payments                        |
| **Returns & Refunds**          | Reason, Merchant                          | Reason/Product                    | Returns rate trend, Reasons (donut)                     | Return #, Order, Product, Qty, Reason, Refund                               | → return                          |
| **POS Sessions**               | Merchant, Cashier                         | Session/Cashier                   | Cash difference trend                                   | Session, Cashier, Sales, Cash expected/counted/difference                   | → session report                  |

### Inventory

| Report                      | Filters                                | Group by                  | Charts                           | Columns                                                                 | Drill        |
| --------------------------- | -------------------------------------- | ------------------------- | -------------------------------- | ----------------------------------------------------------------------- | ------------ |
| **Stock Report**            | Location, Category, Status, As-of date | Product/Location/Category | Stock by location (bar)          | Product, Location, On hand, Reserved, Available, Reorder level, Value   | → movements  |
| **Stock Movement**          | Type, Location, Product                | Day/Type/Product          | Stacked in/out                   | Date, Type, Product, Qty, Cost, Source                                  | → source doc |
| **Low Stock**               | Location, Supplier                     | Product                   | Count by category                | Product, On hand, Reorder, Shortfall, Suggested qty, Supplier, On order | → Create PR  |
| **Inventory Valuation**     | As-of date, Location                   | Location/Category         | Value by category (donut), trend | Product, Qty, Avg cost, Value, % of total                               | → movements  |
| **Stock Ageing**            | Location                               | Age buckets               | Bucket bars                      | Product, 0–30/31–60/61–90/90+ qty & value                               | → product    |
| **Adjustments & Shrinkage** | Reason, Location                       | Reason/Month              | Value by reason                  | ADJ #, Date, Product, ± qty, Value, Reason, User                        | → adjustment |
| **Transfers**               | Status, From/To                        | Route                     | In-transit value                 | TRF #, From, To, Qty, Dates, Discrepancy                                | → transfer   |

### Finance

| Report                      | Filters                               | Notes                                                                                                                |
| --------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Revenue**                 | Merchant, Channel, Product category   | Gross → net revenue bridge chart (waterfall: gross, discounts, returns, net)                                         |
| **Expenses**                | Category, Cost centre, Payee          | Category donut, monthly trend, budget vs actual (v2)                                                                 |
| **Profit & Loss**           | Period, Compare, Merchant/Cost centre | Statement layout with subtotals (Revenue, COGS, Gross profit, Opex, Net profit); margin KPIs; drill account → ledger |
| **Balance Sheet**           | As-of date, Compare                   | Assets/Liabilities/Equity sections; drill account                                                                    |
| **Cash Flow**               | Period, Method (direct/indirect)      | Waterfall + monthly in/out/net; opening/closing cash                                                                 |
| **Trial Balance**           | Period                                | Debit/credit totals must match; export                                                                               |
| **Receivables (AR Ageing)** | As-of, Merchant, Customer type        | Buckets stacked bar; per-customer table with reminders                                                               |
| **Payables (AP Ageing)**    | As-of, Supplier                       | Buckets; due-soon list                                                                                               |
| **VAT/Tax Summary**         | Period                                | Output vs input tax                                                                                                  |
| **Commission Liability**    | As-of                                 | Pending + approved unpaid by beneficiary, reconciles to GL                                                           |

### Procurement

| Report                      | Filters                         | Charts                                                                                   | Columns                                                                               |
| --------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Procurement Spending**    | Supplier, Category, Warehouse   | Spend trend, by supplier/category                                                        | PO count, Value, Received value, Invoiced, Avg PO                                     |
| **Supplier Performance**    | Supplier                        | On-time %, fill rate %, price variance, quality rejection (radar or bars), score ranking | Supplier, POs, On-time %, Fill %, Avg lead time, Rejection %, Price variance %, Score |
| **Purchase History**        | Supplier, Product, Status, Date | Price trend per product (line)                                                           | PO #, Date, Supplier, Product, Qty, Unit price, Δ vs previous                         |
| **Open Purchase Orders**    | Supplier                        | Ageing                                                                                   | PO, Expected date, Days overdue, Outstanding value                                    |
| **Purchase Price Variance** | Product                         | Variance bars                                                                            | Product, Std/last cost, Paid, Variance                                                |

### Production

| Report                   | Filters              | Charts                                                              | Columns                                                             |
| ------------------------ | -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Production Output**    | Product, Team, Stage | Planned vs actual, by product                                       | WO, Product, Planned, Produced, Rejected, Yield %                   |
| **Production Cost**      | Product, WO          | Cost breakdown stacked (materials/labour/overhead), unit cost trend | WO, Qty, Materials, Labour, Overhead, Total, Unit cost, vs Standard |
| **Material Consumption** | Material, WO         | Consumption vs standard bars                                        | Material, Std qty, Actual, Variance, Wastage %                      |
| **Scrap & Rejects**      | Reason, Stage        | Pareto by reason                                                    | Date, WO, Stage, Qty, Reason, Cost                                  |
| **WIP Valuation**        | As-of                | By stage                                                            | WO, Stage, Qty, Value, Days in WIP                                  |

### Customers

| Report                          | Notes                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Customer Growth**             | New vs cumulative (line+bars); by source and merchant                                                   |
| **Customer Activity**           | Active/inactive segmentation (30/90/180 days), order frequency histogram                                |
| **Customer Retention**          | Cohort table (signup month × months since, % repeat purchasers), repeat purchase rate; heatmap coloring |
| **Top Customers & Value (LTV)** | LTV, AOV, orders, recency                                                                               |
| **Customer Balances**           | Wallet + receivable balances                                                                            |

### Referrals & Commissions

| Report                      | Charts                                     | Columns                                                                  |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| **Referral Performance**    | Funnel, referrals over time, top referrers | Referrer, Referrals, Qualified, Conversion %, Referred sales, Commission |
| **Network Growth by Level** | Level distribution                         | Level, Members, Active, Sales                                            |
| **Commission Generated**    | Trend by status, by level                  | COM #, Date, Beneficiary, Order, Level, Amount, Status                   |
| **Commission Paid**         | Paid over time                             | Payout #, Date, Beneficiary, Amount, Method                              |
| **Commission Outstanding**  | Ageing of unpaid                           | Beneficiary, Pending, Approved-unpaid, Oldest age                        |
| **Reversals & Clawbacks**   | Reasons                                    | Reversal #, Original, Reason, Amount, Status                             |

### Payments & Payouts

Payments Received (by method/day), Failed Payments (reason breakdown), Refunds, Reconciliation Status (matched/unmatched by account), Payout Report (by type/status/processing time), Gateway Fees.

### Audit & Compliance

User Activity, Permission Changes, Financial Overrides (discounts, price overrides, manual journals, adjustments), Export Log — each backed by the audit log (§4).

## 2.7 Report hub UI

Search field, category tabs, cards (title, 1-line description, "last viewed", ☆). "Favorites" and "Recently viewed" rows at top. Only reports the user may view appear. Mobile: list.

## 2.8 Statuses/states

Report run state: Ready, Generating (progress), Failed (Retry), Expired (export link). Standard empty/error/no-permission states. "Data as of {timestamp}" chip; if data is delayed (reporting cache), warning shows lag.

## 2.9 Notifications

Scheduled report emailed; export ready (in-app + email link); export failed. Toasts for filter errors ("Date range too large — max 12 months for daily grouping").

---

# 3. ROLE-BASED DASHBOARDS

The main dashboard (Doc 1 §8) renders a **role template**: a fixed layout of widgets filtered by permission. Widgets are the same reusable components (`KpiCard`, `ChartCard`, tables) with role-specific selections.

| Role                             | KPI cards (max 8)                                                                                                 | Charts                                                                              | Lists / Action center                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Super Admin / Owner**          | Revenue, Net Profit, Sales, Orders, Cash & Bank, Receivables, Payables, Commissions Payable                       | Sales over time, Revenue vs Expenses, Sales by merchant, Inventory movement         | Approvals (all), unposted finance events, system alerts              |
| **Sales Manager**                | Total Sales, Orders, AOV, Pending Orders, New Customers, Referral Sales, Commissions Generated, Return Rate       | Sales over time, Orders by status, Top products, Sales by merchant, Customer growth | Orders awaiting approval, unfulfilled orders, flagged referrals      |
| **Finance Manager / Accountant** | Revenue, Gross Profit, Pending Payments, Pending Payouts, Receivables, Payables, Cash Balance, Unreconciled Items | Revenue vs Expenses, Cash flow, AR/AP ageing, Payments by method                    | Payments to confirm, payouts to approve, invoices due, period status |
| **Procurement Officer**          | Open POs, Awaiting Approval, Overdue Deliveries, Spend (period), Payables Due, Avg Lead Time                      | Spend trend, Spend by supplier, PO funnel                                           | PRs to convert, deliveries due, invoices on hold                     |
| **Inventory Manager**            | Inventory Value, Low Stock, Out of Stock, In Transit, Adjustments Value                                           | Inventory movement, Value by warehouse, Stock ageing                                | Low-stock list, transfers to approve/receive, counts in progress     |
| **Production Manager**           | WOs In Progress, Units Produced, Plan Attainment %, Yield %, Scrap %, Overdue WOs                                 | Output planned vs actual, Yield trend, Orders by stage                              | Material shortages, today's schedule                                 |
| **Merchant Owner / Manager**     | Today's Sales, Orders, Stock Value, Low Stock, Commission Earned, Balance Owed/To Receive                         | Sales over time, Top products, Payment methods                                      | Open POS sessions, pending transfers, settlements                    |
| **Cashier**                      | _No ERP dashboard_ — lands on POS session gate (`/pos`)                                                           |                                                                                     |                                                                      |
| **Referrer / Customer (portal)** | Wallet Balance, Commission Available, Pending Commission, Total Referrals, Qualified, Orders                      | Earnings over time, Referrals funnel, **Promoter Leaderboard (Top 10)**             | Recent orders, latest commissions, share link CTA                    |
| **Auditor**                      | Audit events today, Overrides this week, Failed logins, Period status                                             | Activity by module, Overrides trend                                                 | Recent high-risk events                                              |

Widgets fetch independently (`GET /dashboard/{widget}`), so one failure never breaks the page. Widget-level permission: if the user lacks the underlying module view permission, the widget is omitted (not shown as an error).

---

# 4. AUDIT & ACTIVITY TRACKING

## 4.1 Purpose

Immutable record of who did what, when, where, and what changed — for accountability, compliance, and troubleshooting.

## 4.2 Users

Auditor, Admin/Super Admin, Finance Manager (financial events), Module managers (scoped to their module).

## 4.3 Permissions

`audit.view` (all), `audit.view_module` (scoped by module), `audit.export`, `audit.settings` (retention). **No one — including Super Admin — can edit or delete audit entries.** Sensitive fields (passwords, full bank/account numbers, tokens) are never stored; masked values only.

## 4.4 Navigation

`/admin/audit-logs` (list) · `/admin/audit-logs/[id]` (detail drawer + full page) · Record-level "Activity" tabs across modules reuse the same data filtered by record. Related: `/admin/audit-logs/security` (auth events view).

## 4.5 Events tracked

| Category       | Events                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication | Login success/fail, logout, lockout, password change/reset, 2FA enable/disable, session revoked                                        |
| CRUD           | Create, Update, Delete/Archive for every entity                                                                                        |
| Approvals      | Approve, Reject, Request changes (PR, PO, adjustment, refund, commission, payout, journal, period)                                     |
| Money          | Payment recorded/confirmed/voided, Refund, Payout requested/approved/paid/failed, Wallet adjustment, Commission approve/reverse/adjust |
| Inventory      | Stock adjustment, transfer ship/receive, count approval, reservation override                                                          |
| Procurement    | PR/PO approvals, PO issue/cancel, GRN post/void, invoice variance override                                                             |
| Production     | BOM activation, WO release/cancel/close, consumption, output, scrap                                                                    |
| Security/Admin | Role/permission change, user status change, setting change, export performed, bulk actions, impersonation (if ever added)              |
| POS            | Session open/close, cash movement, discount override, void, reprint, return/refund                                                     |
| Finance        | Manual journal, reversal, period close/reopen, account changes, write-offs                                                             |

## 4.6 Audit log list

- **Title:** Audit Logs — "A tamper-proof history of activity across BuyNaija." No primary action (read-only); **Export** (CSV/Excel; audited).
- **Search:** user name, record reference, IP. **Filters:** Date-time range, User (combobox), Module, Action (multi), Entity type, Record ID/ref, Result (Success/Failed/Denied), Severity (Info/Notice/High-risk), Merchant, IP address. Presets: "High-risk events", "Financial", "Security", "My activity".
- **Sort:** newest first (default). **Pagination:** cursor-based (append-only, large).
- **Columns:** Timestamp (with timezone tooltip UTC), User (avatar/name/role), Action (verb badge: Created/Updated/Deleted/Approved/Rejected/Login…), Module, **Record** (EntityLink e.g., PO-2041), Summary ("Changed unit price 4,500 → 5,200"), Severity badge, Result, IP, Actions (View).
- **Live tail (optional toggle):** new events appear with a subtle highlight for high-risk monitoring (polling 15s).
- **Mobile:** cards with action, record, user, time.

## 4.7 Audit detail (right drawer 640px; also full page for sharing)

Sections: **Overview** (event ID, timestamp, user, role at the time, action, module, record link, result, severity, request ID), **Changes** — **diff table**: Field | Previous value | New value (removed values red strikethrough, added green; JSON fields expand; masked fields "••••" ), **Context** (IP, geolocation approximate, device/browser/OS, session ID, source: Web/POS/API/System job), **Reason/comment** if provided (e.g., refund reason), **Related events** (same request/transaction/session, e.g., "Refund → Stock movement → Journal entry → Commission reversal") as a small timeline. Actions: Copy link, Export event JSON (`audit.export`), Go to record.

## 4.8 Record-level Activity tab (reused component)

`ActivityFeed` filtered by entity: chronological events with actor, action phrase, changed fields summary and "View details" opening the same drawer. Present on every detail page in Docs 2–3.

## 4.9 Alerts on high-risk events

Configurable rules (Admin): e.g., discount override above 20%, refund above ₦x, manual journal, payout to new bank account, permission change, >5 failed logins, export of >10k rows, stock adjustment above ₦x. Sends in-app + email to Auditor/Admin; visible in Audit "High-risk" preset and dashboard.

## 4.10 Retention & integrity

Retention default 7 years (setting; no deletion via UI); entries hash-chained server-side (each entry stores previous hash) — the UI shows a "Chain verified ✓ as of {time}" indicator; verification job failure raises a system banner for Admin.

## 4.11 Statuses/states

Result: Success (success), Failed (error), Denied (warning; permission denied attempts are logged). Severity: Info (neutral), Notice (info), High-risk (error). Empty: "No activity matches your filters". Deleted record referenced by an entry → link shows "Record archived/deleted" with its last known snapshot.

## 4.12 Workflow & relationships

Every module writes events via a single audit service; UI never writes audit directly. Relations: Users, all modules' records, Reports (Audit & Compliance), Notifications.

---

# 5. USERS, ROLES & PERMISSIONS — FULL SPECIFICATION

(UI screens are in Doc 2 §1. This section defines the **catalogue and default matrix** the UI must seed and enforce.)

## 5.1 Permission keys

`<module>.<action>` where module ∈ {dashboard, users, roles, customers, products, merchants, suppliers, orders, pos, referrals, commissions, payments, payouts, finance, procurement, inventory, production, reports, audit, settings} and action ∈ {view, create, edit, delete, approve, export, process, cancel, refund, settings}. Extra granular keys: `products.view_cost`, `customers.view_all`, `commissions.view_all`, `referrals.view_all`, `pos.discount_override`, `pos.cash_movement`, `finance.close_period`, `payouts.approve_limit`, `procurement.approve_limit`, `audit.view_module`, `reports.<category>`.

## 5.2 Default role × module matrix (seed data)

Legend: **V** view · **C** create · **E** edit · **D** delete (drafts/soft) · **A** approve · **X** export · **P** process · **R** refund/cancel · **S** settings · `—` none · `own` = own/scoped records only.

| Module        | Super Admin | Admin               | Sales Mgr                   | Finance Mgr       | Accountant | Procurement  | Inventory Mgr | Production Mgr | Merchant Owner     | Cashier    | Auditor    | Customer/Referrer |
| ------------- | ----------- | ------------------- | --------------------------- | ----------------- | ---------- | ------------ | ------------- | -------------- | ------------------ | ---------- | ---------- | ----------------- |
| Dashboard     | V           | V                   | V                           | V                 | V          | V            | V             | V              | V(own)             | —          | V          | V(own)            |
| Users & Roles | VCEDAXS     | VCEA                | —                           | —                 | —          | —            | —             | —              | V(own staff) CE    | —          | V          | —                 |
| Customers     | all         | VCEXA               | VCEX                        | V                 | V          | —            | —             | —              | VCE(own)           | V C(quick) | V          | own profile       |
| Products      | all         | VCEXS               | VE(price)X                  | V(cost)           | V(cost)    | V            | V             | V              | V(own prices)      | V          | V          | —                 |
| Merchants     | all         | VCEAX               | VCEAX                       | V                 | V          | —            | V             | —              | V E(own)           | —          | V          | —                 |
| Suppliers     | all         | VCE                 | —                           | V                 | VX         | VCEX         | V             | —              | —                  | —          | V          | —                 |
| Orders        | all         | VCEX                | VCEAPRX                     | V                 | V          | —            | V P           | —              | VCPR(own)          | C P        | V          | V(own)            |
| POS           | all         | V                   | V                           | —                 | —          | —            | —             | —              | all(own)           | sell/hold  | V          | —                 |
| Referrals     | all         | VCEAX               | VAX                         | V                 | V          | —            | —             | —              | V(own)             | —          | V          | V(own)            |
| Commissions   | all         | VA                  | V S                         | VAPX              | VX         | —            | —             | —              | V(own)             | —          | V          | V(own)            |
| Payments      | all         | V                   | V                           | VCAPRX            | VCPX       | —            | —             | —              | V(own) C           | C(POS)     | V          | V(own)            |
| Payouts       | all         | V                   | —                           | VAPX              | VP         | —            | —             | —              | request(own)       | —          | V          | request(own)      |
| Finance       | all         | V                   | —                           | VCEAPXS           | VCEPX      | —            | —             | —              | —                  | —          | V X        | —                 |
| Procurement   | all         | V                   | —                           | VA                | V          | VCEPX R      | V             | C(PR)          | —                  | —          | V          | —                 |
| Inventory     | all         | V                   | V                           | V(value)          | V(value)   | V            | VCEAPXS       | VP             | V C(own transfers) | —          | V          | —                 |
| Production    | all         | V                   | —                           | V(cost)           | V(cost)    | V(shortages) | V             | VCEAPXS        | —                  | —          | V          | —                 |
| Reports       | all         | all                 | sales, customers, referrals | finance, payments | finance    | procurement  | inventory     | production     | own                | —          | all (view) | —                 |
| Audit         | all         | V                   | —                           | V(finance)        | —          | —            | —             | —              | —                  | —          | VX         | —                 |
| Settings      | S           | S (except security) | —                           | S(finance)        | —          | S(proc.)     | S(inventory)  | S(production)  | S(merchant/POS)    | —          | —          | —                 |

The matrix is **data**, not code: seeded via `roles.seed.ts` and editable in the Role editor (Doc 2 §1.4). System roles can't be deleted; changes to them are audited.

## 5.3 Segregation of duties (enforced in UI and API)

- Requester ≠ approver for PR/PO/adjustment/refund/payout/journal.
- Who creates a payout batch ≠ who approves it.
- Bank detail changes (supplier, merchant, payee) require approval by a second user.
- Period close requires `finance.close_period` and cannot be performed by the person who posted the last manual journal in that period (warning + override with reason).
  The UI shows a tooltip when an action is disabled for these reasons: "You can't approve your own request."

## 5.4 Frontend enforcement

`PermissionProvider` loads effective permissions at login; nav, buttons, tabs, and fields are gated with `<Can>`; direct URL access to forbidden routes renders `NoPermission`; server 403s trigger the same and refresh permissions (in case they changed). Role changes take effect on next request (permissions version in JWT/`/auth/me` polled on focus).

---

# 6. SETTINGS

`/settings` uses the Settings template (left sub-nav + content). Visibility per permission.

| Section                   | Contents                                                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Company profile**       | Legal name, logo, address, RC/Tax ID, contact, currency (NGN), timezone, fiscal year start                                                                |
| **Numbering**             | Prefix, padding, next number per document type (with preview)                                                                                             |
| **Tax**                   | Tax classes (VAT 7.5%, exempt), inclusive/exclusive default, tax accounts                                                                                 |
| **Payment methods**       | See Doc 3 §4.12                                                                                                                                           |
| **Approvals**             | Chains and thresholds per document type (PR, PO, adjustment, refund, commission, payout, journal, expense); approver roles; escalation timeouts           |
| **Notifications**         | Event × channel matrix (In-app, Email, SMS, Push, WhatsApp) with role defaults; templates (subject/body with variables, preview, test send)               |
| **Referral & commission** | Links to Referral settings (§1.12) and Commission plans (Doc 3 §6.6)                                                                                      |
| **POS defaults**          | Links to per-merchant POS settings; global defaults                                                                                                       |
| **Inventory**             | Valuation method, negative stock allowed, reservation behavior, reorder defaults, expiry alerts                                                           |
| **Security**              | Password policy, 2FA enforcement by role, session timeout, IP allow-list (optional), login attempt limits, audit alert rules                              |
| **Integrations**          | Payment gateway status, SMS/email/WhatsApp providers (e.g., Twilio, Meta), bank verification, webhooks (status, masked keys, Test connection, event logs) |
| **Data**                  | Import history, export limits, retention info                                                                                                             |

Each settings form: standard form system, "Save changes" sticky footer, dirty guard, audit on save with before/after diff, sensitive keys masked with "Replace" action.

---

## Cross-module mock data requirements (Doc 4)

- **Referrals:** 60 referral records across all statuses linking to the customer chains seeded in Doc 2 (max depth 4; one broken-rule attempt blocked, 5 flagged with different signals, 4 expired); codes with click/signup counts; network of 200 nodes for tree performance testing (lazy loading).
- **Reports:** every report has a fixture endpoint returning consistent aggregates derived from the same underlying mock stores (so Sales Summary totals equal the sum of orders, P&L equals ledger, valuation equals stock × cost); include one intentionally empty date range and one large-export simulation.
- **Dashboards:** one fixture per role template.
- **Audit:** ≥500 entries generated from mock mutations of every category, including 15 high-risk events, failed/denied results, and diffs with nested JSON and masked fields; hash-chain indicator stubbed as valid with a toggle to simulate failure.
- **Permissions:** the seeded matrix above plus 12 users (one per role) to test each nav/action gate.

---

_Next: Document 5 — Cross-Module Workflows (Sales, POS, Procurement, Inventory, Production, Referral, Commission, Payment, Finance, plus returns, merchant settlement, month-end close, and exception handling), with the shared event map and status-transition tables that tie Docs 1–4 together._

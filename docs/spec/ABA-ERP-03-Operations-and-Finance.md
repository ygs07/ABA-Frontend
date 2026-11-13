# BuyNaija ERP — Document 3: Operations & Finance

**Covers:** Procurement · Inventory · Production · Payments · Payouts · Commissions · Finance & Accounting
**Depends on:** Doc 1 (design system, DataTable, forms, states) and Doc 2 (Suppliers, Products, Orders, Customers, Merchants, POS).
**Conventions:** same as Doc 2 (permission keys `module.action`, reference numbers, soft delete, audit on every mutation, standard states, standard toast, merchant/warehouse scoping).

---

## Global rules for this document

1. **Documents vs. ledgers.** Business documents (PR, PO, GRN, Production Order, Payment, Payout) are editable only while `draft`. Ledgers (stock movements, wallet ledger, commission ledger, journal entries) are **append-only**: corrections are made by reversing/adjusting entries, never edits.
2. **Every state transition is an API action** (`POST /{resource}/:id/{action}`) with a reason where required, and appears on the record's Timeline (Doc 1 Timeline component).
3. **Approvals** use the `ApprovalPanel` component. Approval chains are configured in Settings per document type with amount thresholds (e.g., PO ≤ ₦500k → Procurement Manager; > ₦500k → Finance Manager + Admin). A user cannot approve their own request.
4. **Reference numbers:** `PR-0001`, `PO-2041`, `GRN-0310`, `SINV-…` (supplier invoice), `INV-…` (customer invoice), `WO-…` (production order), `BOM-…`, `TRF-…`, `ADJ-…`, `CNT-…` (stock count), `PAY-…`, `RFD-…`, `PYT-…` (payout), `COM-…`, `JE-…` (journal entry).
5. **Posting is automatic.** Operational modules never let users type journal entries; they emit events and Finance posts entries via the posting rules in §7.4. Manual journals exist only in Finance with `finance.approve`.
6. **Warehouse/location** is a first-class dimension: Central warehouse, Production floor (WIP), Merchant shop locations, Quarantine/Damaged.

---

# 1. PROCUREMENT

## 1.1 Purpose

Control buying of raw materials and goods: request, approve, order, receive (fully/partially), match supplier invoices, and hand payables to Finance.

## 1.2 Users

Requesters (Production, Inventory, Merchant Managers), Procurement Officer/Manager, Approvers (Finance Manager, Admin), Warehouse/Receiving staff, Accountant.

## 1.3 Permissions

`procurement.view, create` (PR/PO), `edit`, `delete` (drafts), `approve`, `process` (issue PO to supplier, receive goods), `cancel`, `export`, `settings` (approval chains, thresholds, tolerance). Sub: `procurement.approve_limit` value per role.

## 1.4 Navigation

```text
/procurement                           Dashboard
/procurement/requests                  Purchase Requests   (+ /new, /[id])
/procurement/orders                    Purchase Orders     (+ /new, /[id])
/procurement/receiving                 Goods Receipts (GRN) (+ /new?po=, /[id])
/procurement/invoices                  Supplier Invoices   (+ /new, /[id])
/procurement/returns                   Purchase Returns
/procurement/settings                  Approval chains, tolerances, numbering
```

Tabs on PO detail: **Overview · Items · Receiving · Invoices · Payments · Timeline**.

## 1.5 Dashboard

KPIs: **Procurement Spend (period), Open POs (value), Awaiting Approval (count), Overdue Deliveries, Payables Due (7d), Avg Lead Time.**
Charts: Spend trend (line, month), Spend by supplier (top 10 bar), Spend by category (donut), PO status funnel (Draft→Approved→Ordered→Received→Invoiced→Paid counts), Supplier on-time delivery (bar).
Sections: **Pending approvals** (rows with Approve/Review), **Deliveries due this week** (PO, supplier, expected date, days late in red), **Low-stock suggestions** (products at/below reorder level with "Create request" bulk action), Recent POs.

## 1.6 Purchase Requests (PR)

**List:** search PR no./requester/product; filters Status, Requester, Department/Location, Date, Urgency, Linked PO (has/none); columns PR #, Requested by, Location, Items, Est. value, Urgency, Required by, Status, Age; bulk: Approve, Reject, Convert to PO (same supplier grouping), Export; row: View, Edit (draft), Submit, Approve, Reject, Convert to PO, Cancel.
**Form (full page):**
| Field | Type | Req | Validation |
|---|---|---|---|
| Request type | select: Raw materials / Finished goods / Other | Yes | |
| Deliver to | warehouse combobox | Yes | |
| Required by | date | Yes | ≥ today |
| Urgency | select Low/Normal/High/Critical | Yes | default Normal |
| Reason/justification | textarea | Yes if High/Critical | ≤500 |
| Lines (LineItemsEditor) | product*, qty*(>0), unit, est. unit cost (prefilled last price), preferred supplier, note | ≥1 line | Duplicate product warning |
| Attachments | FileUploader | No | |
Buttons: Save draft / **Submit for approval**. Sources: manual, "Create request" from low-stock alert or Production shortage (prefilled, flagged `auto`).
**Approval:** ApprovalPanel; Approve (optional comment) / Reject (comment required) / **Request changes** (returns to draft). On approval → `approved`, ready to convert.

## 1.7 Purchase Orders (PO)

**List:** filters Status, Supplier, Warehouse, Date, Expected delivery, Payment status, Amount; columns PO #, Supplier, Date, Expected, Items, Total, Received %, Invoiced %, Payment status, Status; bulk: Export, Send to supplier, Cancel; row: View, Edit (draft), Send/Issue, Receive, Create invoice, Duplicate, Cancel, Close.
**Form:** Supplier* (shows terms, balance, credit warning), Deliver to*, Order date*, Expected delivery*, Payment terms (default from supplier), Currency (+rate if not NGN), Reference/quote no., Lines (product*, supplier SKU, qty*, unit price\*, tax, discount, line total; price variance vs. last purchase >10% shows amber chip), Shipping/other charges, Notes to supplier, Internal notes, Terms.
Totals: Subtotal, Discount, Tax, Shipping, **Total**. Create from approved PR(s) prefills lines and links back (PR status → `converted`).
**Actions:** Save draft · Submit for approval (if above threshold; else auto-approve) · **Issue PO** (status `ordered`; generates PDF, emails supplier optional) · Print/PDF · Cancel (reason; blocked if received qty > 0 → "Close short" instead) · Amend (creates revision v2; re-approval if total increases >5%).
**Detail:** header (PO no., supplier link, status, StepIndicator: Draft → Approved → Ordered → Partially Received → Received → Invoiced → Paid), cards (Total, Received value, Invoiced, Paid, Balance), tabs as §1.4. Receiving tab lists GRNs; Invoices tab lists supplier invoices; Payments tab payments applied; Timeline.

## 1.8 Receiving (Goods Receipt Note)

**Form (`/procurement/receiving/new?po=`):** PO* (open POs only, shows supplier), Receiving warehouse*, Received date\*, Delivery note no., Vehicle/driver (opt.), Lines: ordered, previously received, **received now\*** (≤ remaining + over-receipt tolerance %), **accepted qty**, **rejected qty** (reason select: Damaged, Wrong item, Quality fail, Short), batch/lot no., expiry (if tracked), bin/location, Notes, Attachments (photos, delivery note).
Behavior: **Partial receiving** is default-supported (remaining qty stays open, PO → `partially_received`); receiving beyond tolerance blocked with message; rejected qty goes to Quarantine location and creates optional Purchase Return.
**On Post GRN:** stock movement `receipt` (+ accepted qty at warehouse, at PO cost) → Inventory valuation updated (weighted avg) → Finance posts **Dr Inventory / Cr GRNI (Goods received not invoiced)** → PO received% updated → requester notified.
Statuses: Draft, Posted (success), Voided (error; reversal movement, only if no downstream issue).

## 1.9 Supplier Invoices

**Form:** Supplier*, Supplier invoice no.* (unique per supplier), Invoice date*, Due date (auto from terms), PO(s)/GRN(s) to match*, Lines pulled from GRNs (qty, price) editable within tolerance, Additional charges/tax, Attachment (PDF/photo).
**Three-way match panel:** PO vs GRN vs Invoice per line (qty, price); mismatches beyond tolerance (default 2% price / 0 qty) shown red, invoice status → `on_hold` until Procurement Manager resolves (Approve variance with reason, or request credit note).
**Post:** Dr GRNI (and variance account) / Cr Accounts Payable; invoice status `approved` → appears in Finance Payables; Pay via Payments (supplier payment).
Statuses: Draft, Matched (info), On hold (warning), Approved (success), Partially paid (warning), Paid (success), Overdue (error, computed), Void.

## 1.10 Purchase Returns (to supplier)

Select GRN/PO lines → qty, reason → ship-back → stock issue movement, debit note → reduces payable. Statuses Draft, Approved, Shipped, Credited.

## 1.11 Modals

Approve/Reject (comment), Issue PO (confirm + "Email supplier" checkbox + supplier email), Cancel PO (reason), Close short (reason: accept shortfall), Convert PRs (drawer: choose grouping by supplier, review lines), Resolve match variance (reason), Void GRN (typed "VOID").

## 1.12 Statuses summary

PR: Draft, Awaiting Approval, Approved, Rejected, Converted, Cancelled. PO: Draft, Awaiting Approval, Approved, Ordered, Partially Received, Received, Closed, Cancelled. GRN/Invoice as above.

## 1.13 Workflow

```text
Need (manual / low-stock / production shortage) → Purchase Request → Approval
→ Purchase Order → Approval (threshold) → Issue to Supplier
→ Goods Received (full/partial) → Inventory updated (+GRNI in Finance)
→ Supplier Invoice → 3-way match → Payable posted → Supplier Payment
→ Finance (AP cleared, cash out) → Supplier performance updated → Reports
```

## 1.14 Relationships

Suppliers, Products, Inventory (receipts, returns), Production (shortages), Finance (GRNI, AP, purchase expense), Payments (supplier payments), Approvals/Users, Reports, Audit.

## 1.15 Notifications

In-app + email: PR submitted → approver; approved/rejected → requester; PO issued → supplier (optional) & requester; delivery due tomorrow/overdue → Procurement; GRN posted → requester & Finance; invoice on hold → Procurement Manager; invoice due in 3 days/overdue → Finance. Toasts: "PO-2041 approved", errors with reason.

## 1.16 States

Empty PR list "No purchase requests yet — Create request"; PO detail 404; receiving with no open POs "No purchase orders awaiting receipt"; approver without limit sees Approve disabled with tooltip "Above your approval limit (₦x). Escalate to {role}". Action failure preserves form.

**Audited:** all submits/approvals/rejections, PO issue/amend/cancel, GRN post/void, invoice match overrides, tolerance settings.

---

# 2. INVENTORY

## 2.1 Purpose

Single source of truth for quantities and values per product/variant/location/batch, driven entirely by **movements**.

## 2.2 Users

Inventory Manager, Warehouse staff, Production, Merchant Managers (own location), Finance (valuation), Procurement.

## 2.3 Permissions

`inventory.view, create` (transfers/adjustments requests), `edit`, `approve` (adjustments, transfers, counts above thresholds), `process` (receive/issue/ship transfer), `export`, `settings` (warehouses, valuation method, reorder). `inventory.view_cost` for valuation columns.

## 2.4 Navigation

```text
/inventory                        Dashboard
/inventory/stock                  Stock Levels (by product/location)
/inventory/movements              Stock Movements (ledger)
/inventory/transfers              Stock Transfers (+ /new, /[id])
/inventory/adjustments            Adjustments (+ /new, /[id])
/inventory/counts                 Stock Counts / Reconciliation (+ /new, /[id])
/inventory/valuation              Valuation
/inventory/warehouses             Warehouses & Locations (+ /[id])
/inventory/alerts                 Low-stock & expiry alerts
```

## 2.5 Dashboard

KPIs: **Inventory Value, Total SKUs in stock, Low-stock items, Out-of-stock items, Stock in transit, Adjustments (period, value)**. Charts: Inventory movement (stacked in/out by source), Value by warehouse (bar), Value by category (donut), Stock ageing (bar buckets 0–30/31–60/61–90/90+ days), Top moving vs. slow moving. Sections: Low-stock table (product, on hand, reorder level, suggested qty, **Create request**), Pending transfers/adjustments awaiting approval, Expiring batches (if tracked).

## 2.6 Stock levels

- **Views:** By product (default; expandable rows to locations/variants) · By location.
- **Search:** product name/SKU/barcode. **Filters:** Warehouse/Location, Category, Type (finished/raw), Stock status (In/Low/Out/Overstock), Batch, Supplier.
- **Columns:** Product (image, name, SKU), Location, **On hand**, **Reserved** (orders/holds/production allocations), **Available** (= on hand − reserved), **In transit**, **On order** (open POs), Reorder level, Avg cost, Value, Status chip.
- **Row actions:** View product movements, Adjust, Transfer, Create purchase request. **Export:** CSV/Excel/PDF stock report. Clicking On hand opens **Movement drawer** (last 50 movements for that product/location).

## 2.7 Stock movements (ledger, read-only)

Columns: Date/time, Movement no., **Type**, Product, Location (from → to), Qty (+/−, colored), Unit cost, Value, Balance after, **Source document** (EntityLink: PO/GRN, Order, POS sale, WO, Transfer, Adjustment, Return), User. Filters: Type, Product, Location, Date, Source module, User. Types:

| Type                   | Trigger                               | Effect                                              |
| ---------------------- | ------------------------------------- | --------------------------------------------------- |
| Receipt                | GRN posted                            | + at receiving warehouse                            |
| Sales issue            | Order fulfilled / POS sale completed  | − at source location                                |
| Reservation            | Order placed / production allocated   | Reserved ↑ (no on-hand change)                      |
| Sales return           | Return approved & restocked           | + (or Quarantine if damaged)                        |
| Purchase return        | Return shipped                        | −                                                   |
| Production consumption | WO materials issued/consumed          | − raw at floor/warehouse                            |
| Production output      | WO output posted                      | + finished goods                                    |
| Transfer out / in      | Transfer shipped / received           | − source, + in-transit; − in-transit, + destination |
| Adjustment ±           | Approved adjustment or count variance | ± with reason                                       |
| Write-off              | Damaged/expired                       | − to expense                                        |

Each movement stores unit cost snapshot; **never edited or deleted**.

## 2.8 Transfers

**List:** filters Status, From, To, Date, Product; columns TRF #, From, To, Items, Qty, Requested by, Status, Date.
**Form:** From*, To* (≠ From; merchants only their own as destination/source), Required date, Lines (product*, qty* ≤ available at source, batch), Notes. Buttons Save draft / **Submit** (approval if configured, e.g., value > threshold or to merchant).
**Flow:** Draft → Awaiting Approval → Approved → **Shipped** (source movement out; qty → In transit; waybill/driver fields) → **Received** (destination confirms qty per line; **shortage/damage** recorded creates adjustment & discrepancy flag) → Completed. Partial receipt allowed (remaining stays in transit until resolved). Cancel allowed before shipping.
Merchant restock requests: a merchant manager creates a transfer request; central warehouse approves and ships.

## 2.9 Adjustments

**Form:** Location*, Reason* (Damage, Expiry, Theft/Loss, Count correction, Found stock, Opening balance, Other), Date, Lines (product\*, system qty (read-only), **new qty** or **± qty**, unit cost (for increases; default avg), note), Attachments (photos), Notes. Value impact panel (total ± ₦). Above approval threshold → approval required; otherwise posts on submit. **On post:** movement(s) + Finance entry (Dr/Cr Inventory vs Inventory adjustment/Shrinkage expense).

## 2.10 Stock counts (reconciliation)

Stepper: **1 Create** (location, scope: full/by category/cycle count, freeze movements optional, date) → **2 Count** (sheet per product, blind count option hides system qty; enter counted qty; mobile-friendly with barcode scan; multiple counters assign) → **3 Review** (variance table: system, counted, variance qty, variance value; recount request flag; threshold highlights) → **4 Approve & post** (creates adjustment for variances; Finance entry) . Statuses: Draft, Counting, Under Review, Approved/Posted, Cancelled.

## 2.11 Valuation

Method: **Weighted average cost** (default; FIFO as setting only if agreed with Finance). Page: totals by location/category/product with Qty, Avg cost, Value; **as-of date** selector (recomputes from movements); export; reconciliation check "Inventory subledger vs Finance Inventory account" (difference shown, drill to movements).

## 2.12 Warehouses & locations

List/detail: Name, Code, Type (Central, Production floor, Merchant shop, Quarantine, Transit), Address, Manager, Linked merchant, Active. Bins/zones optional (child locations). Delete blocked if stock or movements exist.

## 2.13 Alerts & rules

Reorder level per product/location; low-stock triggers in-app + email to Inventory Manager, badge in sidebar; negative stock **not allowed** (setting to allow for backorder); expiry alerts (30/14/7 days) for tracked batches; slow-moving alerts (no movement 90 days).

## 2.14 Modals

Quick adjust (drawer from Stock Levels, single product), Movement history drawer, Ship transfer (waybill), Receive transfer (per-line qty), Reserve override (release reservation, `inventory.approve`), Warehouse form (modal).

## 2.15 Statuses

Stock status (computed): In stock (success), Low (warning), Out (error), Overstock (info). Transfer: Draft, Awaiting Approval, Approved, In Transit, Partially Received, Completed, Cancelled. Adjustment: Draft, Awaiting Approval, Posted, Rejected. Count: as §2.10.

## 2.16 Workflow — how stock changes

```text
Procurement GRN ──► + raw/goods            Production consumption ──► − raw
Production output ──► + finished           Sales/POS ──► reserve → issue (−)
Sales/POS return ──► + (or quarantine)     Transfers ──► − source → transit → + destination
Adjustments / Counts ──► ± with reason      Purchase return ──► −
Every movement ─► valuation update ─► Finance posting ─► Reports
```

## 2.17 Relationships

Products, Procurement, Production, Orders/POS, Merchants (locations), Finance (valuation, COGS, shrinkage), Reports, Audit.

## 2.18 Notifications & states

Low stock/out of stock; transfer requested/approved/shipped/received with discrepancy; count assigned/completed; adjustment awaiting approval. Empty: "No stock recorded yet — receive goods or add opening balances"; blocked action (insufficient stock) shows available qty; failed post preserves draft. **Audited:** every movement source, adjustments, count approvals, reservation overrides, warehouse changes.

---

# 3. PRODUCTION

## 3.1 Purpose

Turn raw materials into finished goods (e.g., shoe manufacturing) using **Bills of Materials**, track stages/WIP, consumption, yield, and cost.

## 3.2 Users

Production Manager, Production Supervisors/Operators, Inventory Manager, Procurement (shortages), Finance (costing).

## 3.3 Permissions

`production.view, create, edit, delete` (drafts), `approve` (release WO, BOM activation), `process` (start/complete stages, record consumption/output), `cancel`, `export`, `settings` (stages, routings, overhead rates).

## 3.4 Navigation

```text
/production                     Dashboard
/production/orders              Production Orders (+ /new, /[id])
/production/boms                Bills of Materials (+ /new, /[id])
/production/wip                 Work in Progress board
/production/materials           Material requirements & consumption
/production/costing             Production cost reports
/production/settings            Stages/routings, overhead, scrap reasons
```

## 3.5 Dashboard

KPIs: **Orders in Progress, Units Produced (period), Planned vs Actual (%), Yield %, Scrap %, Production Cost (period), Overdue Orders**. Charts: Output planned vs actual (column+line), Yield/scrap trend, Cost per unit trend, Orders by stage (bar). Sections: **Material shortages** (WOs blocked by low raw stock with "Create purchase request"), Today's schedule, Recent completions.

## 3.6 Bills of Materials

**List:** columns BOM #, Finished product, Version, Yield qty, Components (count), Std cost, Status; filters Status, Product.
**Form (full page):** Finished product* (type Finished good), Version (auto), Output qty* & unit (e.g., 1 pair), **Components table** (Material*, Qty per output*, Unit, Wastage % (default 0), Substitute (opt.), Cost/unit (read-only avg), Line cost), **Operations/Stages** (Stage name, Sequence, Work centre/team, Std time min, Labour cost/unit), Overhead % or ₦/unit, Notes. Live **Standard cost** = Σ materials (incl. wastage) + labour + overhead; compares to selling price (margin).
Rules: one **active** BOM per product (new version → old becomes Archived on activation, in-flight WOs keep their version); circular references blocked; draft → **Activate** (`production.approve`).
Statuses: Draft, Active (success), Archived (neutral).

## 3.7 Production Orders (WO)

**List:** filters Status, Product, Stage, Date, Priority, Assigned team; columns WO #, Product, Planned qty, Produced, Rejected, Progress bar, Current stage, Start/Due dates, Status, Cost.
**Form:** Product* (auto-picks active BOM; select version), Planned qty*, Priority, Planned start*, Due*, Output location*, Source location for materials*, Assigned to/team, Linked sales order/merchant demand (opt.), Notes.
**Material requirement panel (auto):** per component: required (qty × planned × (1+wastage)), available (source location), reserved, **shortage** (red) with **Create purchase request** button. Release blocked if shortage unless "Allow partial release" (`production.approve`).
**Lifecycle actions:** Save draft → **Release** (status `released`; materials **reserved**) → **Start** → stage progress → **Complete** → Close.
**Detail:** header (WO no., product, status, progress), StepIndicator of BOM stages; cards: Planned/Produced/Rejected, Materials cost, Labour, Overhead, **Total cost & cost/unit**, Variance vs standard.
Tabs: **Overview · Materials · Stages · Output · Costs · Timeline**.

- **Materials:** table required vs issued vs consumed vs returned; **Issue materials** (drawer: qty per line, batch; movement Production consumption issue from warehouse → WIP), **Return unused** (back to stock), **Record scrap/wastage** (qty, reason).
- **Stages:** per stage: status (Pending/In progress/Done), start/end, assigned operator, qty passed/rejected, notes; **Start stage / Complete stage** (drawer: qty in, qty good, qty rejected, reject reason, time spent); next stage unlocks in sequence (configurable skipping).
- **Output:** **Record output** (drawer: qty good\*, qty rejected, batch/lot, location, date; partial outputs allowed) → finished goods movement + Finance WIP→FG.
- **Costs:** actual vs standard by material/labour/overhead.

## 3.8 WIP board `/production/wip`

Kanban columns = stages (Cutting, Stitching, Assembly, Finishing, QC, Packing — configurable); cards = WO (product, qty, due date, days in stage, priority colour); drag-to-advance disabled unless user has `production.process` and stage completion form passes (drag opens the stage-complete drawer). Filters: product, team, priority. Mobile: stage tabs with card list.

## 3.9 Materials view

Aggregated requirements across released/planned WOs vs stock and open POs → **Net shortage** (required − available − on order); action "Create purchase requests" grouped by supplier.

## 3.10 Costing

Actual cost formula: **Materials consumed at avg cost + labour (stage time × rate or per-unit) + allocated overhead** ÷ good output units = unit cost, which becomes the finished goods' cost in inventory. Variance analysis (price, usage, yield). Rejected units' cost is absorbed by good units (setting) or expensed as scrap.

## 3.11 Modals

Release WO (confirm; shows reservations), Issue materials, Return materials, Start/Complete stage, Record output, Record scrap, Cancel WO (reason; releases reservations; consumed materials become WIP loss → requires approval), Close WO (variance summary; posts remaining WIP variance).

## 3.12 Statuses

WO: Draft, Planned, Released (info), In Progress (info), Paused (warning; reason), Completed (success), Closed (neutral), Cancelled (error). Stage: Pending, In Progress, Done, Skipped. Material line: Reserved, Partially issued, Issued, Consumed.

## 3.13 Workflow

```text
Production Request/Demand → BOM (active) → Production Order → Material availability check
→ (shortage → Purchase Request → PO → GRN) → Release (reserve raw)
→ Issue/Consume materials (raw − , WIP +) → Stages (cut → stitch → assemble → QC → pack)
→ Record output (finished goods +) → Costing (unit cost) → Close
→ Inventory (finished stock) → Sales/POS → Finance (WIP, COGS) → Reports
```

## 3.14 Relationships

Products (BOM, types), Inventory (reservation, consumption, output), Procurement (shortages), Finance (WIP, FG, variances), Sales (demand), Users/teams, Reports, Audit.

## 3.15 Notifications & states

Shortage detected, WO released/started/completed, WO overdue, stage rejected qty above threshold (Production Manager), output posted (Inventory). Empty: "No production orders — Create one from an active BOM"; no active BOM → Alert with "Create BOM". Failures keep entered quantities. **Audited:** BOM activation/versioning, WO release/cancel/close, consumption, output, scrap, cost overrides.

---

# 4. PAYMENTS

## 4.1 Purpose

One unified record of **money in and money out** tied to a business document (order, wallet top-up, supplier invoice, refund, payout), regardless of method or channel.

## 4.2 Users

Finance/Accountant, Cashiers (via POS/orders), Sales staff, Auditors.

## 4.3 Permissions

`payments.view, create, edit` (notes/refs on pending only), `approve` (manual confirmation of transfers, high-value), `process` (record/verify), `refund`, `export`, `settings` (methods, gateway config, reconciliation rules).

## 4.4 Navigation

```text
/payments                    Dashboard & Payment records
/payments/[id]               Payment detail
/payments/refunds            Refunds (+ /[id])
/payments/failed             Failed & pending payments queue
/payments/reconciliation     Bank / gateway reconciliation
/payments/methods            Payment methods & gateways (settings)
```

## 4.5 Dashboard / Overview

KPIs: **Collected (period), Pending, Failed, Refunded, Outstanding receivables, Payments due out (supplier)**. Charts: Payments by method (stacked bars over time), Collection vs. target, Success rate (line), Method split (donut). Alerts: unconfirmed transfers > 1h, failed payments needing action, unreconciled items count.

## 4.6 Payment records list

Search: payment ref, order no., customer, gateway ref, bank ref. Filters: Direction (In/Out), Type (Order, Wallet top-up, Supplier, Refund, Payout, Merchant settlement), Method (Cash, Transfer, Card, Wallet, Cheque, Gateway), Status, Merchant, Date, Amount, Reconciled (yes/no), Recorded by. Columns: Payment # , Date, Type, Party (customer/supplier/merchant), Related document, Method, Amount, Fee, Net, Status, Reconciled ✓, Actions. Bulk: Export, Mark reconciled, Confirm transfers. Row: View, Print receipt, Confirm (pending transfer), Retry (failed, gateway), Refund, Void (Admin, same-day, unreconciled).

## 4.7 Record payment form (shared modal/drawer used by Orders, Customers, Supplier pages)

| Field          | Type                                                                                          | Req                                            | Rules                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Direction/Type | fixed by context                                                                              | —                                              |                                                                                                             |
| Party          | read-only entity                                                                              | —                                              |                                                                                                             |
| Apply to       | document selector (multi: orders/invoices with balance; auto-allocate oldest first, editable) | Yes                                            | Allocation sum = amount (excess → wallet credit for customers, prepayment for suppliers, with confirmation) |
| Amount         | currency                                                                                      | Yes                                            | >0                                                                                                          |
| Method         | select                                                                                        | Yes                                            | Wallet needs balance; Cheque needs cheque no. & date                                                        |
| Account        | select (cash account/bank account/gateway)                                                    | Yes                                            | Filtered by method                                                                                          |
| Reference      | text                                                                                          | Required for Transfer/Card/Cheque              | Unique per account (duplicate warning)                                                                      |
| Date           | date-time                                                                                     | Yes                                            | Not in closed period; not future                                                                            |
| Fee            | currency                                                                                      | No                                             | Gateway/bank charges → expense                                                                              |
| Proof          | file                                                                                          | No (req. above configured amount for Transfer) |                                                                                                             |
| Note           | textarea                                                                                      | No                                             |                                                                                                             |

Submit **Record payment**. Cash/Wallet confirm instantly (`completed`); Transfer/Cheque → `pending` until confirmed (manual by finance or matched in reconciliation); Card/Gateway → status from gateway webhook. Idempotency key on submit.
**After:** allocation updates document balances/payment status; **Finance posts** Dr Cash/Bank(+fees) / Cr AR (or Customer prepayment); receipt generated; referral/commission triggers evaluated if order becomes qualifying.

## 4.8 Payment detail

Header: `PAY-…`, amount, status, direction; actions: Print receipt, Confirm, Retry, Refund, Void, More. Cards: Amount · Fee · Net · Method · Account. Sections: Party & documents (allocation table), Gateway/bank details (ref, auth code, response, timestamps — raw payload in collapsible JSON for finance), Proof files, **Journal entry** link (JE), Reconciliation status (matched bank line), **Timeline**.

## 4.9 Refunds

Created from orders/POS returns (Doc 2) or here. **List:** Refund #, Order, Customer, Amount, Method, Reason, Requested by, Status. **Detail/approve:** shows original payment(s), refundable amount (paid − already refunded), method options (Original method / Wallet / Cash / Bank transfer), approval (limit-based). **Process** → creates outgoing Payment (`refund`), updates order, restock movements if selected, Finance reversal (Dr Sales returns / Cr Cash/Bank/Wallet), **commission reversal** evaluation (Commissions §6.9). Statuses: Requested, Approved, Processing, Completed, Rejected, Failed.

## 4.10 Failed & pending queue

Sections: **Pending confirmation** (transfers/cheques awaiting confirmation — Confirm/Reject with note), **Failed** (gateway/card failures — Retry, Switch method, Contact customer, Dismiss with reason), **Stuck** (processing > 30 min → "Check status" pulls gateway status). SLA ageing colours.

## 4.11 Reconciliation

Stepper: **Select account & period → Upload bank statement (CSV/XLSX; column mapping saved per bank) or fetch via gateway API → Auto-match** (rules: amount + reference + date ±2 days; suggestions ranked) **→ Review**: two-pane view — Statement lines (left) vs System payments (right); actions: Match (drag or select both + Match), Split match, Create missing entry (e.g., bank charge, unrecognised deposit → suspense), Mark ignore (reason). Header shows Statement balance, Book balance, **Difference** → must be 0 to **Complete reconciliation**, which locks matched items and stores a signed report (PDF). Statuses: Draft, In progress, Completed.

## 4.12 Methods & gateways (settings)

Methods: enable/disable per channel (POS/Web/Admin), display name, account mapping, fee rule (flat/%), min/max, requires-reference flag, manager-confirmation flag. Gateways (Paystack/Flutterwave etc. — **configured by backend team; UI shows status, keys masked, webhook URL, test/live badge**, "Test connection").

## 4.13 Statuses

Payment: Pending (info), Processing (info), Completed (success), Failed (error), Cancelled (neutral), Refunded (warning), Partially Refunded (warning), Voided (neutral). Reconciled flag separate.

## 4.14 Workflow

```text
Order/Invoice/Top-up → Record or initiate payment → (gateway/transfer confirm)
→ Completed → Allocation to documents → Finance posting → Receipt
→ Commission/referral qualification checks → Reconciliation (bank) → Reports
Refund path: Request → Approve → Process → Finance reversal → Commission reversal
```

## 4.15 Relationships

Orders, Customers (wallet), POS, Suppliers/Procurement (out), Payouts, Commissions, Finance, Reports, Audit.

## 4.16 Notifications & states

Customer: receipt, refund processed. Finance: transfer pending > 1h, failed payment, reconciliation difference, webhook errors. Toasts: "₦x payment recorded", "Payment confirmed". Empty: "No payments recorded". Gateway down banner. Period closed → date field error "This period is closed". **Audited:** create/confirm/void/refund, reconciliation matches/overrides, gateway settings.

---

# 5. PAYOUTS

## 5.1 Purpose

Move money **out** to referrers/customers (commission withdrawals), merchants (settlements), and staff/others (optional), through a controlled request → approval → processing flow. (Supplier payments use Payments §4, and appear in payout batches only if the client wants unified bank runs.)

## 5.2 Users

Referrers/Customers (request from portal), Merchant Owners (settlement request), Finance Officer (process), Finance Manager/Admin (approve).

## 5.3 Permissions

`payouts.view, create` (create request on behalf), `approve`, `process` (initiate transfers/mark paid), `cancel`, `export`, `settings` (min amounts, schedule, fees, limits, methods). Approval limit per role.

## 5.4 Navigation

```text
/payouts                   Dashboard & requests
/payouts/[id]              Request detail
/payouts/batches           Payout batches (+ /[id])
/payouts/settings          Rules: minimum, schedule, fees, methods
Portal: /account/wallet/withdraw    Merchant: /merchant/settlements
```

## 5.5 Dashboard

KPIs: **Pending Requests (count/₦), Approved awaiting processing, Paid (period), Failed, Avg processing time, Wallet liability (total owed to referrers)**. Charts: Payouts over time (bars), By type (referrer/merchant/other), By status. Table: oldest pending (ageing coloring >48h amber, >5d red).

## 5.6 Requests list

Search: payout no., payee, account no. Filters: Type (Commission withdrawal, Wallet withdrawal, Merchant settlement, Other), Status, Method, Date, Amount, Payee, Batch. Columns: Payout #, Requested, Payee (avatar + type), Source (Commissions/Wallet/Settlement), Amount, Fee, Net, Destination (bank ••••1234), Status, Approved by, Actions. Bulk: **Approve selected**, **Add to batch**, Export bank file (CSV/NIBSS-format per bank template), Reject. Row: View, Approve, Reject, Process, Mark paid manually, Retry, Cancel.

## 5.7 Create payout request (portal for payee; also staff form)

| Field       | Type                                                                                                                                              | Req | Rules                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------------------------------------------------------------------------------- |
| Source      | select: Commission balance / Wallet balance                                                                                                       | Yes | Shows available                                                                  |
| Amount      | currency                                                                                                                                          | Yes | ≥ minimum (setting), ≤ available, ≤ daily/monthly limit; "Withdraw all" shortcut |
| Destination | saved bank accounts select or "Add account" (Bank*, Account no.* 10 digits, Account name auto-resolved & shown; must match payee name (setting) ) | Yes | New account requires OTP verification                                            |
| Note        | text                                                                                                                                              | No  |                                                                                  |

Summary: Fee, **Net to receive**, expected timeline. Submit → status `pending`; funds moved to **hold** (available ↓) so the balance can't be double-spent.

## 5.8 Detail & approval

Header: `PYT-…`, status, amount; actions by state. Cards: Payee summary (KYC status, lifetime payouts, current balance), Source breakdown (which commission records/wallet ledger lines are included — links), Destination (masked; **first-time/changed account flagged red "New destination"**), Risk checks (auto): payee KYC verified, account name match, duplicate request within 24h, amount above payee's average ×3, pending disputes. **ApprovalPanel**: Approve/Reject (reason required for reject; approve above limit requires higher role). Timeline.

## 5.9 Processing

**Approve** → `approved`. **Process** (individually or batch): method options: **Automated bank transfer** (via backend integration: status → `processing`; webhook → `paid`/`failed`) or **Manual** (Finance pays externally and enters: transfer ref*, date*, proof) → `paid`. On `paid`: release hold → deduct source balance, record outgoing Payment (`PAY-…`), Finance posts Dr Commission payable / Wallet liability, Cr Bank (+ fee), payee notified with receipt. On `failed`: funds returned to available, reason shown, retry allowed (max 3) or reject.
**Batches:** create batch from approved requests (select/filters; total, count), review, **Submit batch** (single approval for total), export bank file, upload results file to mark paid/failed en masse (row-level results table). Statuses: Draft, Approved, Processing, Completed, Partially Failed.

## 5.10 Statuses

Pending (info), Approved (info), Processing (info), Paid (success), Failed (error), Rejected (error), Cancelled (neutral), On Hold (warning; compliance).

## 5.11 Settings

Minimum/maximum payout, daily limit, schedule (On request / Weekly Friday / Monthly), fee rule (flat/%/free), auto-approve below ₦x for verified payees (off by default), required KYC level, method availability, holding period after commission approval.

## 5.12 Workflow

```text
Commission approved → Available balance → Payout request (hold) → Risk checks
→ Approval → Process (bank/manual) → Paid → Payment record → Finance posting → Payee receipt → Reports
Failure → funds released → retry/reject
```

## 5.13 Relationships

Commissions, Customers (wallet, bank accounts), Merchants (settlement), Payments (outgoing), Finance, Notifications, Audit.

## 5.14 Notifications & states

Payee (SMS/email/push): request received, approved, paid (with reference), failed, rejected (reason). Finance: new request, awaiting > 48h, batch result, high-risk flag. Empty portal state: "No payouts yet — earn commissions to withdraw". Below-minimum: field error "Minimum withdrawal is ₦x". **Audited:** create/approve/reject/process/manual pay/retry, bank account add/change, settings changes.

---

# 6. COMMISSIONS

## 6.1 Purpose

Calculate, approve, track, and reverse referral commissions across the upline/downline structure using **configurable rules** (the client's percentages, number of levels, earning rules and payout method are still to be confirmed — nothing below hard-codes them).

## 6.2 Users

Referrers/customers (view own), Sales Manager (rules & performance), Finance (approval), Admin, Merchants (if merchant commissions apply).

## 6.3 Permissions

`commissions.view` (own by default), `view_all`, `create` (manual adjustment), `approve`, `process` (mark payable), `cancel`/reverse, `export`, `settings` (plans & rules).

## 6.4 Navigation

```text
/commissions                     Dashboard
/commissions/records             Commission records
/commissions/approvals           Pending approvals queue
/commissions/rules               Plans & rules (+ /new, /[id])
/commissions/simulator           Rule simulator
/commissions/reversals           Reversals
/commissions/[id]                Record detail
Portal: /account/commissions     Earnings (own)
```

## 6.5 Dashboard

KPIs: **Commission Generated (period), Pending Approval, Approved (unpaid), Paid, Reversed, Avg per Referrer, Outstanding Liability**. Charts: Commission trend (stacked Pending/Approved/Paid), By level (bar L1…Ln), Top earners (bar), Commission as % of sales (line). Alerts: records pending approval > 3 days, reversals pending, rules expiring.

## 6.6 Rules & plans (configurable engine)

**Plan (list/form):** Name*, Description, Status, Effective from*/to, Applies to (All products / categories / specific products), Applies to merchants (all/selected), Customer group (all/selected).
**Plan settings:**
| Setting | Options |
|---|---|
| Qualification trigger | Order paid / Order delivered-completed / First order only / Every order / Minimum cumulative spend ₦x |
| Minimum qualifying order value | ₦x |
| Levels | Number of upline levels paid (1…N, N configurable) |
| Rate table | Per level: type (% of net sales / % of margin / fixed ₦ per unit / fixed ₦ per order), value, cap per order, cap per period |
| Base amount | Net of discounts & tax? (yes/no), include delivery fee? (no), exclude refunded portion |
| Approval mode | Auto-approve / Manual approval / Auto below ₦x |
| Holding period | Days after trigger before approval (covers return window) |
| Payout eligibility | Minimum balance, payout method restrictions |
| Overrides | Product-level rule (Products form §G), Merchant-level override, Campaign boosts (start/end, multiplier) |
| Self-referral/fraud rules | Block same phone/device/bank account across chain; max referrals per day |
Rule conflicts resolved by priority: Product override > Campaign > Merchant override > Plan default; the **Simulator** shows the resolved rule.
**Simulator:** pick customer (shows upline chain), products/qty/price → outputs table: Level, Beneficiary, Rate applied, Amount, Rule source, Status (would qualify?) — no records created.
Rule changes apply to **future** orders only; plan versions are immutable snapshots referenced by each commission record.

## 6.7 Commission records

**List:** search COM #, beneficiary, order no., referred customer. Filters: Status, Level, Beneficiary, Source customer, Order, Plan, Merchant, Date, Amount, Payout (paid/unpaid). Columns: Commission #, Date, Beneficiary (avatar/name), **Source** (order link + buyer), Level, Base amount, Rate, **Commission**, Plan/version, Status, Payout ref, Actions. Bulk: Approve, Reject, Export. Row: View, Approve, Reject, Reverse, Adjust (manual), View order.
**Detail:** Header (COM #, status, amount). Sections: **Calculation breakdown** (order lines → eligible base → rate → level → cap applied → result — every step displayed so support can explain it), **Referral chain visual** (buyer → L1 → L2 …, highlighting beneficiary), Related order/payment status, Approval panel, Payout link, **Timeline**, ledger entries.

## 6.8 Calculation & lifecycle

```text
Order event meets plan trigger → Engine resolves rule (priority) → For each upline level up to N:
  compute amount (base × rate, caps) → create record `pending` (with holding period)
→ Holding period ends & order not returned → auto/manual Approval → `approved` (adds to beneficiary Available balance)
→ Payout request → Paid (`paid` when payout completes)
```

Idempotent: one record per (order, level, beneficiary, plan version). Partial payments: commission accrues proportionally or at full payment (plan setting).

## 6.9 Reversal

Triggers: order cancelled, refunded/returned (full or partial → **proportional reversal**), fraud finding, manual. Behavior by status: Pending → cancelled; Approved (unpaid) → reversed (balance decreases); **Paid → creates negative balance / clawback** (deducted from future commissions; flagged for Finance). Reversal record links to original; requires reason; large or paid reversals need approval. Statuses: Reversal Pending → Reversed.

## 6.10 Approvals queue

Table of pending records grouped by order/beneficiary, filters by age, amount; row expand to breakdown; bulk approve (confirm dialog shows count & total); reject requires reason; fraud flags visible (self-referral suspicion, unusual velocity) — flagged records can't be bulk-approved.

## 6.11 Manual adjustment (modal)

Beneficiary*, Type (Bonus / Correction / Clawback)*, Amount*, Reason* (≥10), Attachment; requires `commissions.create` + approval; appears in ledger as `adjustment`.

## 6.12 Beneficiary (portal) view — `/account/commissions`

Balance cards: Pending, Available, Paid, Lifetime. Tabs: Earnings (records), **My network** (levels list/tree with counts and status), Payouts. Referral link/code with copy & share (WhatsApp), QR. Explains each record in plain language ("Level 1 — 5% of ₦40,000 order by Ada O.").

## 6.13 Statuses

Pending (info), Approved (success), Paid (success), Rejected (error), Reversed (error), On Hold (warning: fraud/dispute), Cancelled (neutral).

## 6.14 Relationships

Orders/POS/Payments (triggers), Referrals (chain), Customers (beneficiary balance), Payouts, Finance (commission expense & payable), Products/Merchants (overrides), Reports, Audit.

## 6.15 Notifications & states

Beneficiary: commission earned (pending), approved, paid, reversed (reason). Finance/Sales: approvals waiting, fraud flag, rule expiring. Empty: "No commissions yet — share your referral link" (portal), "No records for filters". Engine failure on an order → `commission_error` flag on order + admin alert with Retry. **Audited:** rule/plan edits (before/after), approvals, rejections, reversals, manual adjustments, engine retries.

---

# 7. FINANCE & ACCOUNTING

## 7.1 Purpose

Double-entry accounting that **consumes events from all modules** to produce ledgers, receivables, payables, statements, periods and reports — without users hand-keying routine entries.

## 7.2 Users

Finance Manager, Accountant, Auditor (read-only), Admin; Owners see summaries.

## 7.3 Permissions

`finance.view, create` (manual journals, expenses), `edit` (drafts), `approve` (manual journals, expenses, period close), `process` (reconciliation), `export`, `settings` (chart of accounts, posting rules, tax, periods). `finance.close_period` restricted to Finance Manager/Admin.

## 7.4 Navigation

```text
/finance                        Overview dashboard
/finance/accounts               Chart of Accounts
/finance/ledger                 General Ledger (+ /journals, /journals/[id])
/finance/transactions           All transactions (cash & bank accounts)
/finance/receivables            Accounts Receivable (customers/merchants)
/finance/payables               Accounts Payable (suppliers)
/finance/expenses               Expenses (+ /new)
/finance/periods                Financial periods
/finance/reconciliation         Reconciliation hub (links to Payments recon; inventory & AR/AP checks)
/finance/reports                Statements (P&L, Balance Sheet, Cash Flow, Trial Balance…)
/finance/settings               Accounts mapping, posting rules, tax
```

## 7.5 How financial data is generated (automatic posting rules)

| Event (source module)                 | Journal entry                                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Order completed/invoiced (Sales)      | Dr Accounts Receivable (or Cash if paid) / Cr Sales Revenue / Cr VAT payable                                    |
| COGS at issue (Inventory)             | Dr Cost of Goods Sold / Cr Inventory (at avg cost snapshot)                                                     |
| Customer payment (Payments)           | Dr Cash/Bank (+ Dr Bank charges) / Cr Accounts Receivable                                                       |
| Wallet top-up                         | Dr Cash/Bank / Cr Customer wallet liability; wallet spend: Dr Wallet liability / Cr AR/Revenue                  |
| POS sale                              | As order; cash → POS cash account; session close moves cash to Cash at hand; shortage/overage → Cash over/short |
| Sales return/refund (Orders/Payments) | Dr Sales returns (contra-revenue) & Dr Inventory/Cr COGS if restocked / Cr Cash/AR/Wallet                       |
| GRN posted (Procurement)              | Dr Inventory / Cr GRNI                                                                                          |
| Supplier invoice approved             | Dr GRNI (± Price variance) (+ Dr Input VAT) / Cr Accounts Payable                                               |
| Supplier payment                      | Dr Accounts Payable / Cr Bank/Cash                                                                              |
| Production: materials issued          | Dr WIP / Cr Raw materials inventory                                                                             |
| Production: labour/overhead applied   | Dr WIP / Cr Labour applied / Overhead applied                                                                   |
| Production: output                    | Dr Finished goods inventory / Cr WIP; variance on close → Production variance                                   |
| Commission approved (Commissions)     | Dr Commission expense / Cr Commissions payable                                                                  |
| Commission reversed                   | Dr Commissions payable (or Receivable if paid) / Cr Commission expense                                          |
| Payout paid (Payouts)                 | Dr Commissions payable (or Wallet liability / Merchant settlement payable) / Cr Bank (+ Dr Fees)                |
| Inventory adjustment/write-off        | Dr/Cr Inventory shrinkage expense vs Inventory                                                                  |
| Manual expense                        | Dr Expense account / Cr Bank/Cash/AP                                                                            |

Each posting stores `source_module`, `source_id`, `event`, is **idempotent**, dated by the source document date, and is blocked if the period is closed (queued to next open period with a flag). Posting failures appear in **Finance → Overview → "Unposted events"** with Retry.

## 7.6 Overview dashboard

KPIs: **Revenue, Cost of Sales, Gross Profit (margin %), Operating Expenses, Net Profit/Loss, Cash & Bank Balance, Receivables, Payables, Commissions Payable**. Charts: Revenue vs Expenses (monthly grouped bars + profit line), Cash flow (in/out/net area), Expense breakdown (donut), AR ageing (stacked bar), AP ageing. Sections: Unposted events (errors), Unreconciled items, Period status chip & "Close period" checklist progress, Upcoming payables (next 7 days), Overdue receivables top 10.

## 7.7 Chart of accounts

Tree/table: Code, Name, Type (Asset, Liability, Equity, Revenue, COGS, Expense), Sub-type, Normal balance, Balance, Active, System (locked). Form (drawer): Code* (unique, numeric), Name*, Parent, Type\*, Description, Tax code, Allow manual posting (switch). Defaults seeded (e.g., 1000 Cash, 1010 Bank, 1100 AR, 1200 Inventory–Raw, 1210 Inventory–Finished, 1220 WIP, 1300 GRNI, 2000 AP, 2100 Wallet liability, 2110 Commissions payable, 2120 Merchant settlements payable, 2200 VAT payable, 3000 Equity, 4000 Sales, 4100 Sales returns, 5000 COGS, 6xxx Expenses…). System accounts can't be deleted; accounts with entries can't be deleted (deactivate).

## 7.8 General ledger & journals

**Ledger view:** filters Account*, Date range, Source module, Party, Amount, Reference; columns Date, JE #, Account, Description, Debit, Credit, Running balance, Source (EntityLink), Posted by. Export. **Journal list:** JE #, Date, Type (Auto/Manual/Reversal), Description, Total, Status (Posted/Draft/Awaiting Approval/Reversed), Source.
**Journal detail:** balanced lines table (Account, Debit, Credit, Party, Memo), source document link, audit trail; action **Reverse** (creates mirrored entry; reason; period must be open).
**Manual journal form:** Date*, Reference, Description*, Lines (Account*, Debit/Credit, Memo, Party, Cost centre) with **live balance check** (Debits = Credits required to submit), Attachment; → approval → post. Not allowed on system control accounts (AR/AP/Inventory) except with `finance.approve` + reason.

## 7.9 Transactions (cash & bank)

Account selector (Cash, each bank account, gateway clearing, POS floats) → statement-like table (Date, Description, Source, In, Out, Balance, Reconciled). Actions: **Transfer between accounts** (modal: From, To, Amount, Date, Ref → JE), Export.

## 7.10 Receivables

Ageing summary cards (Current, 1–30, 31–60, 61–90, 90+), table by customer/merchant: Balance, Oldest invoice, Credit limit, Overdue. Detail: statement (invoices, payments, credit notes) with **Send reminder** (SMS/email, templated), **Record payment**, **Write off** (approval; Dr Bad debt/Cr AR), **Statement PDF**. Filters: party type, ageing bucket, merchant, overdue only.

## 7.11 Payables

Mirror of receivables for suppliers: ageing, **Due this week/month** view, select multiple invoices → **Pay selected** (creates supplier payments, optionally as batch), prepayments/credit notes application, supplier statement. Filters: supplier, due date, status.

## 7.12 Expenses

List: Expense #, Date, Category (account), Payee, Amount, Method, Merchant/Cost centre, Status, Receipt ✓. Form: Date*, Category* (expense account), Payee (supplier or free text), Amount*, Tax, Paid from* (account) or **On credit** (→ AP), Reference, Receipt upload (required above ₦x), Cost centre, Notes; approval by threshold → posts. Recurring expenses (monthly rent) as templates (v2).

## 7.13 Financial periods

Table: Period (e.g., Sep 2026), Start, End, Status (Open, Closing, Closed, Locked), Closed by/at. **Close period checklist** (drawer): all POS sessions closed ✓, no unposted events ✓, payments reconciled ✓ (warn), GRNs vs invoices reviewed (warn), inventory valuation reconciled to ledger ✓, depreciation/accruals posted (manual confirm). Blockers must be zero to close; warnings acknowledged. **Close** requires typed period name; **Reopen** (`finance.close_period`, reason, audited) only if next period not closed. Locked = year-end final.

## 7.14 Reconciliation hub

Cards for: **Bank/gateway** (Payments §4.11 status per account), **Inventory subledger vs GL** (difference + drill), **AR subledger vs GL**, **AP subledger vs GL**, **Wallet liability vs customer wallets**, **Commissions payable vs unpaid commissions**. Each shows Balanced ✓ / Difference ₦x with **Investigate** drill to transactions.

## 7.15 Financial reports (statements)

Profit & Loss (period, compare with previous period/year, by merchant/cost centre, monthly columns), Balance Sheet (as-of), Cash Flow (direct & indirect toggle), Trial Balance, General Ledger export, AR/AP ageing, Sales tax (VAT) summary, Inventory valuation, Commission liability. Common controls: period selector, compare toggle, basis (Accrual), export PDF/Excel/CSV, print; **drill-down**: click any amount → account ledger → journal → source document. Full report catalogue and layouts in Doc 4 (Reporting).

## 7.16 Statuses

Journal: Draft, Awaiting Approval, Posted, Reversed, Rejected. Expense: Draft, Awaiting Approval, Approved/Posted, Rejected, Paid. Period: Open, Closing, Closed, Locked. Receivable/Payable item: Open, Partially Paid, Paid, Overdue, Written off.

## 7.17 Workflow

```text
Operational events (sales, payments, GRN, invoices, production, commissions, payouts, adjustments)
→ Posting rules → Journal entries (auto) → General Ledger
→ AR/AP subledgers, Cash & bank, Inventory & WIP values
→ Reconciliation checks → Period close checklist → Close
→ Financial statements → Reports & Analytics (drill back to source documents)
```

## 7.18 Relationships

Every module (posting sources), Payments (bank recon), Reports, Audit, Settings (tax, numbering).

## 7.19 Notifications & states

Finance: unposted event failures, period close reminder (3 days before month end), reconciliation differences, invoices due, manual journal awaiting approval, large expense. Toasts: "JE-… posted". Empty ledgers: "No entries for this period". Closed period actions blocked with Alert + link to reopen (permissioned). Unbalanced journal → inline total mismatch, Submit disabled. **Audited:** every manual journal, reversal, period open/close, account changes, posting-rule changes, write-offs.

---

## Cross-module mock data requirements (Doc 3)

- **Procurement:** 25 PRs and 30 POs covering all statuses (incl. partially received, on-hold invoice with price variance, overdue delivery); 20 GRNs with rejections; 25 supplier invoices across ageing buckets.
- **Inventory:** 5 locations (Central, Production floor, 2 merchant shops, Quarantine), 80+ stock rows, 300+ movements of every type with balanced running totals, 6 transfers in each state, 4 adjustments, 1 count with variances, batches with expiry on 5 items.
- **Production:** 6 BOMs (2 versions of one), 12 WOs across statuses (one blocked by shortage, one with scrap and cost variance), WIP spread across 5 stages.
- **Payments/Payouts:** 200 payments across methods (some pending transfers, failed card, unreconciled), 15 refunds, bank statement CSV fixture with 10% mismatches; 30 payout requests across states, 3 batches, 2 flagged risky (new destination).
- **Commissions:** 3 plans (default, campaign boost, merchant override); 150 records across statuses and levels 1–3 traceable to real orders and referral chains; 6 reversals (pending, approved, paid-clawback cases).
- **Finance:** chart of accounts seeded; journals auto-generated from the mock events above so trial balance balances to zero difference; 3 periods (2 closed, 1 open); AR/AP ageing consistent with orders and invoices.
  All mock IDs cross-reference (PO → GRN → movement → JE; Order → payment → commission → payout → JE).

---

_Next: Document 4 — Referrals, Reporting & Administration (Referral management, Report catalogue, Dashboards per role, Audit logs, Users/Roles matrix, Settings). Then Document 5 — Cross-Module Workflows._

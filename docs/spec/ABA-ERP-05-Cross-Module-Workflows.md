# BuyNaija ERP — Document 5: Cross-Module Workflows, Event Map & Implementation Guidance

**Purpose:** Ties Docs 1–4 together. Defines the end-to-end workflows, the **domain event map** that connects modules, the **status-transition rules** each module must enforce, the UI touchpoints (links, badges, toasts, invalidations) that make ABA one interconnected system, and the recommended build order for the existing Next.js app.
**Reading guide:** Each workflow has (a) a flow, (b) step table: _actor → screen → action → system effects → modules touched_, (c) exceptions, (d) UI/frontend requirements, (e) mock-mode behaviour.

---

## 1. Domain Event Map (the backbone)

Modules do not call each other's internals. They emit **domain events**; other modules subscribe. In **live mode** the backend handles this; in **mock mode** the mock store (Doc 1 §16.3) simulates the same effects so the UI behaves identically. The frontend's job is to (1) trigger the right action, (2) invalidate the right queries, (3) show the effects via links/timelines.

| Event                                      | Emitted by  | Consumed by (effects)                                                                                            |
| ------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `order.placed`                             | Orders/POS  | Inventory (reserve), Customers (last order), Audit                                                               |
| `order.approved`                           | Orders      | Orders (→ pending), Notifications                                                                                |
| `payment.completed`                        | Payments    | Orders (paid status), Customers (wallet/balance), Finance (JE), Commissions (qualification check), Notifications |
| `order.fulfilled`                          | Orders      | Inventory (issue), Finance (COGS), Commissions (if trigger = delivered)                                          |
| `order.completed`                          | Orders      | Finance (revenue/AR), Referrals (qualify), Commissions (engine), Reports cache                                   |
| `order.cancelled`                          | Orders      | Inventory (release), Payments (refund request), Commissions (cancel pending)                                     |
| `return.approved`                          | Orders/POS  | Inventory (restock/quarantine), Payments (refund), Finance, Commissions (reversal)                               |
| `refund.completed`                         | Payments    | Orders (status), Finance (reversal), Commissions (proportional reversal), Customers (wallet if chosen)           |
| `pr.approved`                              | Procurement | Procurement (ready to convert), Notifications                                                                    |
| `po.issued`                                | Procurement | Suppliers (open PO), Notifications, Finance (commitment—informational only)                                      |
| `grn.posted`                               | Procurement | Inventory (receipt movement + valuation), Finance (Dr Inventory/Cr GRNI), PO progress                            |
| `supplier_invoice.approved`                | Procurement | Finance (AP), Suppliers (balance)                                                                                |
| `supplier_payment.completed`               | Payments    | Finance (AP cleared), Suppliers (balance), Procurement (invoice paid)                                            |
| `stock.low`                                | Inventory   | Procurement (suggested PR), Notifications, Sidebar badge                                                         |
| `transfer.shipped / received`              | Inventory   | Inventory (in-transit/destination), Finance (inter-location value; no P&L effect), Merchants (stock)             |
| `adjustment.posted`                        | Inventory   | Finance (shrinkage/gain)                                                                                         |
| `wo.released`                              | Production  | Inventory (reserve materials)                                                                                    |
| `wo.materials_issued`                      | Production  | Inventory (consume), Finance (Dr WIP/Cr Raw)                                                                     |
| `wo.output_recorded`                       | Production  | Inventory (finished goods +), Finance (Dr FG/Cr WIP)                                                             |
| `wo.closed`                                | Production  | Finance (variances), Reports (cost)                                                                              |
| `referral.qualified`                       | Referrals   | Commissions (engine), Notifications                                                                              |
| `commission.created / approved / reversed` | Commissions | Customers (balances), Finance (expense/payable), Notifications, Payouts (available)                              |
| `payout.requested`                         | Payouts     | Commissions/Wallet (hold), Notifications                                                                         |
| `payout.paid / failed`                     | Payouts     | Payments (outgoing record), Finance (Dr payable/Cr bank), Commissions (paid), Notifications                      |
| `pos.session_closed`                       | POS         | Finance (cash handover, over/short), Reports                                                                     |
| `period.closed`                            | Finance     | All posting modules (block backdated), Reports                                                                   |
| `*` (every mutation)                       | All         | **Audit** (immutable entry)                                                                                      |

**Frontend invalidation map** (single file `lib/invalidation.ts`; extends Doc 1 §16.4):

```text
completeOrder      → orders.*, inventory.stock, inventory.movements, payments.*, finance.overview,
                     commissions.*, referrals.*, customers.detail, dashboard.*, nav.counts
recordPayment      → payments.*, orders.detail, customers.detail(wallet), finance.*, commissions.pending
receiveGoods       → procurement.po.detail, procurement.grn.*, inventory.*, finance.payables, nav.counts
approveCommission  → commissions.*, customers.commissions, payouts.available, finance.overview, nav.counts
processPayout      → payouts.*, payments.*, commissions.paid, finance.*, nav.counts
postProductionOutput → production.wo.detail, inventory.*, finance.*, dashboard.production
closeSession       → pos.*, finance.transactions, reports.pos
```

---

## 2. Status Lifecycles & Allowed Transitions (single source of truth)

UI rule: action buttons render **only for allowed transitions** for the user's permissions (hidden if no permission, disabled with tooltip if state prevents). All terminal states are read-only.

| Entity                         | Transitions                                                                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Order**                      | Draft → (Awaiting Approval) → Pending → Processing → Ready → Out for Delivery → Completed · Any pre-Completed → Cancelled · Completed → Partially Refunded → Refunded |
| **Payment (order)**            | Unpaid → Partially Paid → Paid · Paid → Partially Refunded → Refunded · Unpaid/Partially → Overdue (computed) · Failed → (retry) Pending                              |
| **Payment record**             | Pending/Processing → Completed \| Failed \| Cancelled · Completed → Partially Refunded \| Refunded \| Voided (same-day)                                               |
| **PR**                         | Draft → Awaiting Approval → Approved \| Rejected \| (Changes requested → Draft) · Approved → Converted · Any → Cancelled                                              |
| **PO**                         | Draft → Awaiting Approval → Approved → Ordered → Partially Received → Received → Closed · Ordered/Approved → Cancelled (if nothing received)                          |
| **Supplier invoice**           | Draft → Matched \| On Hold → Approved → Partially Paid → Paid · On Hold → Approved (variance override) \| Void                                                        |
| **Transfer**                   | Draft → Awaiting Approval → Approved → In Transit → Partially Received → Completed · Pre-shipment → Cancelled                                                         |
| **Adjustment / Count**         | Draft → Awaiting Approval → Posted \| Rejected · Count: Draft → Counting → Under Review → Posted                                                                      |
| **BOM**                        | Draft → Active → Archived                                                                                                                                             |
| **Production order**           | Draft → Planned → Released → In Progress ⇄ Paused → Completed → Closed · Pre-completion → Cancelled                                                                   |
| **Referral**                   | Registered → Ordered → Pending Qualification → Qualified \| Expired · Any → Flagged → Qualified \| Disqualified                                                       |
| **Commission**                 | Pending → Approved → Paid · Pending/Approved → Rejected \| Reversed \| On Hold · Paid → (clawback record) Reversed                                                    |
| **Payout**                     | Pending → Approved → Processing → Paid \| Failed → (retry) Processing \| Rejected · Pending/Approved → Cancelled · Any → On Hold                                      |
| **Refund**                     | Requested → Approved → Processing → Completed \| Rejected \| Failed                                                                                                   |
| **Journal**                    | Draft → Awaiting Approval → Posted → Reversed (by new entry)                                                                                                          |
| **Period**                     | Open → Closing → Closed → Locked · Closed → Open (reopen, privileged)                                                                                                 |
| **POS session**                | Open → Closing → Closed \| Force-closed                                                                                                                               |
| **Merchant / User / Supplier** | Pending/Invited → Active ⇄ Suspended/On hold → Inactive/Deactivated                                                                                                   |

---

## 3. Workflow 1 — Sales (Admin/Storefront order → completion)

```text
Customer → Product → Sales Order → (Approval) → Payment → Inventory → Fulfilment → Finance → Reporting
```

| #   | Actor           | Screen                          | Action                                     | System effects                                                                                                                                                                        | Modules                              |
| --- | --------------- | ------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | Sales officer   | `/orders/new`                   | Select customer, merchant, add items       | Live stock check per line, price list applied, credit/wallet shown                                                                                                                    | Customers, Products, Inventory       |
| 2   | Sales officer   | Order form                      | **Place order**                            | Order `Pending` (or `Awaiting Approval` if discount/credit beyond limit); stock **reserved**; `order.placed`. **WhatsApp alert** sent to Merchant/Vendor for instant fulfillment prep | Orders, Inventory, Audit             |
| 2a  | Approver        | Approval drawer / Action Center | Approve/Reject                             | Approve → `Pending`; reject → `Cancelled` w/ reason; requester notified                                                                                                               | Orders, Notifications                |
| 3   | Cashier/Finance | Order detail → Record payment   | Enter payment                              | `payment.completed`; order Paid/Partially Paid; JE Dr Cash/Cr AR; receipt. **WhatsApp update** to Customer ("Payment confirmed")                                                      | Payments, Orders, Finance, Customers |
| 4   | Warehouse       | Order detail → Fulfil           | Pack/ship/deliver (partial allowed)        | `order.fulfilled`; stock **issued** (reservation → movement); JE Dr COGS/Cr Inventory. **WhatsApp update** to Customer ("Order Shipped/Delivered")                                    | Inventory, Finance                   |
| 5   | System          | —                               | Order fully paid + delivered ⇒ `Completed` | `order.completed`; revenue recognised (Dr AR/Cash…Cr Sales/VAT); referral qualification check; commission engine                                                                      | Finance, Referrals, Commissions      |
| 6   | Manager         | `/sales`, `/reports`            | Review                                     | Dashboards/reports refresh via invalidation                                                                                                                                           | Reports                              |

**Exceptions:** insufficient stock (block or backorder), price changed between load and place (banner + refresh), payment failure (retry/other method, order stays `Pending`), cancel after payment (auto **refund request**), partial delivery (order stays `Processing`), credit sale over limit (approval), period closed for chosen date (error on backdated payment).
**UI requirements:** order detail's **Overview** shows a "Related records" panel linking payment(s), stock movements, invoice, journal entry, referral & commissions; StepIndicator reflects status; every toast names the record ("Order ORD-10482 placed").
**Mock mode:** placing an order decrements _available_ (not on-hand); fulfil decrements on-hand; payment creates a JE in the mock ledger; completion creates commission records if the customer has an upline.

---

## 4. Workflow 2 — Merchant POS Sale

```text
POS Session → Product Selection → Cart → Customer → Payment → Receipt → Inventory → Sales → Finance → Commission
```

| #   | Actor           | Screen               | Action                                                          | Effects                                                                                                                                                              |
| --- | --------------- | -------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Cashier         | `/pos/session/open`  | Enter opening cash                                              | Session `Open`; float recorded                                                                                                                                       |
| 2   | Cashier         | `/pos/sell`          | Scan/tap products                                               | Cart lines; stock chips update live                                                                                                                                  |
| 3   | Cashier         | Cart                 | Select customer (or walk-in), optional referral code, discounts | Discount over limit → manager PIN                                                                                                                                    |
| 4   | Cashier         | Payment sheet        | Cash / Transfer / Card / Wallet / Split                         | Tender rows sum to total                                                                                                                                             |
| 5   | System          | —                    | **Complete sale** (idempotent)                                  | Order created `Completed` (channel POS) → payments recorded → stock **issued** at merchant location → JE (sales, COGS, cash/clearing) → referral/commission triggers |
| 6   | Cashier         | Success screen       | Print/SMS/email receipt, New sale                               | Receipt saved; audit                                                                                                                                                 |
| 7   | Cashier/Manager | `/pos/session/close` | Count cash → reconcile → close                                  | Expected vs counted; `pos.session_closed` → Finance cash handover & over/short JE; session report                                                                    |

**Exceptions:** offline (cash/hold only; queue with idempotency keys; conflicts on sync surfaced to manager), transfer never arrives (timeout → keep waiting/change method), card failure (order not created; cart preserved), returns (see §12), stale session >24h (manager forced close), closing with held orders (must resolve).
**UI requirements:** POS uses separate shell; toasts ≤2s, non-blocking; the "≤4 taps" happy path must be preserved by any change. POS orders appear in ERP Orders with channel chip "POS" and link to session.

---

## 5. Workflow 3 — Procurement (Request → Payment)

```text
Purchase Request → Approval → Purchase Order → Supplier → Goods Received → Inventory Updated → Supplier Invoice → Payment → Finance
```

| #   | Actor                 | Screen                                                                      | Action                                                                         | Effects                                                                                                                                          |
| --- | --------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Requester / system    | `/procurement/requests/new` (or "Create request" from low-stock / shortage) | Submit PR                                                                      | PR `Awaiting Approval`; approver notified                                                                                                        |
| 2   | Approver              | PR detail / Action Center                                                   | Approve / Reject / Request changes                                             | `pr.approved`                                                                                                                                    |
| 3   | Procurement           | PR list → Convert                                                           | Group by supplier → create PO(s)                                               | PR → `Converted`; PO `Draft` prefilled                                                                                                           |
| 4   | Procurement / Finance | PO detail                                                                   | Submit → (threshold approval) → **Issue PO**                                   | PO `Ordered`; PDF/email to supplier; supplier's open PO list                                                                                     |
| 5   | Warehouse             | `/procurement/receiving/new?po=`                                            | Post GRN (full or partial; accept/reject qty)                                  | `grn.posted`: **Inventory + accepted qty**, valuation updated, JE Dr Inventory/Cr GRNI; PO `Partially Received`/`Received`; rejects → Quarantine |
| 6   | Accountant            | `/procurement/invoices/new`                                                 | Enter supplier invoice; 3-way match                                            | Match OK → `Approved`, JE Dr GRNI/Cr AP; mismatch → `On Hold` until resolved                                                                     |
| 7   | Finance               | Payables → Pay selected                                                     | Supplier payment                                                               | `supplier_payment.completed`: JE Dr AP/Cr Bank; invoice `Paid`; supplier balance ↓                                                               |
| 8   | System                | —                                                                           | Supplier performance metrics recalculated (on-time, fill rate, price variance) | Suppliers, Reports                                                                                                                               |

**Exceptions:** over-receipt beyond tolerance (blocked), short delivery (PO stays open or **Close short**), invoice price variance (hold + approval), supplier credit note/return (Purchase Return → stock out → debit note), PO amended after issue (revision + re-approval if total ↑>5%), supplier over credit limit (warning), cancelled PO after partial receipt (blocked → close short).
**UI requirements:** PO detail shows StepIndicator through _Paid_; every stage links to the next document (PO → GRN → Invoice → Payment); Action Center aggregates pending approvals; low-stock table has bulk "Create request".

---

## 6. Workflow 4 — Inventory (Stock change map)

```text
Receipts (+) · Production output (+) · Returns (+) · Transfers in (+)  →  STOCK  →  Sales/POS issue (−) · Production consumption (−) · Transfers out (−) · Adjustments (±) · Purchase returns (−)
```

| Trigger                        | Movement               | Location effect                    | Finance effect                              |
| ------------------------------ | ---------------------- | ---------------------------------- | ------------------------------------------- |
| GRN posted                     | Receipt                | + warehouse                        | Dr Inventory / Cr GRNI                      |
| Order placed / WO released     | Reservation            | Available ↓ (on-hand unchanged)    | none                                        |
| Order fulfilled / POS complete | Sales issue            | − source                           | Dr COGS / Cr Inventory                      |
| Sales return (resellable)      | Sales return           | + (or Quarantine if damaged)       | Dr Inventory / Cr COGS (+ revenue reversal) |
| Materials issued to WO         | Production consumption | − raw                              | Dr WIP / Cr Raw                             |
| Output recorded                | Production output      | + finished                         | Dr FG / Cr WIP                              |
| Transfer shipped/received      | Transfer out/in        | − source → transit → + destination | none (or inter-branch clearing)             |
| Adjustment/count posted        | Adjustment ±           | ±                                  | Dr/Cr Shrinkage vs Inventory                |
| Write-off                      | Write-off              | −                                  | Dr Write-off expense                        |

**Alerts loop:** `stock.low` → sidebar badge + notification → dashboard low-stock table → **Create request** → PR (Workflow 3) → GRN → stock restored → alert clears.
**UI requirements:** every quantity number on Stock Levels opens the movement drawer; movement rows link back to their source document; no screen ever edits a balance directly.

---

## 7. Workflow 5 — Production

```text
Production Request → BOM → Raw Materials Check → Production Order → Material Consumption → Stages → Finished Goods → Inventory → Sales
```

| #   | Actor                | Screen                   | Action                                       | Effects                                                                      |
| --- | -------------------- | ------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Production mgr       | `/production/orders/new` | Choose product (active BOM), qty, dates      | Requirement panel computes materials incl. wastage; shortage flags           |
| 2   | Production mgr       | Same                     | Shortage → **Create purchase request**       | Workflow 3 starts; WO stays `Planned`                                        |
| 3   | Production mgr       | WO detail                | **Release**                                  | Materials **reserved**; `wo.released`                                        |
| 4   | Storekeeper          | WO → Materials → Issue   | Issue to floor                               | `Production consumption` movements; JE Dr WIP/Cr Raw                         |
| 5   | Operators/Supervisor | WIP board / WO → Stages  | Start/complete stages with good/rejected qty | Stage progress; scrap recorded with reason                                   |
| 6   | Supervisor           | WO → Output              | **Record output** (partial allowed)          | Finished goods **+** at output location; JE Dr FG/Cr WIP; unit cost computed |
| 7   | Production mgr       | WO → Close               | Review variance (price/usage/yield)          | `wo.closed`: variance JE; report data final                                  |
| 8   | Sales                | Orders/POS               | Finished goods now sellable                  | Workflow 1/2                                                                 |

**Exceptions:** material shortage mid-run (Pause with reason; request more), over-consumption (variance flagged; approval above tolerance), rejects beyond threshold (alert), BOM change mid-order (WO keeps its version), cancel after consumption (WIP loss requires approval), partial output before completion.
**UI requirements:** BOM shows resulting standard cost and margin; WO header shows progress and cost per unit vs standard; shortage rows always carry an action button to procurement.

---

## 8. Workflow 6 — Referral → Commission → Payout → Finance

```text
Customer → Referral (code/link) → Referred Customer → Order → Qualified Referral → Commission (pending) → Approval → Available → Payout Request → Approval → Payout → Finance → Reporting
```

| #   | Actor             | Screen                      | Action                                                                                                                  | Effects                                                                                         |
| --- | ----------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | Referrer          | `/account/referrals/share`  | Copies link/code                                                                                                        | Clicks tracked                                                                                  |
| 2   | Prospect          | Storefront/POS              | Signs up or enters code                                                                                                 | Referral `Registered`; upline set (first attribution wins; self/circular blocked)               |
| 3   | Referred customer | Orders/POS                  | Places and pays first qualifying order                                                                                  | Referral `Ordered` → `Pending Qualification`                                                    |
| 4   | System            | —                           | Trigger met (per plan: paid / delivered / min spend)                                                                    | `referral.qualified` → Referral `Qualified`                                                     |
| 5   | System            | —                           | Commission engine resolves rule (product > campaign > merchant > plan) and creates records per upline level (with caps) | Commissions `Pending` (holding period); referrer notified                                       |
| 6   | System / Finance  | Commissions approvals queue | Holding period ends, no return/fraud flag → auto/manual **Approve**                                                     | `Approved`; beneficiary _Available_ balance ↑; JE Dr Commission expense/Cr Commissions payable  |
| 7   | Beneficiary       | `/account/wallet/withdraw`  | Payout request                                                                                                          | Amount **held**; `Pending`                                                                      |
| 8   | Finance           | Payouts                     | Risk checks → Approve → Process (bank/manual/batch)                                                                     | `Processing` → `Paid`/`Failed`                                                                  |
| 9   | System            | —                           | `payout.paid`                                                                                                           | Payment (out) record; JE Dr Commissions payable/Cr Bank; commissions → `Paid`; receipt to payee |
| 10  | Manager           | Reports                     | Referral & commission reports                                                                                           | Reconciles: Commissions payable = unpaid approved commissions                                   |

**Exceptions:** refund/return before/after approval (Workflow 12), fraud flag (commissions `On Hold` → cleared/disqualified), payout failure (release hold, retry ≤3), payee bank name mismatch (flag), upline reassignment (recalculates pending only), plan changed mid-way (old records keep their plan version).
**Open client decisions (config, not code):** number of levels, rates per level, qualification trigger, holding period, payout method/minimum. UI must not embed any of these values.

---

## 9. Workflow 7 — Payment (Money in / out)

```text
Document (Order/Invoice/Top-up/Supplier invoice) → Payment initiated → Confirmation (instant / gateway / manual) → Allocation → Finance posting → Receipt → Reconciliation
```

- **In:** Order/wallet payments (Cash, Transfer, Card, Wallet, Cheque). Instant methods complete immediately; Transfer/Cheque remain `Pending` until confirmed (manual by Finance or matched at reconciliation); Card/Gateway resolve by webhook.
- **Out:** Supplier payments, refunds, payouts, expenses — all create Payment records with direction _Out_.
- **Allocation:** one payment can settle multiple documents; excess becomes wallet credit (customers) or prepayment (suppliers) after explicit confirmation.
- **Reconciliation:** monthly per bank/gateway account (Doc 3 §4.11); unmatched items create suspense entries requiring resolution before period close.
  **Exceptions:** duplicate reference (warning), gateway timeout ("Check status"), payment into a closed period (blocked/queued), chargeback (manual reversal journal + flagged).

---

## 10. Workflow 8 — Finance Posting & Period Close (Month-end)

```text
Operational events → Auto journals → Ledger → Subledger checks → Reconciliations → Period checklist → Close → Statements → Reports
```

| Step | Owner               | Screen                         | Gate                                                            |
| ---- | ------------------- | ------------------------------ | --------------------------------------------------------------- |
| 1    | All modules         | —                              | Events post automatically; failures listed in _Unposted events_ |
| 2    | POS managers        | `/pos`                         | All sessions closed                                             |
| 3    | Finance             | Payments → Reconciliation      | Bank/gateway accounts reconciled (warning if not)               |
| 4    | Inventory           | Inventory → Valuation / Counts | Valuation = GL (difference 0)                                   |
| 5    | Procurement/Finance | Procurement                    | GRNs without invoice reviewed (GRNI clearing)                   |
| 6    | Finance             | Finance → Reconciliation hub   | AR, AP, Wallet liability, Commissions payable subledgers = GL   |
| 7    | Accountant          | Journals                       | Accruals/adjustments posted and approved                        |
| 8    | Finance Manager     | Periods → Close                | Blockers = 0; typed confirmation → `Closed`                     |
| 9    | Finance/Owner       | Reports                        | P&L, Balance Sheet, Cash Flow generated; drill to source        |

**Exceptions:** late backdated event (queued into next open period with flag), reopen (privileged, audited, next period must be open), lock at year end.

---

## 11. Workflow 9 — Stock Transfer to Merchant & Merchant Settlement

**Restock:** Merchant manager → Transfer request (`/inventory/transfers/new`) → Warehouse approves → Ships (in transit) → Merchant receives (per-line, discrepancies recorded) → Merchant stock ↑ → merchant can sell via POS.
**Settlement (for merchants who collect on ABA's behalf or earn margins):** POS/orders accumulate merchant balance → Merchant requests settlement (or schedule) → Finance reviews (collections vs commissions vs stock invoices) → Payout (type _Merchant settlement_) → Payment out → JE Dr Merchant settlement payable/Cr Bank → statement to merchant.
**Exceptions:** stock discrepancy on receipt (adjustment + flag), negative settlement (merchant owes ABA → receivable), suspended merchant (block new POS sales; open sessions must be closed first).

---

## 12. Workflow 10 — Returns, Refunds & Commission Reversal

```text
Return request → Approval → Inventory (restock/quarantine) → Refund (approval) → Payment out → Finance reversal → Commission reversal → Reports
```

| Step                                      | Effect                                                                                                                                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------- |
| Return created (order or POS)             | Lines/qty validated against sold − already returned; reason + condition captured                                                                                                                                                      |
| Return approved                           | Restock (resellable) or Quarantine/write-off (damaged); Dr Inventory/Cr COGS or Dr Write-off                                                                                                                                          |
| Refund requested → approved (limit-based) | Method: original / wallet / cash / transfer                                                                                                                                                                                           |
| Refund completed                          | Payment out; JE Dr Sales returns/Cr Cash                                                                                                                                                                                              | Bank | Wallet; order → Partially Refunded / Refunded |
| Commission reversal                       | For each commission from that order: **Pending → cancelled**, **Approved-unpaid → reversed**, **Paid → clawback** against future earnings. Amounts proportional to refunded value. Beneficiaries notified; Finance sees clawback list |
| Referral effect                           | If the qualifying order is fully refunded before holding period end, referral returns to `Pending Qualification` (setting)                                                                                                            |

**UI:** refund drawer shows a **"Downstream impact" preview** (stock restocked, journal entries, commissions affected with amounts) before confirmation; order Timeline records each step.

---

## 13. Workflow 11 — Customer Wallet

Top-up (Payment in → Dr Cash/Cr Wallet liability) → Spend at order/POS (Wallet tender → Dr Wallet liability/Cr AR/Revenue) → Commission payout to wallet (option: Dr Commissions payable/Cr Wallet liability) → Withdrawal (Payout: Dr Wallet liability/Cr Bank) → Refund to wallet. Ledger is append-only; balance = Σ entries; adjustments require reason + approval. Reconciliation hub compares Σ wallets to GL liability.

---

## 14. Workflow 12 — Exception & Approval Handling (patterns applied everywhere)

1. **Approval requests** appear in: the record's ApprovalPanel, the approver's Action Center, sidebar badge, notification (in-app + email). Approving from the Action Center uses the same drawer as the record page.
2. **Escalation:** unapproved beyond SLA (setting; default 48h) → reminder → escalates to next approver role.
3. **Rejection** always requires a reason; requester can edit and resubmit (new approval cycle, history retained).
4. **Concurrency:** 409 Conflict → "This record was updated by {user}" Alert with Reload; long forms save drafts.
5. **Failures in downstream effects** (e.g., commission engine error, posting failure) never roll back the business action; they raise a flag on the record + admin alert and are retryable from a queue (_Unposted events_, _Commission errors_).
6. **Idempotency:** all payment, payout, order, and sync-from-offline submissions carry idempotency keys; duplicates return the original result.

---

## 15. Cross-Module UI Touchpoints (checklist)

| Where             | Must show / link to                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| Order detail      | Customer, merchant, payments, fulfilment/movements, invoice, JE, referral chain & commissions, returns/refunds |
| Customer detail   | Orders, payments, wallet ledger, referrals (up/down), commissions, payouts                                     |
| Product detail    | Stock by location, movements, suppliers/PO history, BOM/WOs, sales, price history                              |
| Supplier detail   | POs, GRNs, invoices, payments, balances, performance                                                           |
| PO detail         | PR origin, GRNs, stock movements, invoices, payments, JEs                                                      |
| Production order  | BOM, materials movements, stage log, output movements, costs, JEs, sales demand link                           |
| Commission record | Breakdown, order, referral chain, approval, payout, JEs                                                        |
| Payout            | Source commissions/wallet lines, payee KYC, destination, payment record, JE                                    |
| Payment           | Allocations, documents, gateway details, JE, reconciliation status                                             |
| Journal entry     | Source document (any module) with **Back to source** and audit trail                                           |
| Every record      | Activity tab (audit), Timeline, Documents, `EntityLink` hover cards                                            |

---

## 16. Screen Inventory (page-level index)

| Module                     | Pages (routes)                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Auth                       | login, forgot-password, reset-password, verify-2fa, accept-invite                                                              |
| Account                    | profile, security, sessions, notifications                                                                                     |
| Dashboard                  | dashboard (role templates)                                                                                                     |
| Users/Admin                | users (list, new, [id]), roles (list, new, [id]), audit-logs (list, [id], security), settings/\*                               |
| Customers                  | list, new, [id] (9 tabs), groups                                                                                               |
| Products                   | list, new, [id] (7 tabs), categories, attributes, import                                                                       |
| Merchants                  | list, new, [id] (10 tabs), merchant/dashboard                                                                                  |
| Suppliers                  | list, new, [id] (8 tabs)                                                                                                       |
| Orders/Sales               | sales overview, orders (list, new, [id], invoice), returns                                                                     |
| POS                        | pos, session/open, sell, held, orders, returns, session/close, session/[id]/report                                             |
| Referrals                  | dashboard, records, [id], network, codes, flags, settings; portal: referrals, share                                            |
| Commissions                | dashboard, records, [id], approvals, rules (list, new, [id]), simulator, reversals; portal: commissions                        |
| Payments                   | dashboard/records, [id], refunds, failed, reconciliation, methods                                                              |
| Payouts                    | dashboard/requests, [id], batches, settings; portal: withdraw; merchant: settlements                                           |
| Procurement                | dashboard, requests, orders, receiving, invoices, returns, settings (each with new/[id])                                       |
| Inventory                  | dashboard, stock, movements, transfers, adjustments, counts, valuation, warehouses, alerts                                     |
| Production                 | dashboard, orders, boms, wip, materials, costing, settings                                                                     |
| Finance                    | overview, accounts, ledger/journals, transactions, receivables, payables, expenses, periods, reconciliation, reports, settings |
| Reports                    | hub, ~60 reports (Doc 4 §2.6), scheduled, exports                                                                              |
| Portal (customer/referrer) | account/dashboard, orders, wallet (+withdraw), referrals, commissions, addresses, profile                                      |

---

## 17. Implementation Guidance for the Existing Next.js App

**Principles:** don't break working screens; migrate module by module; keep URLs (add redirects); ≤250 lines per file; maximum reuse via `components/ui`, `components/patterns`, `features/<module>`; mock-first with real API signatures (Doc 1 §16).

### 17.1 Audit step (do first, ~1 day)

Produce a table for `apps/web`: route → file → module → completeness (Complete / Partial / Stub / Template-only) → components used → data source (hardcoded / mock service / API). Use it to fill Doc 1 §17 and classify every item as **Retain / Modify / Complete / New**. Flag: duplicated components, inline styles/Bootstrap leftovers, hardcoded data inside components, inconsistent status colors, pages exceeding 250 lines.

### 17.2 Phased build order (dependency-driven)

| Phase                                 | Scope                                                                                                                                                                                                            | Exit criteria                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **0 Foundation**                      | Tokens, primitives, AppShell/sidebar/header, DataTable, FilterBar, forms kit, StatusBadge/statusMap, Timeline, ApprovalPanel, states; `http` client, auth/permission providers, MSW mock layer, invalidation map | Storybook/gallery page shows all components; one existing screen migrated end-to-end |
| **1 Master data**                     | Auth & users/roles, Customers, Products (+categories), Merchants, Suppliers                                                                                                                                      | CRUD with mock data, permissions gating nav                                          |
| **2 Inventory & Procurement**         | Warehouses, stock levels, movements, adjustments, transfers; PR/PO/GRN/invoice                                                                                                                                   | Receiving increases stock in mock; low-stock → PR loop works                         |
| **3 Sales & POS**                     | Orders, payments (basic), fulfilment, returns; POS shell/session/sell/pay/receipt/held                                                                                                                           | Order → stock → payment flow; POS ≤4-tap sale                                        |
| **4 Referrals, Commissions, Payouts** | Codes/network, engine (mock), approvals, payout requests/approval/batches, wallet                                                                                                                                | Order completion generates commissions; payout paid updates balances                 |
| **5 Production**                      | BOM, WO, stages, WIP board, costing                                                                                                                                                                              | Shortage → PR; output → stock                                                        |
| **6 Finance**                         | Accounts, auto-posting (mock), ledger, AR/AP, expenses, periods, reconciliation                                                                                                                                  | Trial balance nets to zero across all mock flows                                     |
| **7 Reporting & Audit**               | Report hub + catalogue, exports, scheduling UI, audit log                                                                                                                                                        | Every report drills to source; audit shows all mutations                             |
| **8 Polish**                          | Responsive QA, a11y audit, performance (lazy charts, virtualized tables), empty/error states sweep, live-API switch                                                                                              | Definition of Done (Doc 1 §18) for every screen                                      |

Portals (customer/merchant) migrate alongside their module in each phase.

### 17.3 Integration to live APIs

Flip `NEXT_PUBLIC_API_MODE=live` **per feature** (feature flags) once endpoints exist; contract tests compare mock fixtures vs. OpenAPI schema; keep envelope/error formats from Doc 1 §16.2. Backend to provide: `/auth/me` (with permissions), `/nav/counts`, event-driven effects listed in §1, SSE/WebSocket optional for notifications and POS transfer confirmation (polling fallback).

### 17.4 Mobile app alignment (Flutter, Dio)

Reuse this spec as the behavioural reference: same endpoints/models, same status maps/tones, same permission keys, same workflows. The web UI is a UX reference, not a copy — POS, portal (wallet, referrals, commissions, payouts) and merchant flows are the priority for mobile.

### 17.5 QA & acceptance

Each workflow in §3–§13 becomes an **end-to-end test script** (mock mode first): e.g., _"Place order with referrer upline → pay → fulfil → complete → commission pending → approve → payout → paid; verify: stock, payments, JE balance, commission statuses, balances, audit trail."_ A release is accepted when all scripts pass, Doc 1 §18 DoD holds per screen, and trial balance/valuation reconciliations show zero difference in mock data.

---

## 18. Open Decisions Register (to close with the client)

| #   | Decision                                                                                      | Affects                                      |
| --- | --------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | Commission %, number of levels, qualification trigger, holding period, caps                   | Commissions, Referrals, Finance, Portal copy |
| 2   | Order "Completed" = on payment vs on delivery; revenue recognition timing                     | Orders, Finance, Commissions                 |
| 3   | Clawback policy for paid commissions                                                          | Commissions, Payouts                         |
| 4   | Payout method (bank API vs manual/batch), minimum, schedule, fees, KYC level                  | Payouts, Customers                           |
| 5   | User roles list and approval limits/thresholds                                                | Users/Roles, all approvals                   |
| 6   | Integrations (payment gateway, bank verification, SMS/email, barcode/printer hardware)        | Payments, POS, Notifications                 |
| 7   | Inventory valuation (weighted avg vs FIFO), negative stock policy, batch/expiry tracking need | Inventory, Finance                           |
| 8   | Production stages/routings and costing (labour/overhead method)                               | Production, Finance                          |
| 9   | Merchant model (own outlets vs franchise/partners; settlement rules)                          | Merchants, Payouts, Finance                  |
| 10  | Multi-currency/tax requirements beyond NGN/VAT                                                | Finance, Procurement                         |
| 11  | Data migration (existing customers/products/stock)                                            | All                                          |
| 12  | Brand colors/logo                                                                             | Design tokens                                |

---

_End of the BuyNaija ERP Design & Product Specification (Documents 1–5). Section 17 depends on the codebase audit described in §17.1; once the route/component inventory is provided, Doc 1 §17 can be completed as a concrete Retain/Modify/Complete/New table._

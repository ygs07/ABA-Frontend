# BuyNaija ERP — Document 2: Core ERP Modules

**Covers:** Authentication & User Management · Customers · Products · Merchants · Suppliers · Sales & Orders · Merchant POS
**Depends on:** Doc 1 (tokens, shell, components, DataTable, forms, states). Anything not restated here follows Doc 1.
**Conventions used below:** Permission keys `module.action`. Money in ₦ (minor units in API). "Standard states" = Doc 1 §12 (loading skeleton, empty, filtered-empty, error+retry, 403, 404). "Standard toast" = `{Record} {action}.` Statuses map to Doc 1 §2.5 tones. Where a module needs a screen not listed, reuse the page templates in Doc 1 §6.4.

---

## Global rules that apply to all modules in this document

1. **Reference numbers** (system-generated, immutable, mono font, copyable): Customer `CUS-000123`, Product SKU (user-defined) , Merchant `MER-0042`, Supplier `SUP-0017`, Order `ORD-10482`, Payment `PAY-…`, Refund `RFD-…`, Return `RTN-…`. Prefix/padding configurable in Settings.
2. **Soft delete only.** "Delete" is allowed only for records with no dependencies (no orders, movements, payments); otherwise the action is "Deactivate/Archive". The delete confirm dialog explains which of the two applies.
3. **Every mutation writes an audit entry** (Doc 4 §Audit). Each module section lists the audited events.
4. **Merchant scoping:** users with a merchant scope only ever see records where `merchantId ∈ scope`; the merchant selector (Doc 1 §6.2) is hidden for them.
5. **Duplicate prevention:** phone/email/SKU/code uniqueness checked async on blur, with a link to the existing record when a duplicate is found.

---

# 1. AUTHENTICATION & USER MANAGEMENT

## 1.1 Purpose

Identity, sessions, roles, and permissions for every ERP user (staff, merchant users, referrers/customers with portal access, auditors).

## 1.2 Users

Super Admin / Admin (manage users & roles); every user (login, profile, security); Auditor (view-only).

## 1.3 Permissions

`users.view, users.create, users.edit, users.delete, users.approve` (activate/suspend), `users.settings` (security policies), `roles.view/create/edit/delete`, `audit.view`. Self-service actions (profile, password, sessions) need no permission.

## 1.4 Navigation

```text
/login  /forgot-password  /reset-password?token=  /verify-2fa  /accept-invite?token=
/account/profile   /account/security   /account/sessions   /account/notifications
/admin/users       /admin/users/new    /admin/users/[id]  (tabs: Overview · Roles & Access · Sessions · Activity)
/admin/roles       /admin/roles/new    /admin/roles/[id]
/admin/settings/security
```

## 1.5 Auth screens (auth layout: centered 420px card on `bg`, logo above, no sidebar)

### Login `/login`

| Field                | Type                   | Req | Validation                            | Notes                              |
| -------------------- | ---------------------- | --- | ------------------------------------- | ---------------------------------- |
| Email or phone       | text                   | Yes | Valid email or Nigerian phone         | `autocomplete=username`; autofocus |
| Password             | password (show toggle) | Yes | ≥1 char (don't reveal rules at login) | `autocomplete=current-password`    |
| Remember this device | checkbox               | No  |                                       | Extends session to 30 days         |

Links: "Forgot password?". Submit **Sign in**. Behavior: on success → `next` param or role home (staff → `/dashboard`, merchant → `/merchant/dashboard`, customer → `/account/dashboard`). If 2FA enabled → `/verify-2fa` (6-digit OTP input, auto-submit on 6th digit, "Resend code" with 30s cooldown, "Use a recovery code"). Errors: wrong credentials → generic Alert "Email/phone or password is incorrect" (never say which); locked (5 failed attempts) → "Account locked. Try again in 15 minutes or reset your password"; suspended → "Your account is suspended. Contact your administrator"; unverified/invited → resend invite link. Rate-limit 429 → cooldown message.

### Forgot / Reset password

Forgot: single email field → always show success state "If an account exists, we've sent a reset link" (no enumeration). Reset: New password + Confirm; strength meter; rules ≥10 chars, upper, lower, number, not equal to last 5 passwords; expired/used token → error state with "Request new link". Success → toast + redirect to login; all other sessions revoked.

### Logout

User menu → **Sign out** (no confirm). If POS session is open → blocking dialog "You have an open POS session. Close it first" with link. Clears query cache and auth state; redirect `/login`.

### Accept invite `/accept-invite`

Shows name/role (read-only), set password, accept terms. Token expiry 72h.

## 1.3 Profile & security (self-service)

- **Profile:** avatar (ImageUploader), name, phone, email (change requires re-verification), language (English), timezone (default Africa/Lagos), notification preferences link.
- **Security:** change password (current + new + confirm); **Two-factor authentication** (enable via authenticator app QR + verify code; show 8 recovery codes once with Download/Copy; disable requires password); Login history (last 20: time, device, IP, location, result).
- **Sessions:** table of active sessions (device, browser, IP, last active, "This device" badge) with **Revoke** and **Sign out all other devices** (confirm).

## 1.4 User management

### Users list `/admin/users`

- **Title/description:** Users — "Manage who can access BuyNaija and what they can do." **Primary action:** Invite user (`users.create`).
- **Search:** name, email, phone. **Filters:** Role (multi), Status, Merchant (combobox), Last active (range), 2FA (on/off). **Sort:** name, created, last active. **Pagination:** 25 default.
- **Bulk actions:** Deactivate, Activate, Assign role, Resend invite, Export.
- **Columns:** User (avatar+name+email), Role(s) (badge, +N), Merchant/Scope, Status, 2FA (icon), Last active, Created, Actions.
- **Row actions:** View, Edit, Change role, Reset password (sends link), Suspend/Activate, Revoke sessions, Delete (only if never logged in/no activity).
- **Export:** CSV/Excel.

### Invite / create user (drawer 640px)

| Field             | Type                                    | Req                         | Validation / Notes                              |
| ----------------- | --------------------------------------- | --------------------------- | ----------------------------------------------- |
| Full name         | text                                    | Yes                         | 2–80 chars                                      |
| Email             | email                                   | Yes                         | Unique                                          |
| Phone             | phone                                   | No                          | Unique if provided                              |
| Role(s)           | multi-combobox                          | Yes                         | ≥1                                              |
| User type         | select: Staff / Merchant user / Auditor | Yes                         | Drives visible fields                           |
| Merchant          | combobox                                | Yes if type = Merchant user | Scope                                           |
| Warehouse access  | multi-select                            | No                          | For inventory roles                             |
| Send invite email | switch                                  | —                           | Default on; off → shows temporary password once |

Submit **Send invite** → user status `invited`, toast, appears in list.

### User detail `/admin/users/[id]`

Header: avatar, name, status badge, role chips; actions: Edit, Suspend/Activate, Reset password, More. Tabs: **Overview** (contact, type, merchant, created by, last login, 2FA), **Roles & Access** (roles, effective permissions read-only list grouped by module, warehouse/merchant scope), **Sessions** (active sessions + revoke), **Activity** (audit entries by/for this user, with link to full audit log filtered).

### Roles & permissions `/admin/roles`

- **List:** Role name, Description, Users count, Type (System/Custom), Updated. System roles cannot be deleted; can be cloned.
- **Role editor (full page):** Name (req, unique), Description, then **permission matrix**: rows = modules (grouped by sidebar group), columns = actions (View, Create, Edit, Delete, Approve, Export, Process, Cancel, Refund, Settings); cells are checkboxes; not-applicable cells disabled (rendered "—"); row toggle "All"; column toggle; dependency rule: any action requires View (auto-checks View); Approve thresholds (optional numeric "Approval limit ₦" for PO, payout, refund, commission). Sticky footer Save; dirty guard. Changing a role that has users → confirm "This affects {n} users. Continue?" and is audited with before/after diff.
- **Role assignment:** via user edit or bulk action; a user may hold multiple roles (permissions are the union).

## 1.5 Statuses

| Status                | Meaning                                         |
| --------------------- | ----------------------------------------------- |
| Invited (info)        | Invite sent, not accepted                       |
| Active (success)      | Can sign in                                     |
| Suspended (error)     | Blocked by admin; sessions revoked              |
| Locked (warning)      | Auto-locked after failed attempts; auto-expires |
| Deactivated (neutral) | Former user; retained for audit                 |

## 1.6 Workflow

Admin invites → email → user sets password (+optional 2FA) → active → admin can assign roles → suspension revokes sessions immediately → deactivation preserves history.

## 1.7 Relationships

All modules (permission gating), Audit (all events), Merchants (scope), Notifications (preferences).

## 1.8 Notifications

Email: invite, password reset, password changed, new-device login, 2FA enabled/disabled, account suspended. Admin in-app: user accepted invite, repeated failed logins. Toasts: "Invite sent to {email}", "User suspended", errors with reason.

## 1.9 States

Empty users list (only possible if filters) → filtered-empty; 403 on `/admin/*` → NoPermission; expired reset token → dedicated error card; deleted user → 404 with back link; failure of role save → Alert "Couldn't save role. No changes were applied."

**Audited events:** login success/fail, logout, password change/reset, 2FA change, user create/edit/suspend/activate/delete, role create/edit/delete, permission change, session revoke.

---

# 2. CUSTOMER MANAGEMENT

## 2.1 Purpose

Single record of every buyer (retail customers, referrers, referred customers) with their orders, payments, wallet, referral network and commissions.

## 2.2 Users

Sales Manager, Customer Support, Merchant Staff (own merchant's customers), Finance (balances), Admin. Customers themselves see a reduced version in the portal (`/account/*`).

## 2.3 Permissions

`customers.view, create, edit, delete, export, approve` (activate/suspend/credit limit), `customers.settings` (customer groups, wallet rules).

## 2.4 Navigation

`/customers` (list) · `/customers/new` · `/customers/[id]` tabs: **Overview · Orders · Payments · Wallet · Referrals · Commissions · Addresses · Documents · Activity**. Sub-page: `/customers/groups` (optional customer groups).

## 2.5 Overview (list page KPI strip)

KPIs: Total customers · New this period · Active (ordered in 90 days) · With referrals · Outstanding balance. Small line chart: customer growth (link to report).

## 2.6 Customers list

- **Primary action:** Add customer. **Search:** name, phone, email, customer no., referral code. **Filters:** Status, Merchant, Customer group, Registered date range, Has referrals (yes/no), Has outstanding balance, Source (Web, POS, Referral, Admin), Location (state).
- **Columns:** Customer (avatar, name, customer no.), Phone, Email, Merchant, Orders (count), Total spent, Wallet balance, Referrals (count), Status, Registered, Actions.
- **Bulk:** Export, Change group, Deactivate, Send message (SMS/email, `customers.approve`).
- **Row actions:** View, Edit, New order, Record payment, View referrals, Suspend/Activate, Merge duplicates (Admin), Delete (no history only).
- **Mobile card:** name + status, phone, total spent.

## 2.7 Create/Edit customer (full page, 2 sections)

| Field                 | Type                                                                               | Req                                             | Validation / dependency                                                |
| --------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| Type                  | radio Individual / Business                                                        | Yes                                             | Business reveals Company name, RC/Tax ID                               |
| First name, Last name | text                                                                               | Yes                                             | 1–50                                                                   |
| Company name          | text                                                                               | If Business                                     |                                                                        |
| Phone                 | phone                                                                              | Yes                                             | Unique; +234 normalize                                                 |
| Email                 | email                                                                              | No                                              | Unique if set                                                          |
| Gender/DOB            | select/date                                                                        | No                                              | DOB in past                                                            |
| Customer group        | combobox                                                                           | No                                              | Default "Retail"                                                       |
| Merchant              | combobox                                                                           | Yes for platform staff, auto for merchant staff |                                                                        |
| Referred by           | async combobox (customers by name/phone/code)                                      | No                                              | Cannot equal self; sets upline; **locked after first qualified order** |
| Referral code         | mono text, auto-generated                                                          | —                                               | Read-only; regenerate (Admin)                                          |
| Address(es)           | repeatable block: label, street, city, state (select), LGA, landmark, default flag | No                                              | ≥1 default if any                                                      |
| Credit limit (₦)      | currency                                                                           | No                                              | `customers.approve` only; ≥0                                           |
| Notes                 | textarea                                                                           | No                                              | 500                                                                    |
| Create portal login   | switch                                                                             | No                                              | Sends invite; requires email or phone                                  |

Submit: **Save customer** (→ detail page). Server duplicate → inline "Customer with this phone exists — View".

## 2.8 Customer detail

- **Header:** avatar, name, customer no. (copy), status badge, group chip; actions: New order, Record payment, Edit, More (Suspend, Adjust wallet, Merge, Delete).
- **Summary cards:** Total spent · Orders · Average order value · Outstanding balance · Wallet balance · Referral earnings.
- **Overview tab:** contact + address DescriptionList; referral block (referred-by link, own code, downline count); recent 5 orders; timeline of key events (registered, first order, referral qualified).
- **Orders tab:** DataTable (Order #, Date, Items, Total, Paid, Balance, Status) + filters; row → order.
- **Payments tab:** payments and refunds (Ref, Date, Method, Amount, Status, Order).
- **Wallet tab:** balance card; ledger table (Date, Type Credit/Debit, Source: refund/commission/topup/order, Amount, Balance after, Ref); actions **Top up**, **Adjust** (`customers.approve`, reason required) — modals below.
- **Referrals tab:** referral tree summary (levels per commission plan) — list of referred customers with status (Pending/Qualified/Expired), date, first-order value, commission generated; toggle List/Tree.
- **Commissions tab:** commissions earned by this customer (Ref, Source order, Level, Amount, Status, Payout ref) + totals (Pending/Approved/Paid).
- **Addresses tab:** cards with edit/delete/set default. **Documents:** ID/KYC uploads with type, status (Pending/Verified/Rejected), verify action (`customers.approve`).
- **Activity:** audit + messages sent.

## 2.9 Modals/drawers

| Name                         | Trigger                             | Fields                                                      | Behavior                                                                                               |
| ---------------------------- | ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Wallet top-up (modal)        | Wallet tab                          | Amount (≥100), Method (Cash/Transfer/Card), Reference, Note | Creates Payment (type wallet_topup) → wallet ledger credit → finance entry; toast "₦x added to wallet" |
| Wallet adjustment (modal)    | Wallet tab                          | Direction Credit/Debit, Amount, Reason (req ≥10)            | Confirm dialog; audited; cannot go below 0                                                             |
| Suspend customer (confirm)   | Row/detail                          | Reason (req)                                                | Blocks new orders; existing kept; toast                                                                |
| Merge customers (drawer)     | Row action                          | Target customer combobox; preview of what moves             | Confirm typed "MERGE"; irreversible; moves orders, wallet, referrals                                   |
| Customer quick view (drawer) | Row click w/ modifier or hover card | read-only summary                                           |                                                                                                        |

## 2.10 Statuses

Active (success), Inactive (neutral: no orders in 12 months, automatic label), Suspended (error), Blocked/Fraud (error, needs `customers.approve`), Pending verification (info; portal signups awaiting OTP).

## 2.11 Workflow

Created via Admin, POS, storefront signup, or referral link → (optional) verify phone → orders/payments accumulate → referral qualification when referred customer's first qualifying order is paid → commission engine (Doc 3) → wallet/payout.

## 2.12 Relationships

Orders, Payments, Referrals, Commissions, Payouts (wallet withdrawals), Finance (receivables), Merchants, Audit.

## 2.13 Notifications

SMS/email: welcome, wallet credited, order confirmation (from Orders), referral qualified. In-app (staff): duplicate flagged, credit limit exceeded. Toast errors show reason.

## 2.14 States

Empty list: "No customers yet — Add your first customer". Wallet tab empty: "No wallet activity". Referrals tab empty: "No referrals yet" + copy referral link button. Deleted → 404 page with link.

**Audited:** create/edit/delete, status change, wallet adjust, referred-by change, merge, credit limit change, KYC verification.

---

# 3. PRODUCT MANAGEMENT

## 3.1 Purpose

Catalogue of everything sold, bought, or produced: finished goods, raw materials, and services; prices, costs, variants, images, and stock linkage.

## 3.2 Users

Product/Inventory Manager, Procurement (costs), Sales Manager (pricing), Merchant Owner (merchant-specific price/visibility), Production Manager (raw/finished flags).

## 3.3 Permissions

`products.view, create, edit, delete, export, approve` (price changes above threshold, publish), `products.settings` (categories, attributes, units, tax classes). Cost price visible only with `products.view_cost` (add as sub-permission).

## 3.4 Navigation

`/products` (catalogue) · `/products/new` · `/products/[id]` (tabs: **Overview · Variants · Pricing · Inventory · Suppliers · BOM · History**) · `/products/categories` · `/products/attributes` · `/products/import`.

## 3.5 Overview KPIs

Total products · Active · Out of stock · Low stock · Avg margin. Chart: Top sellers (link to Reports).

## 3.6 Catalogue list

- **Primary:** Add product; secondary: Import (CSV), Export. **View toggle:** Table / Grid (thumbnails).
- **Search:** name, SKU, barcode. **Filters:** Category (tree multi-select), Type (Finished good, Raw material, Service, Bundle), Status, Stock (In/Low/Out), Merchant availability, Price range, Supplier.
- **Columns:** Image, Product (name + SKU), Category, Type, Variants (count), Cost (permissioned), Selling price (range if variants), Stock (total, chip color), Status, Updated.
- **Bulk:** Activate/Deactivate, Change category, Update price (% or fixed; preview dialog), Export, Archive.
- **Row actions:** View, Edit, Duplicate, Adjust stock (opens stock adjustment prefilled), Create purchase request, Archive.

## 3.7 Create/Edit product (full page, sections as cards)

**A. Basic information**
| Field | Type | Req | Validation |
|---|---|---|---|
| Name | text | Yes | 2–120 |
| SKU | mono text (auto-suggest) | Yes | Unique, `[A-Z0-9-]`, ≤32 |
| Type | select | Yes | Finished good / Raw material / Service / Bundle |
| Category | tree combobox | Yes | |
| Brand | text/combobox | No | |
| Description | rich text (basic) | No | ≤2000 |
| Unit of measure | select (pcs, pair, kg, m, box…) | Yes | Raw materials may also set purchase unit & conversion factor |
| Barcode | text | No | Unique |
| Status | select Draft/Active | Yes | default Draft |
**B. Images** — ImageUploader gallery, up to 8, drag-reorder, first = primary, alt text field, ≤2MB each (auto-compress).
**C. Pricing** — Cost price (currency, ≥0), Selling price (≥0; warn if < cost: "Selling below cost"), Wholesale/merchant price (optional), Tax class (select; default from Settings), Price includes tax (switch). Live **margin %** readout.
**D. Variants** — switch "This product has variants": define attributes (e.g., Size, Color) with values (chips); **variant matrix** table auto-generated: Variant name, SKU (auto `BASE-42-BLK`), Barcode, Cost, Price, Reorder level, Image, Active. Inline edit; bulk-fill row. Removing a variant with stock/history → blocked, offer Deactivate.
**E. Inventory settings** — Track inventory (switch, default on), Reorder level, Reorder quantity, Preferred supplier(s), Allow backorder (switch), Default warehouse.
**F. Production (finished goods)** — "Produced in-house" switch → BOM link/create; lead time.
**G. Commission (ABA-specific)** — Commissionable (switch), Override commission rule (combobox of rules; else default plan). Read-only summary of resulting % (from Commissions module).
**Submit:** Save as draft / **Publish product**. Draft skips required pricing/images.
Dependencies: type = Service hides inventory & variants; type = Raw material hides selling price/commission, shows supplier block.

## 3.8 Product detail

Header (image, name, SKU, status, category), actions: Edit, Duplicate, Adjust stock, Create PO request, Archive. Cards: Selling price · Cost · Margin · Stock on hand · Sold (30d).

- **Overview:** attributes, description, gallery.
- **Variants:** table with per-variant stock and price.
- **Pricing:** current + **price history** table (Date, Field, Old, New, Changed by, Reason).
- **Inventory:** stock by warehouse (Warehouse, On hand, Reserved, Available, Reorder level), recent movements (link to Inventory), valuation.
- **Suppliers:** linked suppliers with last purchase price, lead time, MOQ.
- **BOM:** (finished goods) active BOM summary → link to Production.
- **History:** audit timeline.

## 3.9 Categories & attributes

Categories: tree with drag-reorder, drawer form (Name, Parent, Slug, Image, Status); delete blocked if products exist (offer "Move products to…"). Attributes: name + values used by variants.

## 3.10 Import

Stepper: Upload CSV (template download) → Map columns → Validate (row-level errors table with downloadable error file) → Confirm import → Result summary.

## 3.11 Statuses

Draft (neutral), Active (success), Inactive (neutral), Out of stock (error, computed), Low stock (warning, computed), Archived (neutral).

## 3.12 Workflow

Create product → (raw material) link supplier & BOM usage → purchase increases stock → production consumes/creates → sales/POS decrement → price/cost changes are versioned → reports use cost at time of sale (order line stores unit cost snapshot).

## 3.13 Relationships

Inventory (stock), Procurement (cost, supplier), Production (BOM), Sales/POS (lines), Commissions (rules), Merchants (availability/price overrides), Reports.

## 3.14 Notifications & states

Low-stock alert → in-app + email to Inventory Manager; price change awaiting approval → approver in-app. Empty catalogue: "Add your first product or import from CSV". Delete blocked toast: "Product has stock history. Archive instead." **Audited:** create/edit/publish/archive, price & cost changes, category changes.

---

# 4. MERCHANT MANAGEMENT

## 4.1 Purpose

Onboard and manage merchants (shops/outlets/partners) that sell ABA products via POS or storefront, and track their sales, stock, payments, and commissions.

## 4.2 Users

Platform Admin, Sales/Partnerships Manager, Finance, **Merchant Owner**, **Merchant Staff/Cashier**.

## 4.3 Permissions

`merchants.view, create, edit, delete, approve` (onboarding approval, suspension), `merchants.export, merchants.settings` (POS config, commission overrides). Merchant users see only their own merchant.

## 4.4 Navigation

`/merchants` · `/merchants/new` · `/merchants/[id]` tabs: **Overview · Products · Orders & Sales · Inventory · Payments · Commissions · Staff · POS · Settings · Activity**. Merchant Owner's own dashboard: `/merchant/dashboard` (Doc 1 dashboard template scoped to merchant).

## 4.5 Merchant dashboard (scoped)

KPIs: Today's sales · Orders · Stock value · Low-stock items · Commission earned · Amount owed to/by ABA. Charts: Sales over time, Top products, Payment method split. Widgets: open POS sessions, pending settlements.

## 4.6 Merchant list

- **Primary:** Add merchant. **Search:** name, no., owner, phone. **Filters:** Status, Type (Own outlet/Franchise/Partner), State, Onboarded range, Performance tier.
- **Columns:** Merchant (logo, name, no.), Owner/Contact, Location, Type, Sales (period), Orders, Stock value, Outstanding balance, Status, Onboarded, Actions.
- **Row actions:** View, Edit, Approve/Reject (if pending), Suspend/Activate, Open POS settings, Delete (no history).

## 4.7 Create/Edit merchant (full page, wizard-capable)

| Section    | Fields                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business   | Name*, Type*, Legal name, RC/Tax ID, Logo, Category                                                                                                     |
| Contact    | Owner name*, Phone*, Email\*, Website                                                                                                                   |
| Location   | Address*, City*, State\*, LGA, Map pin (optional)                                                                                                       |
| Settlement | Bank (select)_, Account number_ (10 digits, name resolved via API and shown read-only for confirmation), Settlement frequency (Daily/Weekly/On request) |
| Commercial | Price list (Default/Wholesale), Discount limit % (max cashier discount), Commission override (optional), Credit limit ₦                                 |
| Spotlight  | **Featured Vendor** toggle (for Storefront), **Vendor Story/Bio** (rich text), Banner image                                                             |
| Warehouse  | Linked warehouse/location (auto-created "Shop stock" location)                                                                                          |
| Access     | Create owner login (switch), Initial staff (repeat: name, phone, role Cashier/Manager)                                                                  |

Submit: **Submit for approval** (status `pending`) or **Save & activate** for users with `merchants.approve`.

## 4.8 Merchant detail

Header: logo, name, status, type; actions: Edit, Suspend, Open POS, More. Cards: Sales (period) · Orders · Stock value · Outstanding balance · Commission earned.

- **Overview:** contact/settlement, performance score (sales growth, fulfilment time, return rate), map.
- **Spotlight:** storefront visibility settings (featured status, bio, media).
- **Products:** merchant-specific availability & price overrides table (Product, Default price, Merchant price, Enabled); bulk edit.
- **Orders & Sales:** DataTable of orders/POS sales + sales chart.
- **Inventory:** stock at merchant location with reorder/transfer request actions.
- **Payments:** collections vs. settlements ledger; **Settle balance** action (creates payout/settlement, Doc 3).
- **Commissions:** rules applied and earned.
- **Staff:** users list (invite, role, deactivate, PIN reset for POS).
- **POS:** registers/terminals (name, status), tax/receipt settings (header, footer, logo), allowed payment methods, discount limits, receipt printer type.
- **Activity:** audit.

## 4.9 Modals

Approve merchant (confirm + optional note), Reject (reason required, notifies owner), Suspend (reason; blocks POS login & new orders; open sessions must be closed — dialog lists them), Add register (name), Invite staff (name, phone, role, PIN), Verify bank account (auto on blur).

## 4.10 Statuses

Pending (info), Active (success), Suspended (error), Rejected (error), Inactive (neutral).

## 4.11 Workflow

Apply/create → review → approve → provision stock location + users + POS registers → stock transferred to merchant → sales → settlement/commission → reporting.

## 4.12 Relationships

Users (scope), Products (price), Inventory (location), Orders/POS, Payments/Payouts (settlement), Commissions, Finance (receivable/payable), Reports.

## 4.13 Notifications & states

Email/SMS: application received, approved/rejected, suspended, settlement processed, low stock at merchant. Empty list: "No merchants yet". Suspended merchant view shows warning Alert on all its pages. **Audited:** create/approve/reject/suspend, settlement info change (high-sensitivity: requires re-auth), price overrides.

---

# 5. SUPPLIER / VENDOR MANAGEMENT

## 5.1 Purpose

Maintain vendors of raw materials/goods, their terms, purchase history, invoices, payments and balances.

## 5.2 Users

Procurement Officer/Manager, Accountant/Finance, Inventory Manager, Admin.

## 5.3 Permissions

`suppliers.view, create, edit, delete, export, approve` (activate, change bank details), `suppliers.settings`.

## 5.4 Navigation

`/suppliers` · `/suppliers/new` · `/suppliers/[id]` tabs: **Overview · Products · Purchase Orders · Invoices · Payments · Performance · Documents · Activity**.

## 5.5 Overview KPIs (list page)

Active suppliers · Total payable (outstanding) · Overdue payable · Spend this period · Avg lead time.

## 5.6 Supplier list

- **Primary:** Add supplier. **Search:** name, no., contact, phone. **Filters:** Status, Category (Raw material types), Payment terms, Balance (has outstanding/overdue), State/Country, Rating.
- **Columns:** Supplier (name, no.), Contact, Category, Payment terms, Total purchases (period), Outstanding balance, Rating (stars from performance), Status, Actions.
- **Row actions:** View, Edit, Create purchase request/PO, Record payment, Deactivate, Delete (no history).

## 5.7 Create/Edit supplier

| Field                         | Type                                       | Req                  | Notes                                                                         |
| ----------------------------- | ------------------------------------------ | -------------------- | ----------------------------------------------------------------------------- |
| Company name                  | text                                       | Yes                  | Unique warning                                                                |
| Supplier type                 | select Local/International                 | Yes                  | International reveals Currency, Incoterms                                     |
| Contact person, Phone, Email  |                                            | Yes (phone or email) |                                                                               |
| Address, City, State, Country |                                            | Yes                  |                                                                               |
| Tax ID / RC                   | text                                       | No                   |                                                                               |
| Categories supplied           | multi-select                               | No                   |                                                                               |
| Payment terms                 | select (Immediate, Net 7/14/30/60, custom) | Yes                  | Default Net 30; drives invoice due date                                       |
| Currency                      | select                                     | Default NGN          |                                                                               |
| Bank details                  | Bank, Account no., Account name            | No                   | Changes need `suppliers.approve` and are audited; masked display (`••••1234`) |
| Lead time (days)              | number                                     | No                   |                                                                               |
| Credit limit ₦                | currency                                   | No                   | Warn on PO if exceeded                                                        |
| Documents                     | FileUploader (CAC, tax cert, contract)     | No                   | Expiry date per doc → reminder                                                |
| Notes                         | textarea                                   | No                   |                                                                               |

## 5.8 Detail

Header: name, status, rating; actions: New PO, Record payment, Edit, More. Cards: Outstanding · Overdue · Total purchased (12m) · On-time delivery % · Open POs.

- **Products:** items supplied with last price, price trend sparkline, MOQ, lead time; "Add product" (link product↔supplier).
- **Purchase Orders / Invoices / Payments:** DataTables linking into Procurement/Finance; **Statement** button generates account statement PDF (date range).
- **Performance:** on-time delivery %, fill rate %, price variance, quality rejections; charts over time; rating computed.
- **Documents, Activity.**

## 5.9 Modals

Link product (product combobox, supplier SKU, price, MOQ, lead time), Record payment (Doc 3 payment form prefilled), Deactivate (blocks if open POs — lists them), Change bank details (re-auth + approval note).

## 5.10 Statuses

Active (success), On hold (warning; no new POs), Inactive (neutral), Blacklisted (error, reason required).

## 5.11 Workflow & relationships

Create/onboard → link products → PR/PO → receive → invoice → pay → performance updated. Relates to Procurement, Inventory (receipts), Finance (payables), Payments, Products, Audit.

## 5.12 Notifications & states

In-app: document expiring, overdue invoices, credit limit reached. Email to supplier (optional): PO issued. Empty states standard with CTA. **Audited:** create/edit, bank detail changes, status changes, blacklist.

---

# 6. SALES & ORDER MANAGEMENT

## 6.1 Purpose

Capture, price, fulfil, collect payment for and (if needed) return/refund orders from every channel (Admin, Merchant, POS, Storefront, Customer portal).

## 6.2 Users

Sales Manager, Sales Officer, Merchant Staff, Warehouse/Fulfilment, Finance (payments, refunds), Customer Support.

## 6.3 Permissions

`orders.view, create, edit, delete` (drafts only), `orders.approve` (discount over limit, credit sale), `orders.process` (fulfil), `orders.cancel`, `orders.refund`, `orders.export`, `orders.settings` (numbering, statuses, tax, return window).

## 6.4 Navigation

`/orders` (list) · `/orders/new` · `/orders/[id]` (tabs: **Overview · Items · Payments · Fulfilment · Returns & Refunds · Timeline**) · `/orders/returns` · `/orders/[id]/invoice` (print view) · `/sales` (Sales overview).

## 6.5 Sales overview `/sales`

KPIs: **Total Sales, Total Orders, Average Order Value, Pending Orders, Completed Orders** (+ Refunded amount, Outstanding balance). Below: **sales-over-time chart** (Day/Week/Month toggle, current vs previous period), **orders by status donut**, **sales by channel** (POS/Web/Admin/Portal) bars, **top products** and **top merchants**; **recent orders table** (search, status filter, date filter, pagination, link to detail). Alerts: orders unpaid > 3 days, orders awaiting fulfilment > 24h, pending refunds.

## 6.6 Orders list

- **Primary:** New order. **Search:** order no., customer name/phone, product SKU, payment ref. **Filters:** Status, Payment status, Fulfilment status, Channel, Merchant, Customer, Date range, Amount range, Created by, Has referral (yes/no).
- **Columns:** Order # , Date, Customer, Merchant, Channel, Items (count), Total, Paid, Balance, Payment status, Status, Fulfilment, Actions.
- **Bulk:** Export, Mark as packed/fulfilled, Print invoices/packing slips, Cancel (drafts/unpaid only).
- **Row actions:** View, Edit (draft/pending only), Record payment, Fulfil, Print invoice, Duplicate, Cancel, Refund (permissioned).
- **Export:** CSV/Excel/PDF; async for >10k rows.

## 6.7 Create/Edit order (full page)

Two-column: left (line items + notes), right sticky **Summary** card (Subtotal, Discount, Tax, Delivery fee, **Total**, Paid, Balance) with primary button.
| Section | Fields |
|---|---|
| Customer | Customer combobox* (with "+ New customer" inline drawer); shows balance, wallet, credit limit, referrer chip |
| Channel/Merchant | Channel* (default Admin), Merchant* (auto for merchant users) — determines price list and stock source |
| Items | **LineItemsEditor**: Product/variant combobox* (shows stock available at merchant/warehouse; blocks > available unless backorder), Qty\* (int ≥1), Unit price (default price list; editable only with `orders.approve` or within discount limit), Discount (% or ₦), Tax (auto), Line total. Cost snapshot stored silently |
| Delivery | Method (Pickup / Delivery), Address (customer address select or new), Delivery fee, Expected date, Notes |
| Discounts | Order discount (% or ₦, reason if > limit → routes to approval), Coupon code (validate) |
| Payment | Payment option: Pay now / Pay later (credit, requires credit limit) / Partial; if Pay now → payment method fields (see §6.10) |
| Notes | Internal note, Customer note |
Buttons: **Save draft**, **Place order** (validates stock & credit), on place: stock is **reserved**, order → `pending` (or `awaiting_approval` if discount/credit exceeds limits). Errors: insufficient stock highlights the row with available qty and "Adjust to {n}"; price change since load → banner "Prices updated". Unsaved guard active.

## 6.8 Order detail

- **Header:** `ORD-10482`, StatusBadge (order), payment badge, fulfilment badge, channel chip; actions: Record payment, Fulfil, Print invoice, Edit, Cancel, Refund, More (Duplicate, Send receipt, Create return). Only valid actions for the current status appear; others hidden (permission) or disabled with tooltip (state).
- **StepIndicator:** Placed → Paid → Packed → Delivered/Completed.
- **Summary cards:** Customer (link, contact), Merchant, Payment summary, Delivery.
- **Overview tab:** totals breakdown, notes, **referral/commission panel** (referrer chain, commission amounts and statuses — links to Commissions), related records (payments, movements, journal entries, invoice).
- **Items:** table (Product, SKU, Qty, Unit price, Discount, Tax, Total, Fulfilled qty, Returned qty).
- **Payments:** payments list + Record payment; balance; refunds.
- **Fulfilment:** packing/delivery records: Pack items (partial allowed), Mark shipped (carrier, tracking, rider), Mark delivered (date, recipient, proof upload). Stock movement links.
- **Returns & Refunds:** returns with items, reason, condition, restock decision, refund status.
- **Timeline:** chronological events with actor and detail (created, approved, payment received, packed, delivered, refunded, notes/comments — add comment box).

## 6.9 Statuses

**Order status:** Draft (neutral) → Awaiting Approval (warning) → Pending (info; placed, stock reserved) → Processing (info; being packed) → Ready (info) → Out for Delivery (info) → Completed (success; delivered/collected AND fully paid) → Cancelled (error) / Refunded (error) / Partially Refunded (warning). _Completed_ is what triggers revenue recognition & referral qualification (configurable: on payment vs on delivery).
**Payment status:** Unpaid, Partially Paid, Paid, Overdue, Refunded, Partially Refunded, Failed.
**Fulfilment status:** Unfulfilled, Partially Fulfilled, Fulfilled, Returned.

## 6.10 Modals/drawers

| Name                                           | Fields                                                                                                                                                                                                                          | Behavior                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Record payment (modal)                         | Amount* (≤ balance unless overpay→wallet), Method* (Cash/Transfer/Card/Wallet/Cheque), Reference (req for Transfer/Card), Paid on, Note; Wallet shows available balance; Transfer may show virtual account & "Confirm transfer" | Creates Payment (Doc 3) → updates order → finance entry; toast "₦x payment recorded"                              |
| Fulfil (drawer)                                | Line qty per item (default remaining), Warehouse, Packed by, Notes                                                                                                                                                              | Creates stock issue movements; partial → `Partially Fulfilled`                                                    |
| Mark delivered                                 | Date/time, Received by, Proof (file)                                                                                                                                                                                            | Completes if paid; triggers commission calc                                                                       |
| Cancel order (confirm)                         | Reason\* select + note; shows consequences (release stock, void unpaid, refund paid amounts as refund request)                                                                                                                  | Audited; toast                                                                                                    |
| Refund (drawer)                                | Lines/qty or amount, Reason\*, Refund method (Original/Wallet/Cash), Restock? (per line), Approval note                                                                                                                         | ≥ approval limit → approval workflow; creates Refund + stock + finance reversal + **commission reversal preview** |
| Create return (drawer)                         | Items, qty, reason, condition (Resellable/Damaged), return date                                                                                                                                                                 | Return Approve → restock → refund                                                                                 |
| Approve discount/credit (drawer for approvers) | Shows requested vs. policy                                                                                                                                                                                                      | Approve/Reject with comment                                                                                       |

## 6.11 Workflow

```text
Customer → Order (draft) → [Approval if needed] → Placed (stock reserved)
→ Payment (full/partial) → Fulfilment (pack/ship/deliver) → Completed
→ Inventory issue posted → Revenue & receivable/cash entries in Finance
→ Referral qualification → Commission created → Reports
Exceptions: Cancel (release stock/refund) · Return → Refund → Restock → Commission reversal
```

## 6.12 Relationships

Customers, Products/Inventory (reserve/issue/restock), Payments, Referrals/Commissions, Finance (invoice, revenue, COGS), Merchants, Reports, Audit.

## 6.13 Notifications

Customer (SMS/email): order placed, payment received, shipped, delivered, refund processed. Staff in-app: approval requested, payment failed, unfulfilled >24h. Toasts per action; errors show reason (e.g., "Insufficient stock for 2 items").

## 6.14 States

Empty list CTA "Create your first order"; no results standard; detail of cancelled order shows banner "This order was cancelled on {date} by {user}: {reason}"; permission-denied actions hidden; payment failure → Alert with retry and alternative method; conflict (409) if order changed elsewhere.

**Audited:** create/edit/place/cancel, discount approval, payment recorded, fulfilment, return, refund, price overrides.

---

# 7. MERCHANT POS

Separate route group `(pos)` (Doc 1 §14.5). Optimised for speed: **common sale ≤ 4 taps** (tap items → Pay → tap exact/method → Done). Works on tablet landscape, phone, desktop.

## 7.1 Purpose

Fast in-store selling with cash/transfer/card/wallet payments, receipts, held orders, returns, and daily cash reconciliation, feeding Orders, Inventory, Payments, Finance, and Commissions in real time.

## 7.2 Users

Cashier, Merchant Manager/Owner (approvals, session reports), Platform Admin (oversight).

## 7.3 Permissions

`pos.access, pos.sell, pos.discount` (up to merchant limit), `pos.discount_override` (manager PIN), `pos.hold`, `pos.return`, `pos.refund` (manager PIN), `pos.cash_movement` (pay-in/out), `pos.session_open/close`, `pos.reports`, `pos.settings`.

## 7.4 Navigation (routes)

`/pos` (register selection → session gate) · `/pos/session/open` · `/pos/sell` (main screen) · `/pos/held` · `/pos/orders` (today's sales, reprint) · `/pos/returns` · `/pos/session/close` · `/pos/session/[id]/report`.

## 7.5 Session management

**Open session (full-screen card):** Register (select), Cashier (auto), **Opening cash balance\*** (numeric keypad; default = previous closing float), Notes. **Open register** → creates session (`open`). Cannot sell without an open session; stale session (>24h) shows warning banner and requires manager to close.
**Cash movements (modal):** Pay in / Pay out, Amount*, Reason* (select: Float top-up, Bank drop, Expense, Other + note), audited; appears in session report.
**Close session (stepper):**

1. **Count cash:** denomination counter (₦1000, 500, 200, 100, 50, 20, 10, 5) or single total field → **Counted cash**.
2. **Review:** Expected cash = opening + cash sales − cash refunds + pay-ins − pay-outs; **Difference** (over/short) highlighted (green 0, amber small, red > tolerance); non-cash totals (transfer, card, wallet) with system-confirmed vs unconfirmed transfers.
3. **Confirm:** notes (required if difference ≠ 0); manager PIN if difference exceeds tolerance. → status `closed`, session report (printable), cash handover entry to Finance.
   Held orders must be resolved (resume/void) before closing.

## 7.6 Sell screen

**Top bar:** shop, register, cashier, session chip, online/offline, held count, menu.
**Left (product area):**

- **Search/scan bar** (always focused; matches name, SKU, barcode; Enter adds; scanner input adds instantly; no-match → "Product not found").
- **Category chips** (All, Favorites, categories; horizontal scroll) and **product grid**: tile = image, name, price, stock chip (green ok / amber low / red out — out-of-stock tiles disabled unless backorder). Tap adds 1; variant products open a **variant picker** (bottom sheet with size/color chips) then add. Long-press = quantity keypad.
  **Right (cart):**
- Customer row: **Walk-in** default; tap to select/create (search by phone/name/code; inline "New customer" needs name+phone only); shows wallet balance & referrer; optional **referral code** field for first-time customers.
- Lines: name, variant, unit price, qty stepper (−/+; tap number for keypad), line total, swipe/trash to remove; tap line → line discount/edit price (within limit) & note.
- Summary: Subtotal, Discount (button → % or ₦; reason; over limit → manager PIN), Tax (auto per tax class; inclusive/exclusive per settings), **Total (36px)**.
- Buttons: **Pay** (large, primary), **Hold**, **Clear** (confirm if >0 items).

## 7.7 Payment (full-screen sheet over cart)

- Header: amount due (large). Method tiles: **Cash · Transfer · Card · Wallet · Split**.
- **Cash:** keypad + quick amounts (Exact, next ₦500/1000/5000…); shows **Change due** live; confirm.
- **Transfer:** shows merchant account details/virtual account with amount and QR (if supported); cashier taps **Confirm received** (with sender name/ref optional) — or auto-confirms via webhook (status pending → confirmed with polling every 3s; timeout 10 min → options: keep waiting, change method).
- **Card:** amount sent to terminal (integration placeholder: "Awaiting card terminal…" with cancel); success returns auth code/last 4; failure → retry/other method.
- **Wallet:** requires customer selected; shows balance; if insufficient → offer **Split** for the remainder.
- **Split/hybrid:** add multiple tenders; each row (method, amount); remaining balance updates live; complete only when remaining = 0 (or partial payment allowed if setting on and customer selected → creates credit balance).
- **Complete:** button **Complete sale** → order created (`completed`, channel POS), payments recorded, stock issued at merchant location, finance entries, referral qualification/commission triggered. Success screen: big check, order no., change due, buttons **Print receipt · Send SMS/Email · New sale** (New sale is autofocus; auto-returns after 8s if enabled).
- Failure: order NOT created; cart preserved; error Alert with retry. Idempotency key prevents double charges on retry.

## 7.8 Receipt

80mm thermal layout + on-screen preview: merchant logo/name/address/phone, receipt no., date/time, cashier, customer, items (qty × price, line total), discount, tax breakdown, total, payments (method, amount), change, footer message, QR (order verification link), "Powered by BuyNaija". Actions: Print (browser print / ESC-POS bridge), Download PDF, Share (SMS/email/WhatsApp link), **Reprint** (marked "DUPLICATE" and audited).

## 7.9 Held orders

**Hold:** optional label (customer name/table no.) → cart saved server-side (survives refresh/device), stock **not** reserved by default (setting). **Held list `/pos/held`:** cards (label, customer, items count, total, held at, held by); **Resume** (loads to cart, warns if price/stock changed), **Delete** (confirm). Auto-expire after 24h (configurable).

## 7.10 Returns & refunds

`/pos/returns`: find sale by receipt no./scan QR/phone/date → select items & quantities (max sold − already returned) → reason\* (Defective, Wrong item, Changed mind, Other) → condition (Resellable → restock / Damaged → write-off) → **Refund method** (Cash from drawer, Wallet, Original method) → manager PIN if beyond return window or amount > limit → complete: return record, stock movement (or write-off), refund payment, finance reversal, commission reversal, refund receipt. Exchange = return + new sale (guided "Exchange" button preloads credit as payment tender "Return credit").

## 7.11 Offline behavior

Indicator states: Online (green), Offline (amber "Offline — sales will sync"), Syncing. Offline permitted: cash sales, holds; product/price cache from last sync (with "last synced" timestamp). Blocked offline: card, transfer confirmation, wallet, returns of other-device sales. Queue stored in IndexedDB with idempotency keys; sync on reconnect with conflict list (e.g., insufficient stock now) shown to manager. Receipt number ranges pre-allocated per device to avoid collisions.

## 7.12 POS orders / session report

`/pos/orders`: today's sales for the session (search by receipt/customer), reprint, view, start return. Session report: sales count, gross, discounts, refunds, net, by payment method, cash reconciliation, top items, cashier, opened/closed times; printable & emailed to manager.

## 7.13 Settings (Merchant → POS tab)

Registers, receipt template, tax display, discount limit, manager PIN policy, return window (days), allow partial payment, allow backorder, hold expiry, quick-cash amounts, favorites, printer type, auto-print, SMS receipts.

## 7.14 Statuses

**Session:** Open (success), Closing (info), Closed (neutral), Force-closed (warning). **Held order:** Held, Resumed, Expired, Voided. **POS payment:** Pending, Confirmed, Failed, Refunded.

## 7.15 Relationships

Orders (creates), Inventory (issues at merchant location), Payments, Customers/Referrals/Commissions, Finance (sales, cash, differences), Merchants (config), Reports, Audit.

## 7.16 Notifications & states

Toasts short (2s) and non-blocking in POS; errors block only the affected action. Manager in-app/email: cash difference over tolerance, session open >24h, discount override used, refund over limit. States: no products (empty grid → "No products enabled for this shop"), search no results, offline banner, permission denied → PIN prompt ("Manager approval required") instead of dead-end. **Audited:** session open/close, cash movements, discounts/overrides, voids, holds deleted, returns/refunds, reprints, offline sync conflicts.

---

## Cross-module mock data requirements (for this document's modules)

Seeded consistently: 12 users across all roles; 60 customers (10 with referral chains 3 levels deep; 5 with wallet activity); 80 products (10 with variants, 15 raw materials, categories tree 2 levels); 8 merchants (one pending, one suspended); 12 suppliers (2 overdue balances); 150 orders across all statuses and channels incl. partial payment, partial fulfilment, cancelled, returned/refunded; 3 POS sessions (open, closed balanced, closed with shortage); 5 held orders. Every order references existing customer/merchant/products; stock decrements when orders complete in mock mode.

---

_Next: Document 3 — Operations & Finance (Procurement, Inventory, Production, Payments, Payouts, Commissions, Finance)._

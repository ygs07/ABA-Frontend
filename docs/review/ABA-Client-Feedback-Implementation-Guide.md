# Client Feedback Round 1: Review & Implementation Guide

**Source:** Gemini meeting notes, 5 Oct 2026, 10:00 WAT (PDF).
**Companion file:** `ABA-ERP-06-Storefront-and-Marketplace.md` (the detailed requirements for every item below).
**How to use this guide:** read sections 1 to 3, send the questions in section 3 to the client, then follow sections 5 and 6 to build.

---

## 1. What the feedback is, in one page

The client reviewed the delivered UI and asked for these changes:

1. **Restructure:** the shop becomes the landing page, the current home becomes About, hero moves to the shop, a horizontal mega menu on all pages.
2. **Rebrand:** drop the "ABA" name for a "made in Nigeria" identity ("Naijahands" was floated).
3. **Marketplace features:** merchant spotlight (free, auto-rotated), product spotlight (paid by merchants), a smaller "Meet businesses" carousel.
4. **Store pages:** share buttons, a store sub-menu with category filtering down to leaf level, Save Seller, a trust panel for vetting sellers, eBay-style collapsing category bar.
5. **Reviews:** high-quality review system modelled on an example the client shared in a group chat.
6. **Reward points ("tokens")** earned for reviews and other activities, redeemable later.
7. **Product page:** image carousel with hover thumbnails, colour palette selector, related items.
8. **Community and marketer profiles:** fill the Community page, show upline and downline as visuals with performance and earnings sources, without showing real names.
9. **Colour:** more colour on the home page outside the logo.
10. The dashboard was described as "generally acceptable", so no dashboard changes were requested.

Almost all of this is **new scope that is not in Docs 01 to 05**. Those documents cover the ERP, POS and customer portal. The public storefront, reviews, reward points, paid promotions, spotlight and marketer visuals were never specified. That is why they are now in a new **Document 6**.

---

## 2. Review of the notes (accuracy and gaps)

Gemini's notes carry their own warning that they need checking. Points to be aware of before you build:

| #   | Observation                                                                                                                                                                              | What to do                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | The summary section says things like "Multi image support added" and "User reward tokens implemented". The detail section shows these are **requests**, not finished work.               | Treat every summary line as a to-do.                                                                     |
| 2   | "Reduce the side panel size" (00:01:12) does not say which panel.                                                                                                                        | Question Q1.                                                                                             |
| 3   | "Two top slivers for a circular search feature, sell and earn options" is unclear.                                                                                                       | Question Q2; a working interpretation is in Doc 06 section 2.3.                                          |
| 4   | "Across all pages" for the mega menu could include the admin and POS screens.                                                                                                            | Question Q3. The default keeps the back-office sidebar.                                                  |
| 5   | "Merchant stage" (00:21:56) is almost certainly "merchant page".                                                                                                                         | No action; Doc 06 treats it as the store page.                                                           |
| 6   | The review "reference example shared in a group chat" is not in the notes.                                                                                                               | Question Q5. Ask the client to resend it.                                                                |
| 7   | "Product slide-out menu" (00:27:56) is ambiguous.                                                                                                                                        | Question Q9; the default is a Quick View drawer.                                                         |
| 8   | "Marketer profiles" could be private or public. Showing a downline publicly raises privacy questions.                                                                                    | Question Q12.                                                                                            |
| 9   | The name change is undecided, and the current copy says "Aba's Marketplace" and "Shop Local, Shop Aba". Moving to "made in Nigeria" widens the scope from one city to the whole country. | Question Q4.                                                                                             |
| 10  | The community explanation of hierarchy levels depends on commission rates and level counts that the client has **still not confirmed** (existing open decision D-01).                    | Question Q11. Build from configuration; do not publish figures.                                          |
| 11  | The "token" idea could be read as a cryptocurrency. Points that can be redeemed for value also create an accounting liability.                                                           | Question Q10; Doc 06 section 9 keeps it as a points programme and posts nothing to Finance in version 1. |
| 12  | "Product Spotlight for merchants who pay extra" introduces paid placement, which needs a visible "Sponsored" label and a pricing decision.                                               | Question Q6.                                                                                             |
| 13  | Notes mention "referral codes or historical sales data on store pages". Showing sales figures publicly can expose merchants' revenue.                                                    | Question Q7; Doc 06 shows order counts, not naira revenue.                                               |

The speaker labels in the notes are auto-generated. "Roundstone Information" is the client-side speaker and "David Enabs" is you. Before building, send the clarifications below in writing so the answers are on record.

---

## 3. Questions for the client (paste into one message)

Each question has a **default** so work can start without waiting.

| Q   | Question                                                                                                                                                       | Default we will build                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Q1  | Which side panel should be reduced: the shop filter sidebar, or the dashboard sidebar?                                                                         | Shop filter sidebar becomes 240px and collapsible.                                                               |
| Q2  | Please describe the "two top slivers" (circular search, Sell, Earn).                                                                                           | A slim top band: a pill-shaped search box, plus two compact blocks "Sell" and "Earn" with one line of text each. |
| Q3  | Should the mega menu replace the sidebar on admin, merchant back-office and POS screens too?                                                                   | No. Storefront, customer portal and public merchant pages only.                                                  |
| Q4  | What is the final name and logo? Is the platform now nationwide, or still Aba-focused?                                                                         | Working name "Naijahands" (one config change); nationwide copy.                                                  |
| Q5  | Please resend the review example from the group chat.                                                                                                          | Standard marketplace review pattern (stars, verified purchase, photos, helpful votes, seller reply).             |
| Q6  | What are the product promotion packages and prices? Should merchants pay online themselves from the start, or will your team set promotions up for them first? | Admin-managed promotions first; self-service payment later.                                                      |
| Q7  | On store pages, may we show completed order counts and the "referred by" marketer? Should revenue stay hidden?                                                 | Order counts shown; revenue hidden; marketer shown only if both sides agree.                                     |
| Q8  | When a marketer shares a store link, should it carry their referral code?                                                                                      | Yes, if the sharer is logged in as a marketer.                                                                   |
| Q9  | What is the "product slide-out menu"?                                                                                                                          | A Quick View drawer from the product tile.                                                                       |
| Q10 | Reward points: label, points per review, caps, hold period, expiry, and what can they be redeemed for?                                                         | Label "Reward Points"; review rule on, value blank; redemption off.                                              |
| Q11 | Commission levels, rates and payout rules (still open from before). Can the Community page show numbers yet?                                                   | No numbers; page reads from configuration.                                                                       |
| Q12 | Should marketer profiles be visible to the public or only to the marketer? How should names appear?                                                            | Private by default; public page optional; aliases only.                                                          |
| Q13 | Is a green and amber accent colour scheme acceptable? Please share any brand colours.                                                                          | Green `#008751` family plus an amber call-to-action colour, for preview and sign-off.                            |
| Q14 | "Message" on store pages: a simple contact form, or a live chat?                                                                                               | Contact form (notification and email to merchant).                                                               |

---

## 4. Feedback register (every item, mapped)

Time stamps come from the notes. "Type": **Change** modifies something already delivered; **New** is not in the existing spec.

| ID   | Feedback                                                                                        | Time               | Type   | Doc 06 section | Touches existing docs            |
| ---- | ----------------------------------------------------------------------------------------------- | ------------------ | ------ | -------------- | -------------------------------- |
| F-01 | Reduce side panel size                                                                          | 00:01:12           | Change | 2.5            | Doc 01 6.1                       |
| F-02 | Shop becomes the landing page; old home becomes About                                           | 00:08:17           | Change | 2.1, 2.4       | Existing routes                  |
| F-03 | Move hero to the shop; add the two top slivers (search, Sell, Earn)                             | 00:09:48           | Change | 2.2, 2.3       | None                             |
| F-04 | Horizontal mega menu with subcategories on all pages                                            | 00:11:26, 00:16:57 | Change | 3.2 to 3.4     | Doc 01 6.2 (storefront header)   |
| F-05 | Spotlight star vendors inside the mega menu categories                                          | 00:14:34           | New    | 3.2, 4.4       | Doc 02 3.9                       |
| F-06 | Rebrand away from the project name to "made in Nigeria"                                         | 00:16:57           | Change | 1              | Doc 04 REQ-04-036, Doc 02 7.8    |
| F-07 | Merchant Spotlight with hover buy and periodic refresh                                          | 00:18:51           | New    | 4              | Doc 02 4.8                       |
| F-08 | Product Spotlight for paid promotion                                                            | 00:18:51           | New    | 5              | Doc 03 7.5, Doc 03 4             |
| F-09 | "Meet businesses": smaller cards, 4 per view, carousel with "view all"                          | 00:20:25           | Change | 6              | None                             |
| F-10 | Granular sub-subcategories (men's fashion to shoes)                                             | 00:21:56           | Change | 3.1, 3.7       | Doc 02 3.9                       |
| F-11 | Sub-category filtering on shop and merchant pages                                               | Next steps         | New    | 3.7, 7.3       | None                             |
| F-12 | Share on merchant profiles (WhatsApp, Facebook, LinkedIn, copy link)                            | 00:23:38           | New    | 7.2            | Doc 04 1.8                       |
| F-13 | Store sub-menu and filtering for a merchant's inventory                                         | 00:24:40           | New    | 7.3            | None                             |
| F-14 | High quality reviews, based on the shared example                                               | 00:25:51           | New    | 8              | Doc 05 (events)                  |
| F-15 | Scroll collapses categories to show more products                                               | 00:27:56           | New    | 7.4            | None                             |
| F-16 | Referral code or sales history on store pages to vet sellers                                    | 00:27:56           | New    | 7.5            | Doc 02 4.8                       |
| F-17 | "Save Seller" and product slide-out menu                                                        | 00:27:56           | New    | 7.6, 7.7       | None                             |
| F-18 | Community page content (levels, advantages, token earnings)                                     | 00:31:15           | New    | 11.1           | Doc 03 6.6 (config)              |
| F-19 | Marketer profile with upline and downline visuals, performance, earnings sources, no real names | 00:31:15           | New    | 11.2, 11.3     | Doc 04 1.9, Doc 03 6.12          |
| F-20 | Product page image carousel and Amazon-style hover thumbnails                                   | 00:32:53           | Change | 10.1           | Doc 02 3.7                       |
| F-21 | Colour palette selector                                                                         | 00:32:53           | New    | 10.2           | Doc 02 3.7 (variants)            |
| F-22 | Related items section                                                                           | 00:34:33           | New    | 10.3           | None                             |
| F-23 | Reward tokens or points for reviews and other actions                                           | 00:34:33           | New    | 9              | Doc 03 7.5 (later)               |
| F-24 | More colour on the home page beyond the logo                                                    | 00:35:49           | Change | 12             | Doc 01 2 (scoped, ERP unchanged) |
| F-25 | Dashboard acceptable                                                                            | 00:35:49           | None   | n/a            | No change                        |

Also created by these items: a **Message seller** form (7.8) and **Saved sellers** page (7.6), because the current UI has the buttons but no specification.

---

## 5. Where this touches your existing build

**Doc 06 is a new document.** Register it exactly as you did the others: save it in `/docs/spec/`, extract a checklist `06.md`, run the completeness check, then build.

**Modules that must also read Doc 06.** Add one line to these module prompts (in `aba-module-build-prompts.md`): _"Also read Doc 06 section X and include checklist lines tagged for it."_

| Module prompt                        | Add this Doc 06 reading                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| Products                             | Sections 3 (taxonomy depth), 10.2 (colour swatch attribute type, variant images) |
| Merchants                            | Sections 4.2 (spotlight eligibility inputs), 7                                   |
| Customers                            | Sections 7.6 (saved sellers), 9.4 (rewards screen)                               |
| Orders & Sales                       | Section 8.2 and 8.10 (review eligibility after delivery)                         |
| Referrals                            | Section 11 (profile and network visual), 7.2 (share link attribution)            |
| Commissions                          | Section 11.2 (earnings by source breakdown)                                      |
| Payments                             | Section 5.4 (promotion payments, Phase B)                                        |
| Finance                              | Sections 5.6 and 9.5 (posting rules, only after sign-off)                        |
| Reports                              | Section 13.6                                                                     |
| Settings                             | Section 13.7                                                                     |
| Auth & Users and the permission seed | Section 13.1 (new permission keys)                                               |
| Foundation F-D (app shell)           | Section 3.2 (storefront header and mega menu are a separate shell)               |

**Items that change delivered work (do these first):** F-01, F-02, F-03, F-04, F-06, F-09, F-10, F-20, F-24. They modify screens you have already built, so they will be visible at the next review.

---

## 6. Build order

| Phase                    | Workstreams (Doc 06 section)                                                                                                                          | Why this order                                                                        | Needs first                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| **S1: next client demo** | W1 Rebrand, W2 Shop-first landing, W3 Category taxonomy and mega menu, W6 Meet businesses and directory, W12 Theme preview                            | Pure UI changes on delivered screens; fast, visible, low risk                         | Existing storefront audit (prompt A)        |
| **S2**                   | W7 Store page (share, sub-menu, collapse, Save Seller, trust panel, quick view), W10 Product page (gallery, colour, related), W11.1 Community content | Self-contained customer-facing work                                                   | S1 taxonomy                                 |
| **S3**                   | W4 Merchant Spotlight (with admin screen), W8 Reviews and ratings                                                                                     | Spotlight needs merchant performance data; reviews need delivered orders in mock data | Merchants and Orders mock stores            |
| **S4**                   | W9 Reward points, W11.2 Marketer profile and network visual                                                                                           | Points depend on reviews; the visual needs referral and commission data               | Reviews, Referrals, Commissions mock stores |
| **S5**                   | W5 Promotions (Phase A admin-managed, Phase B self-service), Finance hooks (5.6, 9.5), reports (13.6)                                                 | Depend on client decisions Q6 and Q10 and on Finance sign-off                         | Payments, Finance modules                   |

Rules for all phases:

- Build against **mock data first** through `features/<module>/api.ts`, as in the rest of the project.
- Spotlight, promotions, rewards and review rules are **configuration**, never hard-coded values (same principle as commission rates).
- Where a screen is not yet connected to a real module, label it "STUB" as before.

---

## 7. Prompts (paste one per chat, in this order)

### Prompt A: audit the existing storefront (once, no code)

Needed because the storefront already exists and Doc 06 modifies it.

```
Do not write application code. Audit the public storefront and customer-portal routes only (not the ERP back office). Save the result to /docs/storefront-audit.md.

For every route (for example /, /shop, /merchants, /merchants/[id], /products/[id], /community, /about, /account/*) list: the file, what it renders, whether it is Complete, Partial or Stub, which shared components it uses, and whether its data is hardcoded, mocked or from an API.
Also list: every place the product name "ABA" or "Aba" appears in visible text, metadata, emails or templates; the current header and navigation structure; how categories are modelled; how product images and variants are modelled; and files over 250 lines.
```

### Prompt B: register Doc 06 (three steps)

1. Copy `ABA-ERP-06-Storefront-and-Marketplace.md` into `/docs/spec/`.
2. Run the checklist-extraction prompt (Part A in `aba-checklist-extraction-prompt.md`) once per chunk, with `{{DOC_FILE}}` = `ABA-ERP-06-Storefront-and-Marketplace.md`, `{{DOC_NUM}}` = `06`, `{{CHECKLIST_FILE}}` = `06.md`, and these chunks:
   1. section 1 and 2
   2. section 3
   3. sections 4 and 5
   4. sections 6 and 7
   5. sections 8 and 9
   6. sections 10, 11 and 12
   7. section 13 (including mock data)

   For the phase column use the phases in section 6 above ("S1" to "S5") instead of 0 to 8.

3. Run the completeness check (Part B), then split packed lines as you did for 02 to 04 (retag the mock lines as "Mock §N", split lines that list several fields, and fix the phase column).

Then add rows to `/docs/PROGRESS.md`: Rebrand, Storefront landing, Mega menu, Spotlight, Promotions, Store page, Reviews, Rewards, Product page, Community and marketer profile, Storefront theme.

### Prompts C: build one workstream per chat

Replace nothing except the workstream block. Each prompt follows `/docs/BUILD_PROCEDURE.md`. Phase S1:

**W1: Rebrand**

```
TASK: Build the workstream "Rebrand" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 1
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 1
- Also read: /docs/storefront-audit.md (the list of places where the old name appears)
- Phase: S1
- Create src/config/brand.ts and replace every visible use of the old name with it (UI text, metadata, emails, SMS, receipts, PDFs, share messages, referral code prefix). Use the working name from the spec. Finish by searching the whole app for the old name and reporting any match outside brand.ts, docs and internal identifiers.
- Existing code to consider: the existing storefront, portal and back-office screens (audit first, keep what works).
```

**W2: Shop-first landing**

```
TASK: Build the workstream "Shop-first landing" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 2
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 2
- Also read: /docs/storefront-audit.md
- Phase: S1
- Make "/" the shop, move the old home to /about, add redirects, move the hero, build the utility strip using the default interpretation in section 2.3, reduce the shop filter sidebar per section 2.5, update header navigation.
- Existing code to consider: the existing storefront routes (keep working behaviour, add redirects for moved URLs).
```

**W3: Taxonomy and mega menu**

```
TASK: Build the workstream "Category taxonomy and mega menu" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 3
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 3
- Also read: /docs/spec/ABA-ERP-02-Core-Modules.md section 3.9 (categories) and Doc 01 sections 6 and 15 (shell, accessibility)
- Phase: S1
- Extend categories to three levels in the mock store and the admin Categories page, build the storefront header with the mega menu (desktop panel and mobile drill-down drawer), the shared CategoryFilter component, and the /c/[...categoryPath] listing page.
- Existing code to consider: the existing header, navigation and category data (audit first).
```

**W6: Meet businesses and directory**

```
TASK: Build the workstream "Meet businesses and merchants directory" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 6
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 6
- Phase: S1
- Existing code to consider: the existing "Meet businesses" section and /merchants page (audit first).
```

**W12: Storefront theme preview**

```
TASK: Build the workstream "Storefront theme" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 12
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 12
- Phase: S1
- Add the --store-* tokens without touching the ERP tokens, apply them to the storefront sections listed in the spec, and build the /dev/theme preview page for client sign-off. Check text contrast.
- Existing code to consider: existing storefront styles.
```

Phase S2:

**W7: Store page**

```
TASK: Build the workstream "Merchant store page" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 7
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 7
- Also read: Doc 02 sections 4.8 and 4.9, Doc 06 section 3.7 (CategoryFilter)
- Phase: S2
- Includes header actions, ShareMenu (reusable), store category menu, filters and sort, the scroll-collapse behaviour, the seller credibility panel, Save Seller with /account/saved-sellers, the Quick View drawer, and the Message seller form.
- Existing code to consider: the existing /merchants/[id] page (audit first).
```

**W10: Product page**

```
TASK: Build the workstream "Product page" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 10
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 10
- Also read: Doc 02 section 3.7 (variants and images)
- Phase: S2
- Includes the gallery, colour swatch attribute type with per-variant images, related items rails, sticky buy box.
- Existing code to consider: the existing product page (audit first).
```

**W11a: Community content and Pages editor**

```
TASK: Build the workstream "Community page and content editor" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 11.1 (and 2.4 for the About page content)
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 sections 11.1 and 2.4
- Phase: S2
- Commission levels and rates must come from configuration; show no numbers until published.
- Existing code to consider: the existing /community and /about pages.
```

Phase S3:

**W4: Merchant spotlight**

```
TASK: Build the workstream "Merchant spotlight" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 4
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 4
- Also read: Doc 02 section 4.8 (merchant performance score)
- Phase: S3
- Includes the shop section with hover and tap quick-buy, the scoring and rotation engine in the mock store, category star vendors for the mega menu, and /admin/spotlight with history.
```

**W8: Reviews and ratings**

```
TASK: Build the workstream "Reviews and ratings" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 8
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 8
- Also read: Doc 02 section 6 (orders, delivered status), Doc 04 section 5.1 (add the new review permission keys)
- Phase: S3
- Includes eligibility from delivered orders, review form, product page display, seller rating, moderation screen, notifications, audit entries. If the client has sent the review reference example, follow it; otherwise build the standard pattern in the spec.
```

Phase S4:

**W9: Reward points**

```
TASK: Build the workstream "Reward points" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 9
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 9
- Phase: S4
- Earning rules are configuration with no hard-coded values. Redemption stays off behind a flag. Post nothing to Finance in this version.
```

**W11b: Marketer profile and network visual**

```
TASK: Build the workstream "Marketer profile and network visualisation" completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, sections 11.2 to 11.4
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 sections 11.2 to 11.4
- Also read: Doc 04 section 1.9 (network explorer) so the NetworkTree component is shared with an anonymize option, and Doc 03 section 6 (commission ledger by source)
- Phase: S4
- Real names never appear; use aliases. Provide the list view fallback.
```

Phase S5:

**W5: Promotions (Phase A first)**

```
TASK: Build the workstream "Promotions", PHASE A (admin-managed), completely.
Follow /docs/BUILD_PROCEDURE.md.

SCOPE
- Spec: /docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md, section 5 (build 5.1 to 5.5 and 5.7; leave 5.4 self-service checkout and 5.6 Finance posting for later)
- Checklist: /docs/checklist/06.md, lines whose section falls in Doc 06 section 5, except self-service checkout and Finance posting
- Phase: S5
- Every promoted product shows a Sponsored label. Package prices are configuration.
```

### Prompt D: audit additions

Use the normal audit prompt (Prompt 2 in `aba-build-and-audit-prompts.md`) in a fresh chat, with these extra checks added to Part 4 (behaviour walkthrough):

```
- Rebrand: search the whole app for the old product name and report any visible match.
- Mega menu: keyboard only (open, move, close, focus return); touch; mobile drawer; 200% zoom.
- Spotlight, promotions, reviews, rewards: confirm that no business value (points, prices, weights, thresholds) is hard-coded; all come from configuration.
- Sponsored items always show the Sponsored label.
- Marketer profile: confirm no real name, phone, email or bank detail appears anywhere in the network visual or its data.
- Moved URLs return redirects and old links still work.
```

---

## 8. Client sign-off checklist (use in the next demo)

| Feedback               | Demo step                                                                      | Done when                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| F-02, F-03             | Open `/`                                                                       | The shop is the landing page; the hero and utility strip are at the top; `/about` shows the old home content; old links redirect |
| F-04, F-05, F-10, F-11 | Hover or tab through the mega menu; open Fashion, Men's, Shoes                 | Three levels, featured vendors shown, keyboard works, mobile drawer works                                                        |
| F-06                   | Browse every screen; send a test email and view a receipt                      | No old name anywhere; changing the name in one place updates everything                                                          |
| F-07                   | Hover a spotlight card; run "Refresh now" in admin                             | Quick buy works; the featured list changes and the history is logged                                                             |
| F-08                   | View the Product Spotlight; open admin promotions                              | Items are labelled Sponsored; start and end dates are respected                                                                  |
| F-09                   | View "Meet businesses"                                                         | Four cards per view, carousel, "view all" link works                                                                             |
| F-12, F-13, F-15, F-17 | Open a merchant store; share it; scroll; save the seller; quick view a product | WhatsApp, Facebook, LinkedIn, copy link work; category bar collapses on scroll; Save Seller persists                             |
| F-16                   | View the credibility panel                                                     | Orders, rating, response time shown; no revenue figures                                                                          |
| F-14                   | Submit, moderate and reply to a review                                         | Verified badge, photos, helpful votes, moderation, merchant reply                                                                |
| F-23                   | Publish a review                                                               | Points appear as pending, then available; history page shows them                                                                |
| F-20, F-21, F-22       | Open a product with colours                                                    | Hover thumbnails, colour swatches change the images, related items shown                                                         |
| F-18, F-19             | Open Community and a marketer profile                                          | Content explains levels and earnings without published figures; network visual shows aliases only; list fallback works           |
| F-24                   | Open `/dev/theme`                                                              | Palette approved by the client before rollout                                                                                    |

---

## 9. Risks and notes

- **Privacy:** the marketer network visual and the "referred by" line expose relationships between people. The defaults (aliases, aggregates, opt-in, no contact or bank details) are there to meet Nigerian data protection expectations. Please have the client confirm them in writing.
- **Paid placement:** sponsored items must be clearly labelled. Do not let paid and organic placements mix without the label.
- **Points programme:** if points become redeemable they are a liability on the books. Do not enable redemption until Finance and the client agree on value and expiry.
- **Name and domain:** before the client commits to "Naijahands" or any name, check domain availability and existing trademarks. This guide does not check either.
- **Performance:** the mega menu, spotlight, quick view and image galleries add weight to the landing page. Lazy-load below the fold and keep the first products visible quickly (the hero height cap in Doc 06 section 2.2 is there for this reason).
- **Scope growth:** reviews, rewards, promotions and the network visual are each a small product. Phase them as shown in section 6 so the S1 changes can be shown at the next review without waiting for the rest.
- **Open decisions:** add Q1 to Q14 above to `/docs/QUESTIONS.md` as D-13 to D-26 and keep the defaults until the client answers.

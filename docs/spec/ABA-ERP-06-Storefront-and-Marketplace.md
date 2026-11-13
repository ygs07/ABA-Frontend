# Document 6: Storefront & Marketplace Experience

**Source:** Client review meeting, 5 Oct 2026 (feedback round 1).
**Status:** Draft v1. Items marked **[CONFIRM Q#]** have a working default but need a client answer (see the Implementation Guide, section 3).
**Precedence:** For public storefront, customer portal and marketer-facing screens, this document overrides Docs 01 to 05 where they conflict. The ERP back office, POS and admin screens keep the shell, sidebar and tokens from Doc 01.
**Conventions:** same as Docs 01 to 05 (permission keys `module.action`, reference numbers, soft delete, audit on every mutation, standard states from Doc 01 section 12, mock-first API layer, files of 250 lines or less).
**Terminology:** "the platform" and `brand.name` are used instead of "ABA". The product name is not final (see section 1).

---

# 1. BRAND & NAMING

## 1.1 Brand configuration

1. All brand values must live in one config module `src/config/brand.ts`: `name`, `shortName`, `legalName`, `tagline`, `logo` (full, mark, light and dark variants), `favicon`, `domain`, `supportEmail`, `socialLinks`, `rewardsName`, `referralCodePrefix`, `receiptFooter`, `emailSenderName`, `metaTitleTemplate`.
2. Until the client confirms a name, `brand.name` is a clearly marked working name. "BuyNaija" was floated in the meeting and is only a candidate. Changing the name must need a change in this one file (plus logo assets).
3. No UI text, page title, metadata, email, SMS, receipt, PDF or share message may contain a hard-coded product name. Components read from `brand`.
4. Internal identifiers (package names, repository folders, CSS class prefixes) may keep the old name. Anything a user can see may not.

## 1.2 Places that must change

5. Header and footer logo and name, login and register screens, browser tab titles, Open Graph tags, favicon and web manifest.
6. Hero, About, Community and marketing copy: remove "ABA", "Aba's Marketplace", "Shop Local, Shop Aba" and similar city-specific wording. Replace with Nigeria-wide "made in Nigeria" / "BuyNaija" style copy **[CONFIRM Q4: nationwide or still Aba-focused]**.
7. Referral code prefix (Doc 04 REQ-04-036 format `ABA-XXXXXX`) becomes `brand.referralCodePrefix`. Codes issued earlier keep working.
8. POS receipt footer "Powered by BuyNaija" (Doc 02 section 7.8), invoice and statement PDFs, email and SMS templates, share message templates, notification text.
9. Admin and merchant back-office header, sidebar logo, login, and the browser tab title.

## 1.3 Acceptance

10. Searching the built app and the templates for the old name finds no visible match outside `brand.ts`, docs and internal identifiers.
11. Changing `brand.name` and `brand.logo` updates every screen, email template and receipt in mock mode.

---

# 2. INFORMATION ARCHITECTURE: SHOP-FIRST LANDING

## 2.1 Route changes

1. `/` becomes the **Shop** landing page (the marketplace home).
2. The current home page content becomes `/about`.
3. `/shop` returns a permanent redirect to `/`. Old home links keep working through redirects. Existing route names (`/merchants`, `/merchants/[id]`, `/community`, `/products/[id]`) are kept; follow the existing app where it differs **[AUDIT]**.
4. Header navigation order: Shop, Merchants, Community, About. The old "Home" item is removed. The logo links to `/`.

## 2.2 Shop landing layout (top to bottom)

5. Utility strip (the "two top slivers", see 2.3).
6. Hero carousel moved here from the old home page, content updated per section 1.
7. Mega menu (section 3) sits directly under the header on every storefront page.
8. Merchant Spotlight (section 4).
9. Product Spotlight, labelled Sponsored (section 5).
10. "Meet Businesses" carousel (section 6).
11. Product feed with category filters (see 3.7), sort and pagination.
12. Footer.
13. On desktop the first row of products must be visible within one scroll of the page top, so the hero height is capped at 360px (desktop), 280px (tablet), 200px (mobile).

## 2.3 Utility strip (two top slivers) [CONFIRM Q2]

14. Working interpretation: a slim top band with two compact blocks. Block 1 holds a rounded, pill-shaped search field. Block 2 holds two compact calls to action, **Sell** and **Earn**, each with one line of explanatory text and a link (Sell to the merchant application page, Earn to the Community page).
15. Search: placeholder "Search for anything"; category scope select; submit goes to `/search?q=`. Suggestions after 2 characters with a 250ms debounce (products, merchants, categories).
16. On mobile the two blocks stack, the search field first, and the Sell and Earn blocks become two half-width buttons.

## 2.4 About page

17. `/about` shows the old home content: "What is {brand}?" and the Shop, Sell and Earn explainer cards, rewritten for the new brand. Content is editable from the admin Pages editor (section 11.1).

## 2.5 Side panel size [CONFIRM Q1]

18. The meeting notes say the side panel needs to be reduced but not which one. Default action: reduce the shop filter sidebar from its current width to 240px on desktop and make it collapsible (drawer under 1024px). The back-office sidebar already collapses to 72px (Doc 01 section 6.1) and stays as is.

## 2.6 SEO and states

19. Permanent redirects for moved URLs, canonical tags, sitemap update, Open Graph tags from `brand`.
20. Every new section has loading skeleton, empty (section hidden, not an empty box), and error (section hidden with silent retry) states.

---

# 3. CATEGORY TAXONOMY & MEGA MENU

## 3.1 Taxonomy

1. Categories have **three levels**: Category, Subcategory, Sub-subcategory (leaf). This extends Doc 02 section 3.9 (the mock tree was two levels). Example: Fashion > Men's Fashion > Shoes. Other examples from the meeting: women's fashion, children's fashion, accessories, household items.
2. Category fields: name, slug, parent, image, icon, sort order, status, `showInMenu` (boolean), `featuredMerchantIds` (up to 4, section 4.4).
3. Products attach to any level but should attach to a leaf. Product counts roll up to parents. Moving or deleting a category follows the existing rule (blocked if products exist, offer "Move products to").
4. Admin Categories page (Doc 02 section 3.9) supports depth 3 and drag-reorder across levels.

## 3.2 Desktop mega menu (1024px and wider)

5. A horizontal bar under the global header on **every storefront and customer-portal page** shows top-level categories (maximum 8 visible, the rest under "More").
6. Opening: hover intent (150ms delay) or click, Enter, Space. Closing: mouse leave (300ms), Esc, click outside.
7. The panel shows columns of subcategories with their sub-subcategory links (like the eBay reference shown in the meeting), and a right-hand panel with **featured vendors for that category** (logo, name, rating, "Visit store") and an optional promo image.
8. Keyboard: Left/Right moves between top-level items, Down opens the panel, Tab moves through links, Esc closes and returns focus to the top-level item. Use the disclosure pattern (`aria-expanded`, `aria-controls`), not hover-only behavior.

## 3.3 Tablet and mobile (under 1024px)

9. A menu button opens a full-height drawer with drill-down navigation: category, then subcategory, then leaf. A "Featured vendors" row appears at each level. A back button and the search field sit at the top.

## 3.4 Scope of "all pages" [CONFIRM Q3]

10. Default: storefront pages, customer portal, merchant public pages and marketer pages use the mega menu header. The ERP back office, merchant back office and POS keep their own shell and sidebar.

## 3.5 Data and performance

11. `GET /catalog/menu` returns the tree plus up to 4 featured vendors per category. Cache 5 minutes. Menu panel images are lazy loaded; hovering prefetches panel content; opening a panel causes no layout shift. If the call fails, show the static top-level categories only.

## 3.6 Accessibility

12. Visible focus ring, focus never trapped, panel content reachable by keyboard, works at 200% zoom, respects reduced motion.

## 3.7 Sub-category filtering on listing pages

13. Category page `/c/[...categoryPath]` shows breadcrumbs, subcategory chips and side filters, sort, and a product grid.
14. The same `CategoryFilter` component is used on the shop landing feed, category pages, the merchants directory and each merchant store page. Selected category is URL-synced (`?category=fashion/mens/shoes`).
15. Selecting Men's Fashion lets the customer reach Shoes directly without typing a search.

---

# 4. MERCHANT SPOTLIGHT

## 4.1 Section on the shop landing

1. A "Merchant Spotlight" section (title configurable) shows 4 to 6 featured merchants as cards: banner or logo, name, location, rating, order count, three top-product thumbnails.
2. On hover, focus-within and tap (mobile), a card reveals a **quick buy** panel with the merchant's top products (image, price, Add to cart) and a "Visit store" link. Customers can buy straight from the card.

## 4.2 Selection engine

3. Modes: **Automatic** (by score), **Manual** (pinned list), **Mixed** (pinned first, rest filled by score).
4. Score is a weighted sum of: sales in the period, average rating, fulfilment rate, return rate (inverse), response time. Weights are configurable. The inputs come from the merchant performance score in Doc 02 section 4.8.
5. Eligibility (configurable thresholds): merchant Active, minimum completed orders, minimum rating, at least N in-stock active products, not suspended.

## 4.3 Periodic refresh

6. A scheduled job recomputes the featured list on an interval (daily, weekly or custom hours). Rotation options: top N by score, or weighted random among the top M for fairness. A "Refresh now" button exists for admins. Each refresh is stored in a history log.
7. In mock mode the refresh is simulated with a timestamp and a deterministic reshuffle.

## 4.4 Category star vendors

8. Each category has up to 4 featured vendors (automatic by category sales or manually pinned). They appear in the mega menu panel (section 3.2).

## 4.5 Admin screen `/admin/spotlight`

9. Controls: number of slots, mode, score weights, eligibility thresholds, refresh interval, pinned list (drag to order), exclusions, live preview, history log (who, when, what changed).
10. Permission `spotlight.settings`. Every change is audited.

## 4.6 Labelling and states

11. Organic spotlight shows a "Featured" label. It is not paid, so it is never labelled Sponsored.
12. No eligible merchants: the section is hidden. Loading: skeleton cards. Error: section hidden, silent retry.

## 4.7 Analytics events

13. Record impression, open (hover or tap), click, and add-to-cart from the spotlight, for later reports.

---

# 5. PRODUCT SPOTLIGHT (SPONSORED)

## 5.1 Section

1. A "Product Spotlight" section on the shop landing (and optionally category pages and store pages) shows 4 to 8 promoted products. Every tile carries a visible **Sponsored** label.

## 5.2 Promotion packages (admin defined)

2. Package fields: name, placement (Shop home, Category page, Store page), duration in days, price in naira, maximum slots, status. Prices are placeholders until the client confirms **[CONFIRM Q6]**.

## 5.3 Promotion record

3. Fields: merchant, product, package, start and end date, status, amount paid, payment reference, impressions, clicks, add-to-cart, attributed orders. Reference prefix `PRM-`.
4. Statuses: Pending payment (info), Pending approval (warning), Scheduled (info), Active (success), Paused (warning), Expired (neutral), Rejected (error), Cancelled (neutral).

## 5.4 Flows

5. **Phase A:** an admin creates promotions on behalf of a merchant (no checkout). **Phase B:** a merchant selects a product, clicks Promote, chooses a package and dates, pays (wallet, transfer or card through Payments, Doc 03 section 4), an admin approves (optional setting), and the promotion runs on its dates **[CONFIRM Q6: start with Phase A?]**.
6. Slot rotation is fair share (round robin, weighted by days remaining). There is no bidding in version 1.

## 5.5 Eligibility and automatic pause

7. Product active, in stock, with approved images; merchant active. A promotion pauses automatically when the product goes out of stock or the merchant is suspended, and resumes when the condition clears. The remaining days are preserved.

## 5.6 Finance

8. Promotion fees are revenue. Proposed posting: on payment Dr Cash/Bank (or merchant wallet) / Cr Deferred promotion revenue; during the run Dr Deferred promotion revenue / Cr Promotion revenue (daily or at expiry, configurable). This extends Doc 03 section 7.5 and needs Finance sign-off before it is built.

## 5.7 Reporting and control

9. Merchant view: impressions, clicks, click-through rate, add-to-cart, orders, spend. Admin view: all promotions, revenue, fill rate.
10. Permissions: `promotions.view`, `promotions.create`, `promotions.approve`, `promotions.settings`; merchant owners may create for their own products. All changes audited.

---

# 6. "MEET BUSINESSES" SECTION & MERCHANTS DIRECTORY

## 6.1 Carousel on the shop landing

1. The cards are smaller than today. Show **4 cards per view** on desktop (1280px and wider), 3 on laptop, 2 on tablet, 1 on mobile. Today only 2 are shown.
2. Carousel with arrows, dots and swipe. Autoplay is off by default. A "View all businesses" link goes to `/merchants`.
3. Card content: banner thumbnail, logo, name, rating and review count, location, joined year, order count, "Visit store".

## 6.2 Merchants directory `/merchants`

4. Search, filters (category, state, rating, verified), sort (recommended, newest, rating, most orders), pagination of 24, a Featured badge for spotlight merchants.
5. Category and sub-category filtering uses the shared `CategoryFilter`.
6. The source is active merchants. Default order is the spotlight score. A setting switches it to newest.

---

# 7. MERCHANT STORE PAGE

## 7.1 Header

1. Banner, logo, name, location, rating and review count, badges (Verified, Top seller), and actions: **Save Seller** (follow), **Message**, **Share**.

## 7.2 Share

2. The Share button opens a popover (sheet on mobile) with **WhatsApp, Facebook, LinkedIn, Copy link**. On mobile the Web Share API is used when available, with the popover as fallback.
3. Copy link shows the toast "Link copied". The default message is "Check out {store} on {brand}: {url}".
4. The share URL carries UTM parameters. If the sharer is a logged-in marketer, it also carries their referral code so the share counts toward attribution **[CONFIRM Q8]**.
5. `ShareMenu` is a reusable component, also usable on product pages.

## 7.3 Store sub-menu and filters

6. Tabs: Shop, Sale, About, Feedback.
7. A **store category menu** lists only the categories this merchant sells in, as a hierarchy to the leaf with counts, so the customer can go from Men's Fashion straight to Shoes without searching.
8. Filters: price range, rating, availability, on sale. Sort: Recommended, Newest, Price low to high, Price high to low, Best rated. In-store search.
9. URL example: `/merchants/[id]?category=fashion/mens/shoes&sort=newest`.

## 7.4 Scroll behavior (inspired by eBay)

10. When the customer scrolls down, the category bar and filter panel collapse into a compact sticky bar so more products fit on screen. Scrolling up, or pressing a "Categories" button, brings the full panel back.
11. No layout shift, focus is never lost, reduced motion respected, works at 200% zoom.

## 7.5 Seller credibility panel (vetting sellers)

12. Shows: joined date, completed orders (rounded), on-time dispatch %, return rate, rating and feedback summary, verification badges (from merchant approval, Doc 02 section 4.9), average response time.
13. A small chart of monthly **order counts** shows sales history. It shows order counts, never revenue in naira **[CONFIRM Q7]**.
14. Optional line "Referred by {marketer display name}, code {code}". It appears only if both the marketer and the merchant agree **[CONFIRM Q7]**.

## 7.6 Save Seller

15. A logged-in customer toggles Save Seller. Saved sellers appear at `/account/saved-sellers`. A guest sees a login prompt. The store shows a follower count.

## 7.7 Product quick view (slide-out) [CONFIRM Q9]

16. A "Quick view" control on each product tile opens a right-hand drawer (480px, focus trapped) with a compact image gallery, title, price, colour swatches, quantity, Add to cart and a "View full details" link.

## 7.8 Message seller

17. Version 1: a contact form (subject, message) delivered to the merchant as an in-app notification and email. A full chat is out of scope. The Message button exists in the current UI but had no specification before this document.

## 7.9 States

18. Loading skeleton, empty store ("This store has no products yet"), suspended store (banner, products hidden), error with retry.

---

# 8. REVIEWS & RATINGS

## 8.1 Scope and reference example [CONFIRM Q5]

1. Product reviews, plus an order-level seller rating that feeds the store rating. The client referred to an example shared earlier in a group chat. Its layout must be collected and compared before the UI is finalised. Until then build the standard pattern below.

## 8.2 Eligibility

2. Only customers with a delivered or completed order containing the product can review it (verified purchase badge). One review per product per order line. The author can edit for 7 days and can delete at any time. Review window: 90 days after delivery (configurable).

## 8.3 Review form

3. Star rating 1 to 5 (required), title (optional, up to 80 characters), body (required, 20 to 2000 characters), photos (up to 3, up to 5MB each, JPG or PNG). The purchased variant is shown. Submitting sets status Pending moderation, or publishes automatically if the setting allows after automatic checks.

## 8.4 Display on the product page

4. Summary: average, count, 5-star histogram (each bar filters the list).
5. Sort: Most helpful, Newest, Highest, Lowest. Filters: by stars, with photos, verified.
6. Review card: alias and avatar, verified badge, stars, date, title, body, photos (lightbox), variant bought, helpful button (one vote per user), report link, and a single merchant reply shown nested.
7. Ten per page. Empty state "Be the first to review", with the review button only for eligible customers.

## 8.5 Seller rating

8. After delivery the customer is asked three quick 1 to 5 questions: item as described, communication, delivery speed. The store rating is the weighted average. Below a minimum number of ratings (configurable) the store shows "New seller" instead of a number.

## 8.6 Moderation `/admin/reviews`

9. Tabs: Pending, Published, Rejected, Reported. Actions: approve, reject (reason required), bulk actions. Reviews are never edited by staff, only rejected. Automatic flags: profanity, links, duplicate text, same device or IP as the merchant or as someone in the same referral chain.
10. Merchants can reply once and can report a review.

## 8.7 Anti-abuse

11. Verified purchase only, rate limits, duplicate detection, a merchant cannot review their own products. Reward points for a review (section 9) stay pending until the review is published, and are reversed if it is later removed.

## 8.8 Notifications

12. Customer: review prompt 3 days after delivery with one reminder (email, SMS or in-app), approval or rejection result. Merchant: new review, reply posted.

## 8.9 Permissions and audit

13. `reviews.view`, `reviews.create`, `reviews.moderate`, `reviews.reply`, `reviews.delete`, `reviews.export`. Audit: submit, approve, reject, delete, reply, report.

## 8.10 Events

14. `order.completed` makes the order lines review-eligible. `review.published` updates product and merchant averages and triggers `points.earned`.

---

# 9. REWARD POINTS ("TOKENS")

## 9.1 Naming

1. The client said "tokens". The label is `brand.rewardsName`, default "Reward Points". Avoid "token" in customer-facing text unless the client insists, because it can be read as a cryptocurrency. This is a points programme, not a digital currency **[CONFIRM Q10]**.

## 9.2 Earning rules (admin configurable)

2. Rule fields: key, triggering event, points, daily cap, lifetime cap, needs verified purchase, active.
3. Default set: `review_published` on, with the point value to be confirmed. Other examples the client hinted at ("activities like reviews") exist as rules but are off by default: first purchase, profile completed, referral qualified. No point values are hard-coded.

## 9.3 Ledger

4. Append-only ledger entries: id, user, type (earn, redeem, adjust, expire, reverse), points, source event and reference, balance after, status (pending, available), optional expiry. Pending points become available after a hold period (configurable). A reversal entry is written when the source is removed. Points can never go negative.

## 9.4 Customer screens

5. `/account/rewards`: cards for Available, Pending and Lifetime points, a history table, a "How to earn" list generated from the rules, and a Redeem section shown as "Coming soon" while redemption is off.
6. A points chip in the header for logged-in customers. A toast and a notification "+{n} points for your review" when points become pending, and when they become available.

## 9.5 Redemption (later, behind flag `rewards.redemption`)

7. Redemption options and the points-to-naira rate are not decided **[CONFIRM Q10]**. Options: discount at checkout, or wallet credit. Finance impact if enabled: Dr Rewards expense / Cr Rewards liability on earning, Dr Rewards liability / Cr discount or wallet on redemption. Version 1 posts nothing to Finance.

## 9.6 Admin `/admin/rewards`

8. Rules, manual adjustments (reason of at least 10 characters, approval), ledger search, liability report. Permissions: `points.view`, `points.adjust`, `points.settings`. Audited.

---

# 10. PRODUCT PAGE

## 10.1 Gallery

1. Main image plus a thumbnail rail (vertical on 1024px and wider, horizontal below). Hovering a thumbnail swaps the main image on desktop; click and tap also work. Mobile uses swipe with dots.
2. Zoom on hover (desktop) and pinch (mobile), a full-screen lightbox, keyboard (Left/Right, Esc), lazy loading, fixed aspect ratio so nothing jumps. Up to 8 product images (Doc 02 REQ-02-279) plus variant images; the first image is the primary image; alt text comes from the product.

## 10.2 Colour palette selector

3. Variant attributes get a **type** (Text, Colour). Colour attributes carry a swatch (hex value or swatch image). This extends Doc 02 section 3.7 (variants). The variant matrix gains `imageIds` per variant.
4. Swatch chips show a selected ring and the colour name. Selecting a colour swaps the gallery to that colour's images (fallback to product images) and updates price, stock and SKU.
5. Unavailable colours are shown disabled with a strike line and the tooltip "Out of stock". Invalid size and colour combinations are disabled. The default is the first in-stock colour. The URL carries `?color=black` so it can be shared.

## 10.3 Related items

6. Two rails: **More from this seller** (same merchant, up to 8) and **Related items** (same leaf category from other sellers, falling back to the parent category).
7. Scoring: category match, price within plus or minus 30%, rating. Exclude the current product, out-of-stock and inactive products. Order is deterministic. Promoted products carry the Sponsored label. Four tiles visible on desktop, carousel beyond.

## 10.3a Other

8. Breadcrumb ends at the leaf category. The buy box is sticky on desktop. A Share button reuses `ShareMenu`. Reviews sit below the details.

---

# 11. COMMUNITY PAGE & MARKETER PROFILE

## 11.1 Community page `/community`

1. The page is empty today. Sections (all editable in the admin Pages editor with versions, publish and unpublish, permission `content.edit`):
   - Hero ("Join the community")
   - **How the hierarchy works**: the levels explained with an illustrative diagram
   - **Purchasing advantages** of being a member
   - **Earning**: commissions and reward points
   - FAQ
   - Call to action: Join, and Share your link
2. Commission levels and rates are still undecided with the client. The page must read level count and rates from the commission plan configuration and show numbers only when an admin has published them. Until then it explains the mechanism without figures **[CONFIRM Q11]**.

## 11.2 Marketer profile

3. Private view for the marketer at `/account/referrals/profile`. A public profile at `/community/[handle]` is optional and off by default **[CONFIRM Q12]**.
4. Header: display alias, avatar, level badge, joined date, performance band.
5. **Network visualisation**: an interactive tree (or radial) with the **upline** path above and the **downline** below, to the configured depth. Node size and colour show relative performance (share of network sales) with a legend. Clicking a node opens a side card: level, personal sales (rounded), team sales, active status, joined date. Collapse and expand, zoom and pan, a Fit button. A list view is the fallback for accessibility and for mobile.
6. **Performance metrics**: team size by level (bar), active versus inactive, sales volume by level, **percentile against peers at the same level** (for example "Top 20%"), growth trend (line).
7. **Earnings sources** (donut or stacked bar, with a period filter): direct commission, level 1, 2, 3 and so on override commission, campaign bonus, reward points. Taken from the commission ledger by source (Doc 03 section 6).

## 11.3 Privacy

8. Real names are not shown. Members appear by display alias, and a member can choose their alias. Admins can see real names in the back office.
9. The upline sees downline members only as aliases with aggregate performance. No phone, email, bank details or individual earnings are shown. A public profile (if enabled) shows aggregates only. Members can opt out of the public profile. A consent line is shown when enabling it. Follow Nigerian data protection rules (NDPR).

## 11.4 Data and reuse

10. `GET /referrals/me/network?depth=` returns anonymised nodes. The percentile is computed on the server.
11. The `NetworkTree` component is shared with the admin Network explorer (Doc 04 section 1.9) through an `anonymize` prop.
12. States: no downline yet shows an illustrative empty tree with a "Share your link" button; large networks load lazily.

---

# 12. STOREFRONT THEME & COLOUR

1. The client asked for more colour on the home page beyond the logo. Add a separate storefront token scope `--store-*` that does not change the ERP tokens in Doc 01 section 2.
2. Proposed accent palette, **subject to client approval [CONFIRM Q13]**: a Nigerian green accent family (starting at `#008751`) and one warm accent (amber) for the Sell and Earn calls to action. Contrast must be at least 4.5:1 for text.
3. Apply to: the utility strip, section headers and bands (tinted backgrounds), spotlight cards, category chips, badges, the footer, calls to action.
4. At most two accent colours beyond the brand colour. Sponsored and Featured labels stay neutral so they remain readable.
5. A preview page `/dev/theme` shows the palette in context for client sign-off before it is rolled out.

---

# 13. CROSS-CUTTING

## 13.1 New permission keys (add to Doc 04 section 5.1 and the role matrix)

`spotlight.settings`, `promotions.view|create|approve|settings`, `reviews.view|create|moderate|reply|delete|export`, `points.view|adjust|settings`, `content.edit`. Defaults: Admin and Super Admin all; Sales Manager spotlight and promotions; Merchant Owner promotions (own) and review replies (own); customers create reviews; Auditor view only.

## 13.2 New domain events (add to Doc 05 section 1)

| Event                                    | Emitted by | Effects                                                                 |
| ---------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| `review.submitted`                       | Reviews    | Moderation queue, merchant notification if auto-published               |
| `review.published`                       | Reviews    | Product and merchant averages, `points.earned` (pending), notifications |
| `review.removed`                         | Reviews    | Reverse pending or available points                                     |
| `points.earned / reversed / redeemed`    | Rewards    | Ledger, customer notification                                           |
| `promotion.activated / expired / paused` | Promotions | Storefront sections, Finance recognition (when enabled), notifications  |
| `spotlight.refreshed`                    | Spotlight  | Cache refresh, history log                                              |
| `merchant.followed`                      | Storefront | Follower count, saved sellers list                                      |

## 13.3 New audit events

Brand config change, spotlight settings change and refresh, promotion create/approve/pause/cancel, review approve/reject/delete, points adjustment, rewards rule change, page publish/unpublish, public profile enable.

## 13.4 Notifications

Review prompt, review result, merchant new review and reply, points pending and available, promotion starting, ending and paused, new message to seller.

## 13.5 Mock data requirements

- Categories: 3 levels, at least 6 top-level, 20 subcategories, 40 leaves; including Fashion > Men's Fashion > Shoes.
- 12 merchants with varied ratings and order counts; 6 eligible for spotlight, 2 pinned, 1 excluded, 1 suspended.
- 40 products with 3 or more images, 10 with colour swatches and per-colour images (one colour out of stock).
- 60 reviews across statuses (pending, published, rejected, reported), 12 with photos, 8 with merchant replies; reviews only on delivered orders.
- Reward ledger for 5 users including pending, available, reversed and adjusted entries.
- 8 promotions across all statuses; 3 packages.
- A referral network of 3 levels with aliases for the marketer profile; percentiles computed from the data.
- Page content for About and Community.

## 13.6 Reports (add to Doc 04 section 2.6)

Spotlight performance, Promotion performance (impressions, click-through rate, orders, revenue), Review volume and rating trends, Rewards liability and activity, Store follower growth.

## 13.7 Settings (add to Doc 04 section 6)

A "Storefront" group: Brand, Spotlight, Promotions packages, Reviews, Rewards, Pages.

# 14. MAPPING TO THE EXISTING APP

## 14.1 Route mapping (spec path to app path)

1. Customer portal: spec `/account/*` is the app's `/portal/*`. So saved sellers is `/portal/saved-sellers`, rewards is `/portal/rewards`, marketer profile is `/portal/referrals/profile`, network is `/portal/referrals/network`.
2. ERP back office: spec paths such as `/orders`, `/inventory`, `/finance` are the app's `/erp/orders`, `/erp/inventory`, `/erp/finance`.
3. The "Sell" call to action goes to the existing `/merchants/onboarding`. The "Earn" call to action goes to `/community`.
4. The existing `/shop` listing page becomes the product feed on `/`, with `/shop` redirecting to `/`. Its working listing and filter code is reused, not rewritten.

## 14.2 Route groups

5. `(public)/about` is moved into `(storefront)` so that About shares the storefront header and footer. The `(public)` group is removed if nothing else remains in it.
6. `/community` is linked from the header but has no page. Create it (section 11.1).

## 14.3 Data model changes

7. `Category` gains `parentId`, `level` (1 to 3), `sortOrder`, `showInMenu`, `featuredMerchantIds`, `status`. `productCount` rolls up to parents.
8. `ProductVariant` gains `attributes: { name, type ('text' or 'colour'), value, swatch? }[]` and `images: string[]`. The existing `imageUrl` is migrated to `images[0]`.

## 14.4 Public versus internal data

9. Storefront pages and storefront API functions must use separate public types (`PublicProduct`, `PublicVariant`) that never include `cost`, `reorderLevel`, `barcode` or internal stock counts. Public stock is shown only as In stock, Low stock or Out of stock. A mapping function converts internal types to public types.

## 14.5 Mock data

10. Rename branded mock data (`ABA Retail Ltd`, `Aba Leather Satchel`, `Aba Crafts`, `Aba Textiles`, referral IDs starting `ABA-`) to neutral Nigerian examples, with referral code prefix from `brand.referralCodePrefix` **[CONFIRM Q4]**.
11. `features/shop/mocks.ts` (845 lines) is split into files of 250 lines or less, by domain (products, categories, merchants, reviews).

## 14.6 Files to split when touched

12. In this scope: `(storefront)/page.tsx` (279 lines, split into section components), `(storefront)/checkout/page.tsx` (371), `(storefront)/merchants/onboarding/page.tsx` (335), `(storefront)/portal/referrals/page.tsx` (254), `components/patterns/Sidebar.tsx` (314).
13. The large ERP pages (`erp/suppliers/[id]`, `erp/merchants/[id]`, `erp/orders/new`) are split in their own module builds, not here.

## 14.7 Reuse and exclusions

14. Reuse `NetworkExplorer.tsx` as the base for the shared `NetworkTree` component (section 11.4). Reuse `ProductCard`, `AddToCartButton`, `AmountText`.
15. `portal/referrals/leaderboard` stays as is; it was not requested.
16. The cart page uses hardcoded data. This is out of scope for Doc 06 and is recorded as a separate follow-up.

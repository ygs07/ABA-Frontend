---
trigger: always_on
---

# BuyNaija ERP — Agent Build Rules

These rules apply to every session in this repository. Read them first, every time.

## 1. Source of truth

The specification lives in `/docs/spec/`:

| File                                      | Contents                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `ABA-ERP-01-Global-Design-System.md`      | Design tokens, app shell, components, tables, forms, responsive, a11y, API architecture |
| `ABA-ERP-02-Core-Modules.md`              | Auth/Users, Customers, Products, Merchants, Suppliers, Sales/Orders, POS                |
| `ABA-ERP-03-Operations-and-Finance.md`    | Procurement, Inventory, Production, Payments, Payouts, Commissions, Finance             |
| `ABA-ERP-04-Referrals-Reporting-Admin.md` | Referrals, Reports, Dashboards, Audit, Permission matrix, Settings                      |
| `ABA-ERP-05-Cross-Module-Workflows.md`    | Event map, status transitions, workflows, build phases, open decisions                  |

Requirement checklists live in `/docs/checklist/` (`REQ-<doc>-<nnn>`), and progress is tracked in `/docs/PROGRESS.md`.

- The spec is authoritative. Do not invent features, rename statuses, change permission keys, or alter workflows.
- If the spec is ambiguous or contradicts itself, stop and ask. Do not guess. Record the question in `/docs/QUESTIONS.md`.
- Items listed in Doc 5 §18 (Open Decisions) must be implemented as **configuration**, never hard-coded (commission rates, levels, triggers, payout rules, approval limits, etc.).

## 2. Before writing any code

1. Read the spec sections for the task, fully, not a summary. Quote the section numbers you are implementing.
2. Read the matching REQ items in `/docs/checklist/`. Also include mock-data lines tagged "Mock §<this module's number>" and any lines marked [SPLIT] or appended at the end for this section.
3. Search the repo for existing pages, components, hooks and types that already cover the need. Reuse or extend them. Do not duplicate.
4. State a short plan: files to create or change, and which REQ IDs they satisfy.

## 3. Never skip, never fake

- Implement **every** REQ in scope. If one cannot be completed, leave a `// TODO(REQ-xx-nnn): reason` and list it in your final report. Never omit silently.
- No placeholder screens, lorem ipsum, dead buttons, or non-functional links. Every route renders real UI.
- Every screen implements all states defined in Doc 1 §12: loading (skeleton), empty, filtered-empty, error with retry, 403 no-permission, 404.
- Every list has search, filters, sorting, pagination, column visibility, row actions and export exactly as specified for that module.
- Every form implements every field, validation rule, dependency, helper text and error message in the spec.
- Every status uses `statusMap.ts` (Doc 1 §2.5) and the transitions in Doc 5 §2. Action buttons appear only for allowed transitions and permissions.
- Do not mark a REQ done until you have run the code path and confirmed it works.

## 4. Architecture rules (Doc 1 §16)

- Stack: Next.js App Router, TypeScript (strict), Tailwind with the design tokens from Doc 1 §2–5, TanStack Query, React Hook Form + Zod.
- Structure per Doc 1 §16.1: `components/ui`, `components/patterns`, `features/<module>/{api,types,schemas,queries,mutations,mocks,components}`, `lib/`, `providers/`.
- Use route groups `(auth)`, `(erp)`, `(pos)` as specified.
- **Mock-first, API-ready:** components never import fixtures. All data flows through `features/<m>/api.ts` with real signatures, response envelopes and `ApiError` shape from Doc 1 §16.2. `NEXT_PUBLIC_API_MODE=mock|live` selects the implementation. Use MSW or in-memory repositories with realistic delays and an error-injection toggle.
- Mock data must follow the seeding requirements at the end of each document. Records must cross-reference consistently (order → customer → payment → movement → journal → commission).
- Money is stored as integer minor units; format with `AmountText`. Dates are ISO UTC, displayed in Africa/Lagos.
- Cross-module effects are implemented in the mock store as described by the event map (Doc 5 §1) and invalidated through `lib/invalidation.ts`.
- Permissions: use `usePermission` / `<Can>`. Gate navigation, routes, tabs, buttons and fields. Permission keys come from Doc 4 §5.1 exactly.
- Ledgers are append-only (stock movements, wallet, commissions, journals). Never edit balances directly.
- No tokens in `localStorage`. No secrets in the client.

## 5. UI rules (Doc 1)

- Use only shared components. If a needed component does not exist, add it to `components/ui` or `components/patterns` with the props and states defined in Doc 1 §10, then reuse it everywhere. No one-off components, no inline styles, no raw hex colors, no leftover Bootstrap classes in files you touch.
- Use `PageHeader`, `DataTable`, `FilterBar`, `KpiCard`, `ChartCard`, `Timeline`, `ApprovalPanel`, `StatusBadge`, `EntityLink`, `LineItemsEditor`, `ConfirmDialog`, etc. as defined.
- Modal vs drawer vs full page follows Doc 1 §9.1. Destructive and financial actions follow Doc 1 §9.2.
- Toasts and notification copy follow Doc 1 §9.3.
- Responsive behavior follows Doc 1 §14 (tables become card lists on mobile, drawers become sheets). Verify at 375, 768 and 1280 widths.
- Accessibility follows Doc 1 §15: labels, focus states, keyboard support, `aria-*`, no color-only status.

## 6. Code quality

- **Maximum 250 lines per file.** Split by responsibility (component, hook, schema, constants).
- No `any`. Domain types live in `features/<m>/types.ts`. Zod schemas mirror them.
- No duplicated logic. Extract shared helpers to `lib/`.
- Preserve working existing functionality. Do not delete or rewrite existing screens unless the spec's "Retain / Modify / Complete / New" mapping says so. When migrating an existing route, keep the URL or add a redirect.
- Names, routes and statuses match the spec exactly.

## 7. Verification (required at the end of every task)

Run and fix until clean:

1. `pnpm typecheck` (or the repo's equivalent)
2. `pnpm lint`
3. `pnpm build`
4. Unit or component tests for new logic, and end-to-end scripts for workflows touched (Doc 5 §3–13).
5. Manually walk each new screen in the running app: happy path, validation errors, empty state, error state, permission-denied state, mobile width.

Do not report success if any check fails.

## 8. Working style

- One module or one workflow per session. Do not try to build everything at once.
- Follow the phase order in Doc 5 §17.2. Do not start a phase whose dependencies are unfinished.
- Commit per module with a message listing the REQ IDs covered.
- When finished, update `/docs/PROGRESS.md` and the checklist boxes.

## 9. Final report format (every task)

```
Task: <module / workflow>
Spec sections: <doc §>
REQs completed: <count> (IDs)
REQs partial: <IDs + what is missing>
REQs not done: <IDs + reason>   ← must be empty or justified
Files created/changed: <list>
Checks: typecheck ✓/✗ · lint ✓/✗ · build ✓/✗ · tests ✓/✗
Questions/assumptions: <list>
```

## 10. Stop-and-ask triggers

Stop and ask before proceeding if:

- The spec is ambiguous, contradictory, or missing something needed.
- A change would break existing working behavior or a URL.
- You want to add a dependency not implied by the spec.
- A requirement conflicts with the existing codebase structure.
- You are tempted to simplify, merge, or skip a requirement to save time.

## 11. Route mapping

1. Customer portal: spec `/account/*` is the app's `/portal/*`. So saved sellers is `/portal/saved-sellers`, rewards is `/portal/rewards`, marketer profile is `/portal/referrals/profile`, network is `/portal/referrals/network`.
2. ERP back office: spec paths such as `/orders`, `/inventory`, `/finance` are the app's `/erp/orders`, `/erp/inventory`, `/erp/finance`.
3. The "Sell" call to action goes to the existing `/merchants/onboarding`. The "Earn" call to action goes to `/community`.
4. The existing `/shop` listing page becomes the product feed on `/`, with `/shop` redirecting to `/`. Its working listing and filter code is reused, not rewritten.

# BuyNaija — Standard Build Procedure

Every build task tells you to follow this file. Read it fully before you start. It works together with the workspace rules (`aba-build-rules.md`), which always apply.

## Determining your scope

- The task names spec sections (for example "Doc 02 §2"). Your requirements are **every line in the matching checklist whose section column falls inside those sections** (for example every `REQ-02-…` line whose section starts with `§2`). If the task also names extra REQ ranges from another checklist, include them.
- Skip lines marked `[DUPLICATE of …]`. Skip lines about migrating an existing app (this is a new project). Do not skip anything else.
- Also read and obey: Doc 01 (design system and components), the Doc 05 sections named in the task (workflows and status transitions), and Doc 04 §5 (permission keys).

## Step 1 — Understand (no code yet)

1. Read the spec sections completely and list the REQ items in scope (count them).
2. Search the repo for shared components, hooks and types you can reuse.
3. Output a build plan: every route, page, tab, form, modal/drawer, table and chart; the shared components you will use and any new shared component needed (with the Doc 01 spec it follows); the data types and API functions; the mock-store effects and invalidation-map entries; and the REQ IDs mapped to files. Do not skip this output.

## Step 2 — Types, schemas, API layer, mocks

1. `features/<module>/types.ts` (types and enums exactly as named in the spec), `schemas.ts` (Zod per form, using the spec's validation rules and messages), `api.ts` (real endpoint signatures, filters, pagination, action endpoints), `queries.ts` and `mutations.ts` (key factory, hooks, invalidation), `mocks/` (fixtures and handlers).
2. Mock data must meet the seeding requirements in the spec, be deterministic, cross-reference other modules' mock records, cover every status and edge case, and include at least 40 rows per list. Mutations update the mock store and trigger the cross-module effects from Doc 05 §1.
3. Wire mutations to the invalidation map in `lib/invalidation.ts`.

## Step 3 — Pages (in this order)

1. List pages: search, every filter, sorting, URL-synced pagination, column visibility, bulk actions, row actions, export, mobile card view.
2. Create/edit forms: every field, validation, dependency, helper text, draft behavior, unsaved-changes guard, server-error mapping, submit behavior, post-submit navigation.
3. Detail pages: header, actions per status and permission, summary cards, every tab, related records, Timeline, Activity tab.
4. Modals, drawers and confirmation dialogs: every one in the spec, with the specified confirmation type.
5. Dashboards/overview: every KPI card and chart, with click-through and filters.
6. Settings or sub-pages that belong to the module.

## Step 4 — States, permissions, responsiveness

1. Every screen: loading skeleton, empty, filtered-empty, error with retry and requestId, 403 no-permission, 404/deleted.
2. Permissions: gate the nav item, route, tabs, buttons and fields using the exact keys in Doc 04 §5.1. Hidden if the user has no permission; disabled with a tooltip if the state or segregation of duties prevents the action.
3. Status badges only through `statusMap`. Status changes only through the transitions in Doc 05 §2.
4. Responsive at 375, 768 and 1280. Tables become cards on mobile, drawers become sheets, forms are single-column.
5. Accessibility per Doc 01 §15.

## Step 5 — Cross-module behavior

Implement and test the events, effects and links this module owns or consumes (Doc 05 §1 and the workflow sections named in the task): stock movements, journal entries, commissions, notifications, audit entries. Every mutation writes an audit entry in the mock audit store. Do not edit other modules except to (a) add mock-store effects and invalidation entries this module's events need, and (b) add read-only links to other modules' routes. If a linked module is not built yet, create a minimal stub route, label it "STUB — Phase N" in the UI, and list it in `/docs/PROGRESS.md`.

## Step 6 — Verify

1. Run typecheck, lint and build. Fix every error.
2. Write and run unit tests for schemas and business rules, and end-to-end tests for the main workflow(s) touching this module, in mock mode.
3. Walk every new screen in the running app: happy path, each validation error, empty, error (use the error-injection toggle), permission-denied (switch role), and mobile width.

## Step 7 — Track and report

1. Tick each completed item in the checklist. For partial or unbuilt items, leave the box unticked and append ` — PARTIAL: <what is missing>` or ` — NOT DONE: <reason>`. A build session ticks the checklist box and updates ONLY the "Built (unaudited)" column in `/docs/PROGRESS.md`. An audit session ticks "Verified" and sets "Last audit" only when its verdict is PASS.
2. Update the module's row in `/docs/PROGRESS.md` according to these rules.
3. Add any questions to `/docs/QUESTIONS.md`.
4. Commit: `feat(<module>): <summary> [REQ <first>-<last>]`.
5. Give the final report in the format from the rules file (section 9).

## Hard constraints

- No skipped requirement without an explicit NOT DONE entry and reason.
- No placeholder UI, dead buttons, or fake data inside components.
- Maximum 250 lines per file. No duplicated components. No raw hex colors.
- Configurable business rules stay configurable (Doc 05 §18).
- If anything is ambiguous, stop and ask.

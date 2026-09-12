# Carmart Rebuild — Work Plan

> **What this is.** The task-level execution plan for the rebuild described in [Carmart-Rebuild-Plan.md](Carmart-Rebuild-Plan.md). That document decides *what* to build and *why*; this one decides *who does what, in what order, and how we know it is done*.
>
> **Delivery model: greenfield rebuild in a new project.** The replacement is built as a **new application in a new repository**. The existing Carmart application is **not modified** — it stays live, change-frozen, and serves as a reference and as a data source only. There is no strangler-fig, no feature-flagged coexistence inside one codebase, and no in-place refactor.
>
> **Companion documents.**
> * [Carmart-Full-System-Analysis.md](Carmart-Full-System-Analysis.md) — the audit of the current codebase. Every `R-` item and `I-` item referenced below is defined there. In this plan an `R-` item is a **defect not to reproduce**, not a defect to patch.
> * [Carmart-Rebuild-Plan.md](Carmart-Rebuild-Plan.md) — target architecture, module designs, migration strategy, decision register. Note: §16.1 of that document still describes the earlier strangler-fig approach; **this work plan supersedes it** (see §2.1).
>
> **Audience.** Project manager, tech lead, developers, QA. Task IDs are stable and are meant to be copied straight into the issue tracker.

---

## 1. How to use this document

| You are | Read |
|---|---|
| Project manager | §2 assumptions, §6 milestones, §7 timeline, §9 business-input checklist, §10 risks, §11 cutover |
| Tech lead | Everything, especially §5 work breakdown and §4 definitions of ready/done |
| Developer | §4, then your phase in §5 |
| QA | §4, §8 QA plan, and the acceptance column of every task |

**Task ID format:** `P<phase>-<stream><nn>` — for example `P2-BE04` is Phase 2, backend, task 4. Streams: `BE` backend, `FE` frontend, `DB` database/migration, `QA` quality, `OPS` infrastructure, `DOC` documentation, `BIZ` business input required.

Every task row carries: deliverable, dependencies, role, estimate in developer-days, and an acceptance criterion that QA can verify without reading the code.

---

## 2. Planning assumptions

### 2.1 The delivery model, and what it changes

**New project, not an in-place rebuild.** Decision taken by the project owner. Consequences, stated plainly because every later section depends on them:

| Consequence | Detail |
|---|---|
| Two codebases, one of them frozen | `carmart-legacy` (the current repository) receives **no feature work and no refactor**. `carmart` (the new repository) is where all work in §5 happens |
| No cross-repository feature flags | Feature flags inside the new app gate *unfinished new features*, never a legacy fallback. Rollback at cutover is "send traffic back to legacy", not "flip a flag" |
| Phase gates are **acceptance** gates, not cutover gates | A phase closing means the module is built, imported from a legacy snapshot and reconciled — not that users are on it |
| Cutover happens in **two waves, late** — see §11 | Wave 1: HRM (self-contained). Wave 2: the core system (catalog, inventory, CRM, procurement, sales, accounting, POS, e-commerce, service, reporting) as **one event**, because those modules share stock, parties and orders and cannot be split across two live systems |
| The legacy defects are **not fixed forward** | `R-1` (wrong variant stock) and `R-2` (zero cost on every order line) keep writing bad data in legacy until wave 2. They are designed out of the new system, and their accumulated damage is handled at migration — see `RK-13`, `RK-2` and `P0-BIZ01` |
| Migration is a **first-class product**, not a per-phase afterthought | A reusable ETL toolkit (`P1-BE12`) with `legacy_id` maps, idempotent importers and a reconciliation framework. Every phase ships its importer against a production-sized legacy snapshot |
| No business value ships before wave 1 | Roughly the first six months produce no user-visible change. This is the main cost of the model and needs explicit sponsor acceptance — see `RK-16` |

### 2.2 Assumptions

These are assumptions, not facts from the codebase. Change them and the timeline changes proportionally.

| Assumption | Value | Effect if wrong |
|---|---|---|
| Team size | 1 tech lead, 3 backend, 2 frontend, 1 QA, 0.5 DevOps, 0.5 BA/PM | Timeline scales roughly linearly with delivery engineers |
| Productive capacity | 4 developer-days per person per week (meetings, review, support absorb the rest) | A higher figure shortens the plan but historically does not hold |
| Weekly team capacity | ~24 developer-days | — |
| Sprint length | 2 weeks | — |
| Estimation basis | Developer-days including unit tests and code review, **excluding** QA cycle time and rework | Rework typically adds 10–15 % |
| Environments | local, CI, staging (restored from a production-sized anonymised legacy snapshot), production (new) | Without a production-sized snapshot, migration rehearsals are unreliable |
| Legacy system | Stays live and keeps taking transactions until its cutover wave; under a **change freeze** (security and revenue-blocking fixes only, approved case by case) | Every legacy change widens the behaviour delta the new system must match |
| Legacy support effort | Legacy bug triage and operator support are **outside** the estimates below and stay with whoever owns them today | If the rebuild team absorbs legacy support, subtract that capacity from the weekly capacity above |
| Legacy data access | A read-only replica or nightly snapshot of the legacy production database is available to the rebuild team from Phase 0 | Without it, no importer can be written or rehearsed |
| Business availability | The inputs in §9 arrive before the cutover wave that needs them | A missing input blocks a cutover wave, not development |

**Total estimated effort: ~875 developer-days** (the sum of every task row in §5; see §12). At ~24 developer-days per week with the parallelisation in §7, that is approximately **40 calendar weeks (~9.5 months)** from Phase 0 start to legacy decommission.

---

## 3. Team, roles and ownership

| Role | Owns | Key responsibility in this plan |
|---|---|---|
| Tech lead | Architecture, module boundaries, code review | Enforces the §2.3 dependency rules of the rebuild plan; approves every importer and every reconciliation report |
| Backend dev × 3 | Modules, actions, events, posting rules, importers | One developer per active module wherever possible |
| Frontend dev × 2 | Inertia pages, shared component library, permission-driven UI | One owns the back office, one owns POS + storefront |
| QA × 1 | Acceptance specs, behaviour-parity suite, permission matrix, migration reconciliation | Sign-off gate on every phase and both cutover waves |
| DevOps (0.5) | New repository, CI, environments, queues, backups, deploy pipeline, traffic switch | Phase 0 and Phase 12 heavy, light in between |
| BA / PM (0.5) | Business inputs (§9), sign-offs, stakeholder comms, legacy change-freeze enforcement | Owns the §9 checklist, the freeze register and the finance/HR sign-offs |
| Legacy owner | The frozen legacy application | Approves or rejects every proposed legacy change; keeps legacy running until decommission |
| Finance stakeholder | Chart of accounts mapping, opening balances, profit-basis sign-off | Blocks wave 2 if unavailable |
| HR stakeholder | Departments, designations, leave entitlement, holiday calendar | Blocks wave 1 if unavailable |

---

## 4. Working agreements

### 4.1 Definition of Ready (a task may be started)

1. Acceptance criterion is written and understood by QA.
2. Dependencies listed in the task row are complete or explicitly waived by the tech lead.
3. Any business input the task needs (§9) has arrived.
4. The module boundary is clear — the task does not require importing another module's Eloquent model.
5. Where the task replaces legacy behaviour, that behaviour is **recorded** in the baseline from `P0-QA01`, not inferred from memory.

### 4.2 Definition of Done (a task may be closed)

1. Code merged to `main` in the new repository, reviewed by someone other than the author.
2. Unit tests for domain logic; feature test for every action; **query-count assertion** where a list or detail endpoint is touched (prevents the N+1 class of defect recorded as `I-32`).
3. Pint clean, PHPStan/Larastan level 6+ clean.
4. Acceptance criterion demonstrated to QA on staging.
5. Every preserved behaviour from §1.15.1 of the rebuild plan that the task touches is green in the behaviour-parity suite (`P0-QA01`).
6. No `R-` item listed against the task is reproduced in the new code.
7. Documentation updated where the task changes a contract, an event or a permission.

### 4.3 Definition of Done (a **phase** may be closed — the acceptance gate)

1. Every task in the phase is Done.
2. Every `R-` item assigned to the phase is designed out and proven by a test.
3. The phase's importer runs clean **twice in a row** on a production-sized legacy snapshot (proving idempotency) **and** on a freshly restored snapshot (proving it needs no manual preparation).
4. Reconciliation report for the phase shows zero unexplained variance against the legacy snapshot.
5. Permission matrix test passes for every role the phase touches.
6. Consistency jobs for the phase report zero drift.
7. Behaviour-parity suite is green.
8. Tech lead and QA both sign off.

Rollback is **not** a phase-gate item in this model — nothing is live until a cutover wave. Rollback is rehearsed per wave in §11.

### 4.4 Branching, flags and the legacy freeze

* New repository, one long-lived `main`, short-lived branches per task, integration branch per phase, trunk always deployable to staging.
* Feature flags gate **incomplete new features** so `main` stays deployable. No flag routes to legacy.
* Legacy freeze: any proposed legacy change needs written approval from the legacy owner and the PM, is logged in the freeze register, and creates a matching task in the new repository in the same week. An undocumented legacy change is a silent behaviour delta that will surface as a reconciliation variance months later.

---

## 5. Work breakdown

### Phase 0 — Project Setup & Legacy Baseline
**Goal:** stand up the new project and CI, obtain a production-sized legacy snapshot, and record — in writing and in tests — exactly what the legacy system does and how dirty its data is.
**Why first:** every importer, every reconciliation and every parity test in the next twelve phases is written against the artefacts produced here. No legacy code is touched.
**Effort: ~27 dev-days. Duration: ~2 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P0-OPS01 | New repository and project skeleton | Fresh Laravel 12 / PHP 8.3 install in a new repository: strict types, Pint, Larastan, Pest, `.env.example`, secrets in a vault (never committed), no legacy artefact copied in, seeded admin credential generated per environment | — | DevOps + Lead | 2 | A clone plus `composer install && npm ci && php artisan migrate --seed` boots the empty app; no secret and no archive is tracked |
| P0-OPS02 | CI pipeline | GitHub Actions (or equivalent) running Pint, PHPStan level 6, Pest, `migrate --pretend` and `npm run build` on every pull request | P0-OPS01 | DevOps | 3 | A pull request with a style or type error fails the pipeline |
| P0-OPS03 | Local development environment | Sail/Docker definition with MySQL 8, Redis, MinIO; a demo seeder producing a usable dataset | P0-OPS01 | DevOps | 2 | A new developer is productive on day one from the README alone |
| P0-OPS04 | Staging + legacy snapshot pipeline | Staging environment for the new app, plus a repeatable job that produces a **production-sized anonymised copy of the legacy database** and restores it as the importer source | P0-OPS02 | DevOps | 4 | The snapshot can be produced and restored from scratch in under one hour, on demand |
| P0-QA01 | Legacy behaviour baseline | The 20 preserved behaviours of §1.15.1 captured from the **running legacy system** as scripted walkthroughs with screenshots and recorded inputs/outputs, then written as acceptance specs (initially failing) in the new repository | P0-OPS01 | QA + BE | 6 | All 20 are documented with legacy evidence and exist as executable specs; they are the parity gate for every later phase |
| P0-DB01 | Legacy data-quality baseline report | A read-only script against the legacy snapshot reporting: variant stock variance, count of order lines with `cost_price = 0`, duplicate parties, duplicate attribute/service-type names, orphan foreign keys, free-text values that must map to enums | P0-OPS04 | BE | 4 | Report runs against the snapshot and produces a signed baseline document |
| P0-DB02 | Legacy → target mapping workbook | Per-entity field-level mapping (source table and column, target table and column, transform rule, known gaps) covering every entity in §17.2 of the rebuild plan | P0-DB01 | BE + Lead | 5 | Every legacy table is either mapped or explicitly marked "not migrated", with a reason; the tech lead signs it |
| P0-BIZ01 | Legacy change-freeze and defect acceptance | Written freeze policy and register; explicit business acceptance that `R-1`, `R-2`, `R-6` and `R-9` remain live in legacy until wave 2, or a separately authorised micro-patch mandate for them | — | BA + PM + Legacy owner | 1 | Freeze policy signed; the four defects are either accepted in writing or carry a separate authorisation |

> **Note on `R-1`, `R-2`, `R-6`, `R-9`.** In the earlier strangler-fig plan these were patched in Phase 0 to stop data corruption immediately. In a new-project rebuild they are out of scope by definition. The cost is that every day until wave 2 adds more wrong variant stock and more zero-cost order lines. If the business wants that bleeding stopped, it must authorise four small patches against the frozen legacy application as an exception (`P0-BIZ01`), estimated at ~10 dev-days and **not included** in the ~875 total.

---

### Phase 1 — Foundation / Shared Kernel
**Goal:** the module skeleton, every cross-cutting concern and the migration toolkit, so no later phase invents its own.
**Effort: ~80 dev-days. Duration: ~3–4 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P1-BE01 | Module skeleton | `app/Modules/<Name>` layout with `Domain`, `Application`, `Infrastructure`, `Http`, `Database`, `Tests`; a generator command; per-module `ServiceProvider` | Phase 0 gate | Lead + BE | 5 | `php artisan make:module Foo` produces a registered, testable, empty module |
| P1-BE02 | Dependency lint | A static rule failing CI when a module imports another module's Eloquent model | P1-BE01 | Lead | 2 | A deliberate cross-module import fails CI |
| P1-DB01 | Party model | `parties`, `party_roles`; `users` holds login only. No legacy back-compatibility views are needed — the legacy schema is never written to | P1-BE01 | BE | 5 | A customer, a supplier and an employee each resolve to one party with the right roles |
| P1-DB02 | Addresses | Polymorphic `addresses` replacing the legacy `user_addresses`; single-default rule preserved | P1-DB01 | BE | 3 | Setting a default address clears the previous default; the legacy `[EXISTS]` behaviour is preserved |
| P1-BE03 | Money value object | Integer minor units or `DECIMAL(18,4)`, single configured currency (decision 4), casts, formatting helper | P1-BE01 | BE | 3 | Arithmetic over 10 000 random line totals produces no rounding drift |
| P1-BE04 | Document numbering | `document_sequences` with a locked sequence per series; `ORD-`, `POS-`, `SRV-`, `PO-` prefixes preserved; designs out `R-7` | P1-BE01 | BE | 4 | 50 concurrent number requests on one series produce 50 unique, gapless numbers |
| P1-BE05 | Audit log | `audit_logs` + a model observer + explicit logging for approvals, postings and permission changes — closes `R-30` | P1-BE01 | BE | 5 | Every create, update and delete on an auditable model writes a row with actor, before, after and IP |
| P1-BE06 | Soft deletes | `SoftDeletes` on all master and transactional models; hard delete restricted and audited — closes `R-29` | P1-BE05 | BE | 3 | A deleted record disappears from listings, remains in the database and is restorable by System Admin |
| P1-BE07 | Permission registry | Per-module permission manifest; a command generating both the PHP seeder and a TypeScript union type — structurally closes `R-9` | P1-BE01 | BE | 5 | Adding a permission to a manifest regenerates both artefacts; a hand-typed permission string fails to compile in TypeScript |
| P1-BE08 | Policies and scopes | A base policy per module, query scopes for row-level filtering (own shift, assigned job, own leave) | P1-BE07 | BE | 5 | Every controller action calls `authorize()`; a test proves a scoped user sees only their own rows |
| P1-QA01 | Permission matrix test | A data-driven test asserting every role × module × action cell of §11.3 of the rebuild plan | P1-BE07 | QA | 5 | The test fails when a permission is added to a role without updating the matrix |
| P1-BE09 | Attachments + settings | Polymorphic `attachments`, scoped `settings` with a cached accessor | P1-BE01 | BE | 4 | A file attaches to any model; a setting change invalidates its cache |
| P1-BE10 | Notification channels | Database + mail + SMS through the gateway abstraction; per-user preferences | P1-BE01 | BE | 4 | One notification delivers on all three channels according to preference |
| P1-OPS01 | Queue, cache, storage, logging | Redis queue and cache; named queues `default`, `accounting`, `projections`, `notifications`, `exports`; Horizon; S3-compatible storage; structured logs with a correlation ID | P1-BE01 | DevOps | 6 | Horizon shows all five queues; a request's correlation ID appears in every log line it produces |
| P1-FE01 | Frontend foundation | Module-oriented page structure, shared component library, generated permission type wired into navigation — structurally closes `I-50` | P1-BE07 | FE | 6 | The sidebar gate for every item is generated, so a route/sidebar permission mismatch cannot be written |
| P1-BE11 | Shared page props | Cached category tree; cart and category props lazy/partial from the start — designs out `R-28` | P1-BE01 | BE | 3 | A JSON or OTP request runs no category or cart query |
| **P1-BE12** | **Migration toolkit** | A `Migration` support module: read-only legacy connection, `legacy_map` tables (`entity`, `legacy_id`, `new_id`, `imported_at`, `checksum`), an idempotent `Importer` base class with batching and resumability, a `Reconciler` base class (row counts, money totals, referential integrity, per-entity spot checks), a `migrate:legacy <entity>` command and a combined reconciliation report | P1-BE01, P0-DB02 | BE + Lead | 8 | A trivial pilot importer (units or brands) runs twice with zero duplicates, resumes after a forced mid-run failure, and emits a reconciliation report |
| **P1-BE13** | **Identity and credential migration** | Importer for legacy logins into the new `users`/`parties` split, carrying bcrypt hashes so passwords keep working; forced reset only where a hash is unusable; role mapping table legacy role → new role set | P1-BE12, P1-DB01, P1-BE07 | BE | 2 | A legacy user signs in to the new app with their existing password and lands with an equivalent permission set |
| P1-DOC01 | Module authoring guide | How to add a module, emit an event, declare permissions, write an action, write an importer | P1-BE01, P1-BE12 | Lead | 2 | A developer new to the project scaffolds a working module and a working importer from the guide alone |

---

### Phase 2 — Catalog + Inventory
**Goal:** one SKU-level stock model from the first commit, so the dual stock path behind `R-1` never exists.
**Effort: ~79 dev-days. Duration: ~3 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P2-DB01 | SKU model | `skus` as the single stock-carrying entity; every product has at least one SKU; no `products.stock` column exists | Phase 1 gate | BE | 8 | A simple product has exactly one SKU carrying its stock, price, SKU code and barcode; no second stock column exists anywhere |
| P2-BE01 | Catalog module | Product, Category, Brand, Unit, Attribute with repositories and actions | P2-DB01 | BE | 6 | Every catalog behaviour in the §1.15.1 baseline, including the delete guards, is green |
| P2-BE02 | Attribute semantics | Explicit add/update/remove on attribute values — designs out `R-20` | P2-BE01 | BE | 2 | Updating only the attribute name leaves its values intact |
| P2-BE03 | Image management | One polymorphic image collection with explicit replace, reorder and primary selection — designs out `R-21` | P2-BE01 | BE | 4 | Replacing images removes the old files from storage; ordering and primary selection are explicit |
| P2-BE04 | SKU uniqueness | SKU code and barcode uniqueness validated on create and update with self-ignore — designs out `R-22` | P2-BE01 | BE | 1 | A duplicate SKU on update returns a field error, not a database exception |
| P2-DB02 | Locations | `locations` table with one seeded default row; `location_id` on every movement (decision 6 — no UI) | P2-DB01 | BE | 2 | Every stock movement carries a location; no location UI exists |
| P2-BE05 | Stock ledger | `stock_movements` with `location_id`, `unit_cost`, polymorphic source reference, `reversal_of_id`; row locking | P2-DB02 | BE | 6 | A reversal movement references its original and restores the exact quantity |
| P2-BE06 | Stock levels projection | `stock_levels` unique on `(sku_id, location_id)`, updated in the same transaction as the movement | P2-BE05 | BE | 4 | `stock_levels` always equals the sum of movements for that SKU and location |
| P2-BE07 | Reservations | `stock_reservations` with expiry; `available = on_hand − reserved`; an expiry job every 15 minutes | P2-BE06 | BE | 5 | Two customers cannot both check out the last unit; an abandoned cart releases its hold |
| P2-BE08 | Stock counts | `stock_counts`, `stock_count_lines`; a count posts an adjustment movement | P2-BE05 | BE | 4 | A completed count reconciles `stock_levels` and writes an auditable adjustment |
| P2-BE09 | Price lists | `price_lists`, `price_list_items`; channel resolution with a base-price fallback | P2-BE01 | BE | 5 | POS and storefront resolve different prices for the same SKU when a channel list exists |
| P2-BE10 | Publishable scope and price facets | A global publishable scope; price filtering on a denormalised sellable price range — designs out `R-14` and `R-15` | P2-BE09 | BE | 4 | A deactivated product is invisible in browsing and search; a variant-priced product appears in price-filtered results |
| P2-FE01 | Catalog UI | Product, category, brand, unit, attribute screens with server-side pagination everywhere — designs out `R-26` for the back office | P2-BE01 | FE | 8 | No catalog screen loads an unpaginated collection |
| P2-FE02 | Inventory UI | Stock history, adjustment and stock count screens; paginated, server-searched | P2-BE08 | FE | 6 | The adjust screen never loads every product |
| P2-DB03 | Catalog + inventory importer | Legacy catalog and stock → new model with `legacy_id` maps; stock recomputed from the legacy ledger where possible, otherwise written as an opening adjustment carrying a documented reason | P2-BE06, P1-BE12 | BE | 6 | Reconciliation shows zero unexplained variance; the known variant-stock variance from `P0-DB01` is itemised and signed off |
| **P2-DB04** | **Media importer** | Legacy product and category images from the legacy `public` disk into the new media store, with checksum verification, path rewriting and a missing-file report | P2-BE03, P1-BE12 | BE | 4 | Every legacy image either lands in the new store with a matching checksum or appears on the missing-file report |
| P2-QA01 | Phase QA | Parity suite, stock reconciliation job, concurrency test on reservations | all above | QA | 4 | Phase acceptance gate met |

---

### Phase 3 — CRM + Procurement
**Goal:** customer and supplier as party roles; a real purchase-to-receipt flow.
**Effort: ~45 dev-days. Duration: ~2 sprints. Off the critical path — can run parallel to Phase 4.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P3-BE01 | CRM module | Customer as a party role; contacts; segments; customer screens | Phase 1 gate | BE | 6 | A legacy customer and a legacy supplier sharing a phone number resolve to one party with two roles |
| P3-DB01 | Party de-duplication | Match on normalised phone then email; a merge-candidate report; a merge action that re-points documents | P3-BE01, P1-BE12 | BE | 5 | The merge report is reviewed and applied; no document is orphaned by a merge |
| P3-BE02 | Procurement module | `purchase_orders` and lines replacing the legacy `restock_orders`, with a draft → approved state | P3-BE01 | BE | 6 | A PO cannot be received until approved; the legacy "only pending can be received" guard is preserved |
| P3-BE03 | Goods receipt | `goods_receipts` and lines supporting **partial** receipt; posts stock movements | P3-BE02, P2-BE05 | BE | 6 | Receiving 5 of 10 ordered units leaves the PO partially received and adds exactly 5 to stock |
| P3-BE04 | Supplier bill | `supplier_bills` as the AP document, matched to receipts | P3-BE03 | BE | 4 | A bill can be matched to one or more receipts and shows a variance when they disagree |
| P3-BE05 | Supplier search | OR groups correctly grouped — designs out `R-24` | P3-BE01 | BE | 0.5 | Search combined with the active filter never returns inactive suppliers |
| P3-FE01 | CRM + procurement UI | Customer, supplier, PO, receipt and bill screens | P3-BE04 | FE | 8 | All screens paginated and permission-gated |
| P3-DB02 | CRM + procurement importer | Legacy `suppliers` → party role; `restock_orders` → PO plus a receipt row for each received order | P3-BE03, P1-BE12 | BE | 5 | Counts and totals reconcile; received POs carry a receipt dated from `received_at` |
| P3-QA01 | Phase QA | Parity suite + merge-safety tests | all above | QA | 4 | Phase acceptance gate met |

---

### Phase 4 — Sales Core
**Goal:** one order aggregate, one state machine, one pricing engine, shared by all three channels.
**Effort: ~80 dev-days. Duration: ~3–4 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P4-DB01 | Order schema | One `status` column (no `order_status`/`status` pair — `R-3`); `channel` instead of `type` + `source`; one `sku_id` on lines (`R-1` impossible); `unit_cost` snapshot (`R-2` impossible); no `billing_address`, `shipping_amount`, `bonus_quantity` or `price_type` carried over | Phase 2 gate | BE | 6 | The legacy duplicate column pairs do not exist in the new schema; the parity suite is green |
| P4-BE01 | Order state machine | Declared transition matrix, guards, mandatory reason on cancel; `order_status_history` — designs out `R-4` | P4-DB01 | BE | 6 | An undeclared transition is rejected; every transition writes a history row with actor and reason |
| P4-BE02 | Reversible stock effects | Cancel reverses the issue; un-cancel re-issues; both as referenced, reversible documents — designs out `R-5` | P4-BE01, P2-BE05 | BE | 5 | A cancel → re-open → cancel cycle leaves stock exactly where it started |
| P4-BE03 | Pricing engine | One engine: line and document discount, `TaxCalculator` seam with a manual-rate strategy (decision 14), discount capped at subtotal (`R-23`) | P4-DB01 | BE | 7 | A discount larger than the subtotal is rejected; the same input produces the same total on server and client |
| P4-BE04 | Tender model | `tenders` supporting split payment; payment status derived from tenders, never set manually | P4-BE03 | BE | 6 | A sale paid half cash and half card produces two tender rows and a `PAID` status |
| P4-BE05 | Returns and refunds | `returns`, `return_lines`, `refunds` against the original tender | P4-BE04, P4-BE02 | BE | 8 | A partial return restocks only the returned quantity and refunds only its value |
| P4-BE06 | Invoice documents | Order and service invoice templates as PDF downloads — closes `I-59` | P4-BE01 | BE | 4 | Both invoice types download as PDF with identical branding |
| P4-BE07 | Sales events | `OrderPlaced`, `OrderConfirmed`, `OrderShipped`, `OrderDelivered`, `OrderCancelled`, `InvoiceIssued`, `PaymentReceived`, `ReturnAccepted`, `RefundIssued`, dispatched `afterCommit` | P4-BE05 | BE | 5 | Every event carries the source document identity and fires exactly once per transition |
| P4-BE08 | Cart service | One cart service with a guest cart token and merge-on-login; no session/database dual path (`R-25` never exists) | P4-DB01 | BE | 5 | A guest builds a cart, logs in, and keeps every line and quantity |
| P4-FE01 | Order management UI | List with filters, detail with the state machine, status history timeline, return and refund screens | P4-BE05 | FE | 10 | Only legal transitions are offered; the timeline shows who changed what and why |
| P4-QA01 | State machine test suite | Every cell of the transition matrix, with the stock effect asserted for each | P4-BE02 | QA | 6 | The full matrix is covered; no transition changes stock unexpectedly |
| P4-DB02 | Order importer | Legacy orders → new schema; status mapped from the `order_status`/`status` pair by a signed rule table; `unit_cost` backfilled from `products.cost_price` and **flagged as an estimate** | P4-BE01, P1-BE12 | BE | 7 | Counts and money totals reconcile to the cent; every backfilled cost is flagged; the status rule table is signed |
| P4-QA02 | Phase QA | Parity suite, totals consistency job, concurrent numbering test | all above | QA | 5 | Phase acceptance gate met |

---

### Phase 5 — Accounting
**Goal:** a real double-entry ledger, posting automatically from the events emitted in Phases 2–4.
**Basis: accrual / margin (decision 3).**
**Effort: ~98 dev-days. Duration: ~4–5 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P5-BIZ01 | Chart of accounts sign-off | Finance approves the §6.2 chart and the mapping of every legacy `expense_categories` row onto an account | — | BA + Finance | 3 | Signed mapping document; every legacy category has a target account |
| P5-BE01 | Accounting module core | `account_types`, `accounts` (self-referencing), `fiscal_years`, `fiscal_periods` with open/close | Phase 1 gate, P5-BIZ01 | BE | 7 | Posting into a closed period is rejected |
| P5-BE02 | Journal engine | `journals`, `journal_lines`; balanced-entry invariant; immutability after posting; reversal-only correction — rules A-1, A-2, A-8 | P5-BE01 | BE | 8 | An unbalanced entry cannot be saved; a posted entry cannot be edited, only reversed |
| P5-BE03 | Idempotent posting | Unique `(source_type, source_id, rule_key)`; queued, retried listeners — rules A-3, A-7 | P5-BE02, P4-BE07 | BE | 6 | Replaying the entire event stream produces zero duplicate journal lines |
| P5-BE04 | Sales posting rules | AR, revenue (goods and service separately), output tax, discount contra — §6.3 | P5-BE03 | BE | 7 | Every sale type produces the exact entry specified in §6.3 |
| P5-BE05 | Inventory posting rules | COGS on stock issue; inventory on receipt; valuation — the accrual half of decision 3 | P5-BE03, P2-BE05 | BE | 7 | Ledger account 1200 equals `Σ (stock_levels × unit cost)` at any point in time |
| P5-BE06 | Payment, AP, bank | Payment posting both directions; `bank_accounts`; reconciliation screen; over-payment guard preserved | P5-BE04 | BE | 8 | Recording a payment moves both the cash account and the AR/AP control account |
| P5-BE07 | Returns and refunds posting | Contra-revenue, inventory restore, refund against tender | P5-BE05, P4-BE05 | BE | 4 | A return reverses exactly the revenue and COGS of the returned lines |
| P5-BE08 | Ledger balances | `ledger_balances` materialised per account per period | P5-BE02 | BE | 4 | Materialised balances equal the sum of journal lines for every period |
| P5-BE09 | Financial statements | Trial balance, income statement (accrual), balance sheet, cash flow, account statement — decision 3 applied: **the income statement is the sole profit authority; cashbook and cash flow are cash views, never labelled profit** | P5-BE08 | BE | 8 | Trial balance nets to zero; the income statement reconciles to the ledger |
| P5-BE10 | AR / AP ageing | Ageing buckets 0-30 / 31-60 / 61-90 / 90+ replacing the legacy flat dues lists | P5-BE06 | BE | 4 | Ageing totals equal the AR and AP control account balances |
| P5-BE11 | Accounting permissions | Per-action accounting permissions; posting and period close split from entry — designs out `R-10` | P5-BE02, P1-BE07 | BE | 3 | A user with accounting view cannot delete an expense |
| P5-FE01 | Accounting UI | CoA, journal, ledger, statements, bank reconciliation, ageing, expenses, payments | P5-BE09 | FE | 12 | Every screen permission-gated per action |
| P5-BIZ02 | Opening balances | Finance supplies signed cash and bank balances as of the wave-2 cutover date (decision 9) | P5-BIZ01 | BA + Finance | 2 | Signed worksheet received |
| P5-DB01 | Accounting importer | Legacy expenses and payments → journal entries; the opening journal; historical documents posted at their original dates | P5-BIZ02, P5-BE09, P1-BE12 | BE | 7 | Trial balance after import nets to zero; totals match the legacy sums to the cent |
| P5-QA01 | Posting rule test suite | One integration test per rule in §6.3, plus a full event-replay idempotency test | P5-BE07 | QA | 8 | Every rule covered; replay produces no duplicates |

---

### Phase 6 — POS
**Goal:** a real point of sale with shifts, cash control, receipts and returns.
**Effort: ~61 dev-days. Duration: ~3 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P6-BE01 | Terminal and shift | `pos_terminals`, `pos_shifts` with open, close, counted cash, variance | Phase 5 gate | BE | 6 | A shift cannot be opened twice on one terminal; closing computes variance correctly |
| P6-BE02 | Cash movements | `pos_cash_movements` for pay-in and payout; variance posts to account 6900 | P6-BE01, P5-BE06 | BE | 4 | A cash-over shift posts to 6900 and appears in the cashbook |
| P6-BE03 | Hold / resume | `pos_held_sales` scoped to terminal and operator | P6-BE01 | BE | 4 | A held sale resumes with every line, discount and customer intact |
| P6-BE04 | POS sale action | Uses the shared pricing engine and tender model; payment captured at the sale, so `R-8` cannot occur | P4-BE04 | BE | 5 | A cash POS sale is created `PAID` with `paid_amount` set, and does **not** appear in Customer Dues |
| P6-BE05 | POS returns | Return against an original sale, refunded to the original tender | P4-BE05 | BE | 5 | A POS return restocks and refunds, and both post to the ledger |
| P6-BE06 | Server-side product search | Debounced search endpoint with barcode and SKU fallthrough — designs out `R-26` for POS (decision 8: no offline index) | P2-BE01 | BE | 4 | The POS page loads in under 2 seconds with 10 000 products; no full catalog is shipped to the browser |
| P6-FE01 | POS terminal | Search, cart, customer, split tender, discount, tax, hold/resume, return; one shared total calculation with the server | P6-BE05 | FE | 12 | On-screen total equals the stored total in every case; the `R-6` class of mismatch is structurally impossible |
| P6-FE02 | Receipt printing | 80 mm template, browser print, ESC/POS output (decision 7) | P6-FE01 | FE | 6 | A completed sale prints a receipt on an 80 mm printer with correct totals and tender breakdown |
| P6-FE03 | Shift screens | Open, X-report, close with counted-cash entry, Z-report | P6-BE02 | FE | 6 | X-report is repeatable and read-only; Z-report is immutable once generated |
| P6-DB01 | POS importer | Historical legacy POS orders assigned to a synthetic imported shift per day | P6-BE01, P4-DB02 | BE | 3 | Every historical POS order belongs to exactly one imported shift |
| P6-QA01 | Phase QA | Full shift cycle: open → sale → return → pay-in → close → Z, with ledger assertions | all above | QA | 6 | Every step posts correctly; variance reconciles |

---

### Phase 7 — E-commerce
**Goal:** the storefront on the new core, with registration, coupons, campaigns, returns and **URL parity with the legacy site**.
**Effort: ~85 dev-days. Duration: ~4 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P7-BE01 | Storefront queries | Catalog browsing on the new model with the publishable scope and denormalised price range | Phase 2 gate | BE | 5 | `R-14` and `R-15` verified absent on category, brand and search pages |
| P7-BE02 | Batched wishlist lookups | Single batched wishlist lookup per listing — `R-27` never exists | P7-BE01 | BE | 2 | A 24-product page runs a constant number of queries regardless of page size |
| P7-BE03 | Registration (decision 1) | `POST /register`, a `RegisterAction`, the 10-character password policy, a working `useAuth().register`; OTP and password paths create the same customer party — designs out `R-34` | Phase 1 gate, P1-BE13 | BE + FE | 5 | A new customer registers by email and password and lands authenticated; the same phone via OTP resolves to the same party |
| P7-BE04 | Checkout | Discount, manual tax and shipping applied at checkout; reservation committed on order | P4-BE03, P2-BE07 | BE | 7 | Checkout total equals the stored `total_amount` including tax and shipping |
| P7-BE05 | Shipping | Shipping zones, methods, rates; `shipments` with tracking | P7-BE04 | BE | 8 | A shipping method is selectable at checkout and its cost appears in the order and the ledger |
| P7-BE06 | Discounts and coupons | Discount rule engine; `coupons` with validity window, usage limits, minimum spend, per-customer limit | P4-BE03 | BE | 8 | An expired or over-used coupon is rejected with a clear message |
| P7-BE07 | Campaigns | A real campaign entity with a schedule and a compare-at price; no synthetic `price × 1.15` old price | P2-BE09 | BE | 5 | Flash-sale pricing comes from a scheduled campaign |
| P7-BE08 | RMA | Customer-initiated return request → approval → receipt → restock → refund | P4-BE05 | BE | 6 | A customer requests a return and the approved flow restocks and refunds |
| P7-BE09 | Payment gateway seam (decision 13) | `PaymentGateway` contract with a COD/offline driver only; no live provider | P4-BE04 | BE | 4 | Checkout records a COD tender through the contract; adding a provider later requires no checkout change |
| P7-FE01 | Storefront | Home, category, brand, search with facets, product detail, cart, checkout, account | P7-BE05 | FE | 16 | Every storefront behaviour in the §1.15.1 baseline is preserved; responsive at phone width |
| P7-FE02 | Account area | Profile, password, addresses, orders (paginated), invoices, returns | P7-BE08 | FE | 8 | `/my-account` never loads every order |
| **P7-OPS01** | **URL parity and redirect map** | Inventory of live legacy public URLs (products, categories, brands, pages, sitemap, feeds); slugs preserved by the importer; a 301 map for anything that must change; `robots.txt`, sitemap and canonical tags verified | P7-FE01, P2-DB03 | DevOps + BE | 3 | Every legacy public URL either resolves identically on the new app or 301s to its replacement; zero 404s in the crawl of the legacy URL list |
| P7-QA01 | Phase QA | Checkout ledger reconciliation, overselling test under concurrency, coupon abuse tests, crawl of the legacy URL list | all above | QA | 8 | No oversell is possible; checkout totals reconcile to the ledger; the crawl is clean |

---

### Phase 8 — Service Sale
**Goal:** a real service job lifecycle with quotations, typed serviced assets and warranty.
**Domain: general retail + repair with a typed asset register (decision 5).**
**Effort: ~58 dev-days. Duration: ~3 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P8-BE01 | Service module core | `service_categories`, `service_types` with a unique index, service job aggregate | Phase 4 gate | BE | 5 | The legacy auto-fill of `service_charge` from the selected type is preserved |
| P8-BE02 | Typed asset register (decision 5) | `asset_types`, `asset_type_attributes`, `serviced_assets` + values; seeded with a **Device** type (serial, model, brand, purchase date) and a **Vehicle** type (registration, chassis, engine number, odometer) | P8-BE01, P3-BE01 | BE | 6 | A new asset type can be added as data; both seeded types render their own fields with no code change |
| P8-BE03 | Job lifecycle | `RECEIVED → IN_PROGRESS → COMPLETED → DELIVERED → CLOSED`, plus `AWAITING_PARTS` and `AWAITING_APPROVAL`; `service_job_status_history`; an **express path** preserving the legacy one-step counter behaviour | P8-BE01, P4-BE01 | BE | 7 | The express path creates a completed invoice in one action; the full path enforces its transitions |
| P8-BE04 | Parts and labour | Part issue posts a stock movement referencing the job; labour lines logged separately; revenue split between service and goods accounts | P8-BE03, P5-BE04 | BE | 6 | The ledger shows service revenue and goods revenue on separate accounts for one job |
| P8-BE05 | Quotation | `quotations` and lines; approval converts a quotation to a job | P8-BE03 | BE | 5 | An approved quotation creates a job with identical lines |
| P8-BE06 | Technician assignment | Technician drawn from HRM employees, not from the `admin|super-admin|sales` roles the legacy system uses | P8-BE03, P9-BE01 | BE | 3 | Only employees flagged as technicians are assignable |
| P8-BE07 | Warranty | `warranties` from a job; `warranty_claims` creating a linked job | P8-BE03 | BE | 5 | A claim inside the warranty window creates a linked job at zero charge |
| P8-FE01 | Service UI | Job board, job detail, dynamic asset form, quotation, parts picker, warranty, invoice | P8-BE07 | FE | 12 | The asset form renders from the asset type definition with no hard-coded fields |
| P8-DB01 | Service importer | Legacy service orders → jobs at status `CLOSED`; `service_type` free text matched by name, unmatched values creating a type; assets not backfilled (no source data) | P8-BE03, P4-DB02 | BE | 4 | Every legacy service order becomes a closed job with its technician and parts |
| P8-QA01 | Phase QA | Both paths, warranty window boundaries, ledger revenue split | all above | QA | 5 | Phase acceptance gate met |

---

### Phase 9 — HRM
**Goal:** departments, designations, shifts, holidays, leave entitlement and immutable payroll that posts to the ledger. **This is the wave-1 cutover module.**
**Off the critical path — may start any time after Phase 1.**
**Effort: ~83 dev-days. Duration: ~4 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P9-BIZ01 | HR data inputs | Department and designation per employee; leave entitlement per type; holiday calendar and weekend definition (decisions 10, 11, 12) | — | BA + HR | 3 | All three sheets received and signed |
| P9-BE01 | Employee module | `employees` separate from the login `User`, with a unique index; role-escalation guards preserved | Phase 1 gate | BE | 6 | An employee can exist without a login; escalation is blocked |
| P9-BE02 | Department and designation (decision 10) | `departments`, `designations`; role never doubles as designation | P9-BE01 | BE | 4 | Employee and user listings show a real designation, not the first role name |
| P9-BE03 | Employee status change | `is_active` validated and audited; an absent field never deactivates — designs out `R-19` | P9-BE01 | BE | 1 | Editing an employee without sending `is_active` leaves their status unchanged |
| P9-BE04 | Shifts and holidays (decision 12) | `shifts`, `employee_shifts`, `holidays`, weekend configuration | P9-BIZ01, P9-BE01 | BE | 6 | Expected working days for a month are computed from shift + weekend + holidays |
| P9-BE05 | Attendance | Enum-backed status (`R-17` impossible); `shift_id`; future-date block and daily uniqueness | P9-BE04 | BE | 5 | An invalid status is rejected; the legacy grid behaviour is preserved |
| P9-BE06 | Attendance and late apply | `attendance_requests` for missed punch and late regularisation, with approval | P9-BE05 | BE | 5 | An approved request corrects the attendance record and is audited |
| P9-BE07 | Leave entitlement (decision 11) | `leave_types`, `leave_balances`, accrual, carry-forward; overlap guard preserved | P9-BIZ01, P9-BE05 | BE | 7 | A request exceeding the balance is rejected; approval deducts the balance |
| P9-BE08 | Leave to attendance | Approved leave writes `on-leave` attendance rows for the period — designs out `R-18` | P9-BE07 | BE | 3 | Approved leave days appear in the grid and are excluded from absence deduction |
| P9-BE09 | Salary structure | `salary_structures`, `salary_components` (allowances, deductions, overtime); bonus configurable, not a hard-coded `0` | P9-BE01 | BE | 6 | A structure with two allowances and one deduction computes correctly |
| P9-BE10 | Payroll | Immutable `payroll_runs` (`R-16` impossible); **working-day** basis from shift and holidays (decision 12); period lock; approval | P9-BE09, P9-BE08 | BE | 8 | An approved run cannot be regenerated; the deduction uses working days, not calendar days |
| P9-BE11 | Payroll posting | `PayrollApproved` → salary expense and payable; disbursement → cash payment | P9-BE10, P5-BE03 | BE | 4 | An approved run posts a balanced journal entry |
| P9-FE01 | HRM UI | Employee, department, designation, shift, holiday, attendance grid, apply screens, leave, payroll, payslip | P9-BE11 | FE | 12 | Attendance grid behaviour preserved; payroll screens paginated |
| P9-DB01 | HRM importer | Legacy `employee_profiles` → employees; attendance status mapped; `salaries` → locked historical runs; entitlement and calendar loaded from the HR sheets | P9-BIZ01, P9-BE10, P1-BE12 | BE | 5 | Historical runs import unchanged and locked; unmapped employees land in `Unassigned` |
| **P9-OPS01** | **Wave-1 cutover (HRM)** | Cutover runbook for HRM only per §11.2: rehearsal, delta import, go/no-go, legacy HRM set read-only, users redirected to the new app, rollback rehearsed | P9-DB01, P9-QA01, P5-BE03 | DevOps + Lead | 3 | HRM users work only in the new app; legacy HRM screens are read-only; rollback was demonstrated in rehearsal |
| P9-QA01 | Phase QA | Working-day payroll verification against a finance-approved worked example | all above | QA | 5 | The new figure matches the approved example for three sample employees |

---

### Phase 10 — Reporting
**Goal:** one reporting engine over read models, with the full catalogue of §8.2.
**Effort: ~75 dev-days. Duration: ~3–4 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P10-BE01 | Read model infrastructure | Projector base class, rebuild command, drift detection | Phase 5 gate | BE | 6 | Any read model can be rebuilt from scratch and matches the source |
| P10-BE02 | Sales read models | `rm_orders`, `rm_order_lines` projected from sales events | P10-BE01, P4-BE07 | BE | 6 | Projections match transactional totals exactly |
| P10-BE03 | Inventory, CRM, service, POS read models | `rm_stock_levels`, `rm_stock_valuation`, `rm_customers`, `rm_service_jobs`, `rm_pos_shifts` | P10-BE01 | BE | 8 | Each projection rebuilds clean and matches its source |
| P10-BE04 | Report registry | Definition contract of §8.3: key, permission, filters, columns, aggregations, detail route, exports, source | P10-BE02 | BE | 7 | A new report is added by registering a definition, with no new controller |
| P10-BE05 | Report catalogue | All 34 reports of §8.2, each with summary and detail | P10-BE04, P10-BE03 | BE | 16 | Every report returns correct figures over a known dataset |
| P10-BE06 | One date convention | One document-date convention across every report; cancelled documents excluded by default with an explicit toggle — designs out `R-12` and `R-13` | P10-BE05 | BE | 3 | Two reports over the same range and filters never disagree |
| P10-BE07 | Export pipeline | CSV, Excel, PDF from one pipeline; large exports queued and delivered as a link | P10-BE04 | BE | 6 | A 100 000-row export completes without a timeout |
| P10-BE08 | Scheduling and saved views | `report_schedules`, `saved_views` | P10-BE07 | BE | 5 | A scheduled report is delivered on time to the configured recipients |
| P10-FE01 | Reporting UI | One report shell rendering any definition: filters, summary tiles, table, drill-down, export | P10-BE04 | FE | 10 | Adding a backend report definition makes it appear in the UI with no frontend change |
| P10-QA01 | Phase QA | Figure-by-figure verification of every report against a seeded dataset | all above | QA | 8 | Every report verified; drift job clean |

---

### Phase 11 — Analytics
**Goal:** fact tables, KPIs and a management dashboard.
**Effort: ~40 dev-days. Duration: ~2 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P11-BE01 | Fact tables | `fact_daily_sales`, `fact_daily_inventory`, `fact_daily_finance`, `fact_daily_hr` | Phase 10 gate | BE | 6 | Each fact table is defined with its dimensions and measures |
| P11-BE02 | Aggregators | Idempotent, re-runnable for any date range; targeted re-aggregation on late corrections | P11-BE01 | BE | 7 | Re-running a date range twice produces identical rows |
| P11-BE03 | KPI definitions | The 14 KPIs of §9.2, each computed from fact tables only | P11-BE02 | BE | 6 | Each KPI matches a hand-calculated figure over a known dataset |
| P11-BE04 | Trend and cohort analysis | Sales trend, ABC analysis, RFM, cohorts, inventory turnover, POS performance, HR indicators | P11-BE03 | BE | 8 | Each analysis returns correct figures over the seeded dataset |
| P11-FE01 | Management dashboard | KPI tiles, trend charts, drill-down into the matching report | P11-BE04 | FE | 8 | The dashboard loads within the agreed budget on production-sized data |
| P11-QA01 | Phase QA | Aggregator idempotency, KPI verification, late-correction handling | all above | QA | 5 | Phase acceptance gate met |

---

### Phase 12 — Parallel Run, Cutover & Decommission
**Goal:** prove the new system produces the same business answers as legacy on the same data, cut the core system over in one window, then retire legacy.
**This phase carries the risk that the strangler-fig model spread across every phase. It is not optional and it is not compressible.**
**Effort: ~64 dev-days. Duration: ~3 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P12-QA01 | End-to-end suite | Playwright on the critical paths: checkout, POS shift cycle, service job, payroll run, month-end close | Phase 11 gate | QA | 8 | All critical paths green in CI |
| P12-QA02 | Full permission matrix | Every role × module × action cell re-verified on the finished system | P1-QA01 | QA | 5 | Zero unexpected grants or denials |
| **P12-QA03** | **Parallel run / shadow validation** | The new app loaded from a current legacy snapshot; a comparison harness diffing the last 3 months of legacy figures against the new reports (sales by day and channel, stock on hand by SKU, customer dues, supplier dues, cash position, service revenue, payroll totals); every difference either explained by a recorded decision or fixed | P12-QA01, P10-QA01 | QA + BE | 8 | A signed variance document in which every line is either zero or traced to a numbered decision (notably decision 3 and `RK-1`) |
| **P12-OPS05** | **Delta import rehearsals** | Two full dress rehearsals of the wave-2 sequence on a fresh snapshot: full history import, freeze, delta import of the open window, reconciliation, smoke test, timing recorded | P12-QA03, all importers | DevOps + BE | 6 | Two rehearsals complete inside the agreed cutover window with zero unexplained variance; timings published |
| **P12-OPS06** | **Traffic switch and freeze tooling** | Legacy read-only mode (operational procedure plus any required infrastructure switch), DNS/load-balancer cutover, maintenance page, a scripted 15-minute smoke test, and a documented rollback including manual re-entry of anything captured in the new system during the window | P12-OPS05 | DevOps + Lead | 4 | Rollback rehearsed end to end; the operations team executes the smoke script unaided |
| P12-OPS01 | Load testing | POS checkout, storefront browsing and reporting under production-sized data | P12-QA01 | DevOps + BE | 5 | Agreed response-time budgets met |
| P12-BE01 | Index and query tuning | Slow-query review against §13.11; missing indexes added | P12-OPS01 | BE | 5 | No query over the agreed threshold remains in the critical paths |
| P12-BE02 | Consistency job suite | All seven jobs of §14.6 scheduled and alerting | Phase 5 gate | BE | 5 | Each job runs nightly and reports zero drift |
| P12-OPS02 | Security review | CORS restricted to `api/*` with an explicit allow-list; rate limits on writes and exports; `APP_DEBUG=false` verified outside local; sensitive-field encryption verified; the legacy seeded super-admin credential not reproduced | — | DevOps + Lead | 5 | Review checklist signed |
| P12-OPS03 | Deployment pipeline | Blue/green or rolling deploy; expand → backfill → contract migrations; Horizon supervised; backups with a **rehearsed restore** | — | DevOps | 6 | A restore from backup is demonstrated end to end |
| P12-DOC01 | Documentation and training | Operations runbook, module guide, user guides per module, training sessions delivered before the wave-2 window | — | Lead + BA | 4 | Each module has an owner trained on it; training is complete before go/no-go |
| **P12-OPS07** | **Legacy decommission** | After the agreed stabilisation period: legacy taken offline, final database archived with a documented restore path, a read-only history access route agreed, hosting and credentials revoked | wave 2 stable | DevOps + Lead | 3 | Legacy is offline; the archive restores in a rehearsal; no production traffic reaches it |

---

## 6. Milestones and gates

Phases 0–11 produce **internal** milestones: the software exists, is imported and reconciles, but users are still on legacy. Only `MC1` and `MC2` are business-visible.

| Milestone | Reached when | Outcome |
|---|---|---|
| **M0 — Project ready** | Phase 0 gate | New repository, CI, staging, legacy snapshot pipeline, signed legacy behaviour baseline, signed data-quality baseline, signed mapping workbook, legacy freeze in force |
| **M1 — Platform ready** | Phase 1 gate | Module skeleton, audit log, soft deletes, generated permissions, queues, storage, **migration toolkit**, credential migration proven |
| **M2 — One stock truth** | Phase 2 gate | SKU-level stock imported from legacy and reconciled; images migrated; overselling prevented in the new app |
| **M3 — Sales core built** | Phase 4 gate | One order model, guarded transitions, full history, returns and refunds; legacy orders imported and reconciled to the cent |
| **M4 — Books are real** | Phase 5 gate | Double-entry ledger; trial balance nets to zero on imported data; the income statement is the single profit authority |
| **M5 — Counter ready** | Phase 6 gate | Shifts, cash control, receipts and POS returns accepted by QA on staging |
| **M6 — Storefront ready** | Phase 7 gate | Registration, coupons, campaigns, shipping, RMA and **URL parity** accepted |
| **M7 — Service ready** | Phase 8 gate | Job lifecycle, quotations, typed assets, warranty accepted |
| **MC1 — HRM live (wave 1)** | `P9-OPS01` complete | **Business-visible.** HR and payroll run in the new system; legacy HRM is read-only |
| **M9 — One reporting truth** | Phase 10 gate | 34 reports, one date convention, no contradictory figures |
| **M10 — Management visibility** | Phase 11 gate | KPI dashboard on fact tables |
| **M11 — Parallel run signed** | `P12-QA03` complete | Three months of legacy figures reproduced by the new system, with every variance explained |
| **MC2 — Core system live (wave 2)** | `P12-OPS06` executed, smoke test green | **Business-visible.** All sales, POS, storefront, service, inventory, accounting and reporting run in the new system; legacy is read-only |
| **M12 — Rebuild complete** | `P12-OPS07` complete | Legacy offline and archived; load, security and restore all verified |

---

## 7. Timeline

Weekly capacity ~24 developer-days. Phases 3 and 9 run off the critical path. Phase 9 ends in the wave-1 cutover, which is the only business-visible delivery before week ~36.

```
Week   1   3   5   7   9  11  13  15  17  19  21  23  25  27  29  31  33  35  37  39  41
       │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
P0  ███████                                                                              Setup + legacy baseline
P1      ██████████████                                                                   Foundation + ETL toolkit
P2                  ████████████                                                         Catalog+Inventory
P3                          ████████                                                     CRM+Procurement  (parallel)
P4                          ██████████████                                               Sales Core
P5                                      ██████████████████                               Accounting
P6                                                      ████████████                     POS
P7                                                          ████████████████             E-commerce
P8                                                              ████████████             Service
P9                  ██████████████████▲                                                  HRM (parallel)  ▲ = MC1 wave 1
P10                                                                 ████████████         Reporting
P11                                                                         ████████     Analytics
P12                                                                             ██████▲  Parallel run + cutover  ▲ = MC2
```

**Critical path:** P0 → P1 → P2 → P4 → P5 → P6 → P7 → P10 → P11 → P12.
**Why longer than the strangler-fig version:** wave 2 is a single event, so **every** core module — including e-commerce, service and reporting — must be finished, reconciled and parallel-run before any of it goes live. Nothing can be cut over early to de-risk the rest.
**Sprint count:** ~20 two-week sprints.
**Buffer:** the plan above contains no schedule buffer. Add 15 % (≈6 weeks) before committing a date externally. For a big-bang wave 2, also fix the go-live date on a **low-season week** and keep one fallback window two weeks later.

---

## 8. QA plan

| Level | Scope | When |
|---|---|---|
| Unit | Domain logic, pricing engine, payroll calculation, state machines | Every task |
| Feature | One test per action; happy path plus each guard | Every task |
| Integration | Accounting posting rules (one per rule in §6.3), stock movement paths, event replay idempotency | Phases 2, 4, 5 |
| Behaviour parity | The 20 preserved behaviours of §1.15.1, recorded from legacy in `P0-QA01` | Every phase gate |
| Permission matrix | Every role × module × action cell | Phase 1, re-run at every gate, full re-verify in Phase 12 |
| Migration reconciliation | Row counts, money totals, referential integrity, 20-record spot checks per entity, idempotency (run twice), resumability (kill mid-run) | Every phase with an importer |
| **Shadow / parallel run** | Legacy figures vs. new figures over the same 3-month window, per `P12-QA03` | Before wave 2 go/no-go |
| Performance | Query-count assertions per endpoint; load tests on POS, storefront, reporting | Every task; formally in Phase 12 |
| End-to-end | Checkout, POS shift cycle, service job, payroll run, month-end close | Phase 12 |
| Cutover rehearsal | The full wave sequence on a fresh snapshot, twice, inside the agreed window | `P9-OPS01`, `P12-OPS05` |

**Negative and boundary scenarios** are already enumerated in §14.3 and §14.9 of the system analysis; QA should lift them directly into the test plan rather than re-deriving them.

**One QA engineer is thin for this model.** The parity suite, the reconciliation of every importer and the parallel run all land on the same person. If wave 2 slips, this is the first place to look for the cause.

---

## 9. Business input checklist

Each input blocks a **cutover wave**, not development.

| # | Input | Owner | Needed by | Blocks | Status |
|---|---|---|---|---|---|
| 1 | Legacy change-freeze approval and acceptance of `R-1`, `R-2`, `R-6`, `R-9` staying live until wave 2 — or a separate patch authorisation | PM + Legacy owner | Phase 0, task `P0-BIZ01` | The whole delivery model | ☐ |
| 2 | Read-only access to a production-sized legacy database copy | Legacy owner + DevOps | Phase 0, task `P0-OPS04` | Every importer | ☐ |
| 3 | Chart of accounts sign-off + expense-category mapping | Finance | Phase 5, task `P5-BE01` | All accounting posting | ☐ |
| 4 | Opening cash and bank balances as of the wave-2 date (decision 9) | Finance | Phase 5, task `P5-DB01` | Opening journal | ☐ |
| 5 | Acknowledgement that the new income statement will not match the old cash P&L (decision 3) | Finance | `P12-QA03` | Wave 2 go/no-go | ☐ |
| 6 | Department and designation per employee (decision 10) | HR | Phase 9, task `P9-DB01` | Wave 1 | ☐ |
| 7 | Leave entitlement per type + opening balances (decision 11) | HR | Phase 9, task `P9-DB01` | Wave 1 | ☐ |
| 8 | Holiday calendar + weekend definition (decision 12) | HR | Phase 9, task `P9-BE04` | Working-day payroll | ☐ |
| 9 | Sign-off that payroll deductions change under the working-day basis (decision 12) | Finance + HR | `P9-OPS01` | Wave 1 | ☐ |
| 10 | Receipt printer model and paper width confirmation (decision 7) | Operations | Phase 6, task `P6-FE02` | Receipt output format | ☐ |
| 11 | Party merge review — approve or reject each merge candidate | Operations | Phase 3, task `P3-DB01` | Customer import | ☐ |
| 12 | Attendance status mapping for any free-text value not in the new enum | HR | Phase 9, task `P9-DB01` | Attendance import | ☐ |
| 13 | Order status mapping rules from the legacy `order_status` / `status` pair | Operations | Phase 4, task `P4-DB02` | Order import | ☐ |
| 14 | **Open-document cutoff policy** — which in-flight orders, POs, service jobs and unpaid invoices migrate as open, and which are closed out in legacy before the window | Operations + Finance | `P12-OPS05` | Wave 2 delta import | ☐ |
| 15 | **Wave-2 go-live window** — date, maximum acceptable downtime, and a named go/no-go decision maker | PM + Operations | `P12-OPS06` | Wave 2 | ☐ |
| 16 | **Training window** for all operators before wave 2 (POS, storefront admin, service, accounting in one go) | Operations + BA | `P12-DOC01` | Wave 2 | ☐ |
| 17 | Legacy public URL inventory and SEO owner sign-off on the redirect map | Marketing / Operations | Phase 7, task `P7-OPS01` | Wave 2 storefront switch | ☐ |
| 18 | Legacy retention and archive policy (how long the archive is kept, who may restore it) | Finance + Legacy owner | `P12-OPS07` | Decommission | ☐ |

---

## 10. Risk register

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| RK-1 | Historical margin is unrecoverable — every legacy `order_items.cost_price` is `0` (`R-2`) | Certain | Medium | Backfill from `products.cost_price`, flag every backfilled row as an estimate, and state the limitation in every historical margin report | Tech lead |
| RK-2 | Variant stock in the legacy data is wrong (`R-1`), so imported opening stock is wrong | Certain | High | Recompute from the legacy ledger where possible; a signed variance list covers the rest; **a physical stock count immediately before wave 2 is strongly recommended** and is the only real remedy | Tech lead + Operations |
| **RK-13** | **Legacy keeps corrupting data for the whole project, because nothing is fixed forward** | Certain | High | Quantified monthly by re-running `P0-DB01` against a fresh snapshot so the growth is visible, not assumed; physical stock count before wave 2; or the business authorises the four micro-patches under `P0-BIZ01` | PM + Tech lead |
| **RK-14** | **Big-bang wave 2 concentrates all delivery risk in one window** | High | Very high | Two full dress rehearsals (`P12-OPS05`), a signed parallel run (`P12-QA03`), a scripted smoke test, a rehearsed rollback, a low-season date, and a named fallback window | Tech lead + PM |
| **RK-15** | **Legacy and new diverge because a legacy hotfix is applied quietly** | High | High | Freeze register with written approval; every approved legacy change creates a matching new-repo task in the same week; monthly diff of the legacy schema against the `P0-DB02` workbook | PM + Legacy owner |
| **RK-16** | **No business value for ~8 months erodes sponsor confidence and funding** | High | High | Wave 1 (HRM) pulled as early as Phase 9 allows; fortnightly staging demos from Phase 2 onward; burn-up against §12 published weekly | PM |
| **RK-17** | **The wave-2 delta window is longer than the agreed downtime** | Medium | High | History imported days earlier; the window imports only the open-document delta (`P0-BIZ01` cutoff policy, §9 item 14); timings published from two rehearsals; if the window cannot be met, the fallback is a weekend read-only period, agreed in advance | DevOps + Tech lead |
| **RK-18** | **All operators retrain on every module at once at wave 2** | High | Medium | Training before the window (`P12-DOC01`), per-role quick-reference cards, two weeks of on-site floor support after go-live, and an elevated support rota | BA + Operations |
| **RK-19** | **Storefront URL or SEO regression at the switch** | Medium | Medium | Slug-preserving import, 301 map, crawl of the full legacy URL list as a `P7-QA01` gate, sitemap resubmission, organic-traffic monitoring for 4 weeks after go-live | BE + Marketing |
| RK-3 | Old and new profit figures disagree, and the business distrusts the new system | High | High | Decision 3 recorded with reasoning; the parallel run (`P12-QA03`) produces a line-by-line explanation; finance sign-off is a wave-2 gate item | BA + Finance |
| RK-4 | Payroll deduction changes under the working-day basis and employees query their pay | High | High | Run both bases in parallel for one month before wave 1; finance and HR sign-off on a worked example (`P9-QA01`) | BA + HR |
| RK-5 | Business inputs in §9 arrive late | Medium | High | Each is on the checklist with an owner and a needed-by task; a missing input delays a wave, and development continues | PM |
| RK-6 | Scope creep from `[NEW]` items | High | Medium | Every `[NEW]` item is tagged in the rebuild plan; anything not in a task row here is out of scope for this programme | PM + Tech lead |
| RK-7 | Party de-duplication merges two genuinely different people | Medium | High | Merges are reviewed and approved individually (§9 item 11), reversible for 30 days, and fully audited | BA |
| RK-8 | Accounting listeners double-post on an event replay | Medium | High | Idempotency key `(source_type, source_id, rule_key)` plus a dedicated replay test (`P5-QA01`) | BE |
| RK-9 | Key-person dependency on the tech lead | Medium | High | Module authoring guide (`P1-DOC01`); two reviewers on every architectural change | PM |
| RK-10 | Staging is not production-sized, so migration rehearsals mislead | Medium | High | `P0-OPS04` makes a production-sized anonymised snapshot a Phase 0 deliverable, refreshable on demand | DevOps |
| RK-11 | The legacy system keeps generating data during a long rebuild, widening the import delta | Certain | Medium | Idempotent, resumable importers (`P1-BE12`), re-run against a fresh snapshot at every phase gate, and a rehearsed delta run | Tech lead |
| RK-12 | Timeline pressure leads to skipping phase gates or a rehearsal | Medium | Very high | Gates are defined in §4.3 and require two signatures; **wave 2 without two clean rehearsals is not authorised** | PM |
| **RK-20** | **Two systems to operate for ~9 months** (legacy support plus new-system environments) | Certain | Medium | Legacy support stays with its current owner and is excluded from §2.2 capacity; if that is not possible, re-baseline the timeline | PM |

---

## 11. Cutover runbook

### 11.1 Two waves

| Wave | Scope | Why it can be separated | Target |
|---|---|---|---|
| **Wave 1** | HRM: employees, departments, designations, shifts, holidays, attendance, leave, payroll, payslips | HRM shares no live transactional data with sales. Its only outbound coupling is payroll → ledger, which posts inside the new system | `P9-OPS01`, around week 20 |
| **Wave 2** | Everything else: catalog, inventory, CRM, procurement, sales, accounting, POS, e-commerce, service, reporting, analytics | These share stock, parties, orders and the ledger. Splitting them across two live systems would require bidirectional sync, which costs more and is less safe than one window | `P12-OPS06`, around week 39 |

**Service-sale technicians** read from HRM employees, so wave 1 must precede wave 2 — which it does.

### 11.2 Wave 1 sequence (HRM)

```
T-10 days   Freeze HRM scope. All §9 HR inputs received. Phase 9 acceptance gate signed.
T-7  days   Full rehearsal on a fresh legacy snapshot. Reconciliation report produced.
T-5  days   Parallel payroll: one month computed in both systems, variance explained and signed.
T-3  days   Rollback rehearsal (users back on legacy HRM, new data exported).
T-1  day    Go / no-go. Gate criteria (§4.3) reviewed and signed.
T-0         Window (HRM only, outside a payroll run):
              1. Legacy HRM screens set read-only
              2. Delta import (employees, attendance, leave, salary history)
              3. Reconciliation — abort on any unexplained variance
              4. Smoke test (scripted, 15 minutes)
              5. HR users switched to the new app
T+1  day    Floor support for HR. Consistency jobs reviewed each morning.
T+30 days   First full payroll run in the new system, reviewed against the worked example.
```

### 11.3 Wave 2 sequence (core system — big bang)

```
T-30 days   Scope freeze on all core phases. Parallel run (P12-QA03) signed.
T-21 days   Dress rehearsal 1 on a fresh snapshot. Full timing published.
T-14 days   Operator training complete (P12-DOC01). Open-document cutoff policy signed (§9 item 14).
T-10 days   Dress rehearsal 2, including the rollback path. Go/no-go criteria finalised.
T-7  days   Physical stock count scheduled and staffed (RK-2). Communications to customers about the storefront window.
T-3  days   Bulk history import into production (everything older than the open window), reconciled but not yet serving traffic.
T-1  day    Go / no-go meeting. Named decision maker signs. Fallback window confirmed.
T-0         Window:
              1. Legacy set read-only; storefront shows a maintenance page; POS stops taking sales
              2. Delta import: open documents, balances, stock as counted
              3. Reconciliation script — abort on any unexplained variance
              4. Opening journal posted; trial balance verified to net zero
              5. Smoke test (scripted, 15 minutes): POS sale, checkout, service job, report, payment
              6. DNS / load-balancer switch to the new app; maintenance page removed
              7. Announce go-live; floor support active on every site
T+1  day    Hypercare: elevated support rota, consistency jobs reviewed hourly, then daily
T+7  days   First week review: variance log, support volume, performance budgets
T+30 days   First month-end close in the new system, reviewed with finance
T+45 days   Decommission decision (P12-OPS07)
```

**Abort criteria at any step:** unexplained reconciliation variance, a failed smoke test, a failed trial balance, or a consistency job reporting drift.

**Rollback means** traffic returns to legacy, legacy is set writable, and anything captured in the new system during the window is re-entered manually from the new system's audit log. Because the new system may have taken live transactions, **rollback is not free** — this is the central cost of a big-bang wave and the reason `P12-OPS06` requires a rehearsed manual re-entry procedure.

---

## 12. Effort summary

Every figure below is the arithmetic sum of the task rows in §5. (The previous strangler-fig edition of this document quoted phase subtotals that did not match its own rows; these do.)

| Phase | Name | Dev-days | On critical path |
|---|---|---|---|
| 0 | Project Setup & Legacy Baseline | 27 | Yes |
| 1 | Foundation / Shared Kernel (incl. ETL toolkit) | 80 | Yes |
| 2 | Catalog + Inventory | 79 | Yes |
| 3 | CRM + Procurement | 44.5 | No |
| 4 | Sales Core | 80 | Yes |
| 5 | Accounting | 98 | Yes |
| 6 | POS | 61 | Yes |
| 7 | E-commerce | 85 | Yes (wave 2 needs it) |
| 8 | Service Sale | 58 | No |
| 9 | HRM (incl. wave-1 cutover) | 83 | No |
| 10 | Reporting | 75 | Yes |
| 11 | Analytics | 40 | Yes |
| 12 | Parallel Run, Cutover & Decommission | 64 | Yes |
| | **Total** | **~875** | |

| Measure | Value |
|---|---|
| Total effort | ~875 developer-days |
| Weekly capacity | ~24 developer-days |
| Capacity-bound floor | ~37 weeks, even with perfect parallelisation |
| Elapsed duration | ~40 weeks (~9.5 months) with the parallelisation in §7 |
| Sprints | ~20 (two-week) |
| Recommended buffer | +15 % (~6 weeks) before committing an external date |
| Excluded from the total | Legacy support and legacy bug triage; the optional legacy micro-patches under `P0-BIZ01` (~10 dev-days); QA cycle time and rework (§2.2) |

### 12.1 Difference from the strangler-fig edition

Comparison is against the **row sums** of the previous edition (842.5 dev-days), not its quoted 810.

| Change | Phase | Dev-days |
|---|---|---|
| Legacy forward-fixes dropped (`R-1`, `R-2`, `R-6`, `R-9`, config fix, repository hygiene) | 0 | −14 |
| New repository and local development environment, replacing repository hygiene | 0 | +3 |
| Legacy → target mapping workbook + change-freeze policy | 0 | +6 |
| Larger staging task: snapshot production pipeline, not just an environment | 0 | +1 |
| Back-compatibility views for the legacy code path no longer needed | 1 | −1 |
| Migration toolkit (`P1-BE12`) | 1 | +8 |
| Identity and credential migration (`P1-BE13`) | 1 | +2 |
| Media importer (`P2-DB04`) | 2 | +4 |
| URL parity and redirect map replacing legacy dead-link cleanup | 7 | 0 |
| Wave-1 cutover (`P9-OPS01`) | 9 | +3 |
| Parallel run, delta rehearsals, traffic-switch tooling, decommission | 12 | +21 |
| Feature-flag removal no longer needed | 12 | −2 |
| **Net** | | **+31 (842.5 → ~875)** |

The calendar cost is larger than the effort cost: roughly **+5 weeks**, because e-commerce, service and reporting all move **onto** the pre-cutover critical path. Effort rises ~4 %; elapsed time rises ~15 %; delivery risk concentrates almost entirely into one window (`RK-14`).

---

## 13. Tracking

**Board columns:** Backlog → Ready (DoR met) → In Progress → In Review → In QA → Done (DoD met) → Imported & Reconciled (importer + reconciliation green) → Live (cut over).

**Per-task fields to carry into the tracker:** task ID, phase, stream, deliverable, dependencies, role, estimate, acceptance criterion, linked `R-` items, linked legacy entity (for importer tasks).

**Weekly reporting:** developer-days burned vs. estimated per phase; gate criteria status; §9 checklist status; open risks from §10; **legacy freeze register entries this week**; **legacy data-quality trend from the monthly re-run of `P0-DB01`**.

**Non-negotiables** — escalate rather than silently skip:
1. A phase acceptance gate (§4.3) is never partially passed.
2. No importer runs against production data without two clean rehearsal runs on a fresh snapshot.
3. Wave 2 is not authorised without a signed parallel run (`P12-QA03`) and two clean dress rehearsals (`P12-OPS05`).
4. A `[NEW]` item not present in a task row above is out of scope for this programme.
5. The behaviour-parity suite from `P0-QA01` never goes red.
6. No change to the legacy application without a freeze-register entry approved by the legacy owner and the PM.

---

*End of work plan.*

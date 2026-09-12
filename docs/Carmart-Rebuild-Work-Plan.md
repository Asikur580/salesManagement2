# Carmart Rebuild — Work Plan

> **What this is.** The task-level execution plan for the rebuild described in [Carmart-Rebuild-Plan.md](Carmart-Rebuild-Plan.md). That document decides *what* to build and *why*; this one decides *who does what, in what order, and how we know it is done*.
>
> **Companion documents.**
> * [Carmart-Full-System-Analysis.md](Carmart-Full-System-Analysis.md) — the audit of the current codebase. Every `R-` item and `I-` item referenced below is defined there.
> * [Carmart-Rebuild-Plan.md](Carmart-Rebuild-Plan.md) — target architecture, module designs, migration strategy, decision register.
>
> **Audience.** Project manager, tech lead, developers, QA. Task IDs are stable and are meant to be copied straight into the issue tracker.

---

## 1. How to use this document

| You are | Read |
|---|---|
| Project manager | §2 assumptions, §6 milestones, §7 timeline, §9 business-input checklist, §10 risks |
| Tech lead | Everything, especially §5 work breakdown and §4 definitions of ready/done |
| Developer | §4, then your phase in §5 |
| QA | §4, §8 QA plan, and the acceptance column of every task |

**Task ID format:** `P<phase>-<stream><nn>` — for example `P2-BE04` is Phase 2, backend, task 4. Streams: `BE` backend, `FE` frontend, `DB` database/migration, `QA` quality, `OPS` infrastructure, `DOC` documentation, `BIZ` business input required.

Every task row carries: deliverable, dependencies, role, estimate in developer-days, and an acceptance criterion that QA can verify without reading the code.

---

## 2. Planning assumptions

These are assumptions, not facts from the codebase. Change them and the timeline changes proportionally.

| Assumption | Value | Effect if wrong |
|---|---|---|
| Team size | 1 tech lead, 3 backend, 2 frontend, 1 QA, 0.5 DevOps, 0.5 BA/PM | Timeline scales roughly linearly with delivery engineers |
| Productive capacity | 4 developer-days per person per week (meetings, review, support absorb the rest) | A higher figure shortens the plan but historically does not hold |
| Weekly team capacity | ~24 developer-days | — |
| Sprint length | 2 weeks | — |
| Estimation basis | Developer-days including unit tests and code review, **excluding** QA cycle time and rework | Rework typically adds 10–15 % |
| Environments | local, staging (production-sized data copy), production | Without a production-sized staging copy, migration rehearsals are unreliable |
| Existing system | Stays live throughout; the rebuild is a strangler-fig replacement inside the same repository | — |
| Business availability | The data inputs in §9 arrive before the cutover of their phase | Each missing input blocks a cutover, not development |

**Total estimated effort: ~810 developer-days.** At ~24 developer-days per week with the parallelisation in §7, that is approximately **34 calendar weeks (~8 months)** from Phase 0 start to Phase 12 completion.

---

## 3. Team, roles and ownership

| Role | Owns | Key responsibility in this plan |
|---|---|---|
| Tech lead | Architecture, module boundaries, code review | Enforces the §2.3 dependency rules of the rebuild plan; approves every migration script |
| Backend dev × 3 | Modules, actions, events, posting rules | One developer per active module wherever possible |
| Frontend dev × 2 | Inertia pages, shared component library, permission-driven UI | One owns the back office, one owns POS + storefront |
| QA × 1 | Test plans, regression suite, permission matrix, migration reconciliation | Sign-off gate on every phase |
| DevOps (0.5) | CI, environments, queues, backups, deploy pipeline | Phase 0 and Phase 12 heavy, light in between |
| BA / PM (0.5) | Business inputs (§9), sign-offs, stakeholder comms | Owns the §9 checklist and the finance/HR sign-offs |
| Finance stakeholder | Chart of accounts mapping, opening balances, profit-basis sign-off | Blocks Phase 5 cutover if unavailable |
| HR stakeholder | Departments, designations, leave entitlement, holiday calendar | Blocks Phase 9 cutover if unavailable |

---

## 4. Working agreements

### 4.1 Definition of Ready (a task may be started)

1. Acceptance criterion is written and understood by QA.
2. Dependencies listed in the task row are complete or explicitly waived by the tech lead.
3. Any business input the task needs (§9) has arrived.
4. The module boundary is clear — the task does not require importing another module's Eloquent model.

### 4.2 Definition of Done (a task may be closed)

1. Code merged to the integration branch, reviewed by someone other than the author.
2. Unit tests for domain logic; feature test for every action; **query-count assertion** where a list or detail endpoint is touched (prevents N+1 regressions — see `I-32`).
3. Pint clean, PHPStan/Larastan level 6+ clean.
4. Acceptance criterion demonstrated to QA on staging.
5. No `[EXISTS]` behaviour from §1.15.1 of the rebuild plan regressed — the preserved-behaviour regression suite still passes.
6. Documentation updated where the task changes a contract, an event, or a permission.

### 4.3 Definition of Done (a **phase** may be closed — the gate)

1. Every task in the phase is Done.
2. Every `R-` item assigned to the phase is closed and verified.
3. Migration scripts for the phase run clean **twice** on a production-sized copy (proving idempotency).
4. Reconciliation report for the phase shows zero unexplained variance.
5. Permission matrix test passes for every role the phase touches.
6. Consistency jobs for the phase report zero drift.
7. Rollback for the phase is documented **and rehearsed**.
8. Tech lead and QA both sign off.

### 4.4 Branching and flags

* One long-lived `main`; short-lived feature branches per task; integration branch per phase.
* Every replaced module sits behind a feature flag (`modules.catalog.v2`, `modules.pos.v2`, …). The legacy path stays reachable until the phase gate passes.
* No flag is removed until the phase after next has started — this keeps a fast rollback available through one full phase.

---

## 5. Work breakdown

### Phase 0 — Stabilise & Prepare
**Goal:** stop the current system corrupting data before any of it is migrated, and put the engineering scaffolding in place.
**Why first:** `R-1` writes wrong variant stock and `R-2` writes zero cost on every order line, every day. Migrating that data multiplies the problem.
**Effort: ~30 dev-days. Duration: ~2 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P0-OPS01 | Repository hygiene | Remove `app.zip`, `public.zip`, `gldqpoea_radian_agrovet.sql`, `build_output.log`, `debug_variants.json`, committed `.env`; add `.gitignore` entries; rotate the seeded super-admin credential | — | DevOps | 1 | `git status` clean; no secret or archive tracked; `AdminSeeder` no longer ships `admin123` |
| P0-OPS02 | CI pipeline | GitHub Actions (or equivalent) running Pint, PHPStan level 6, PHPUnit/Pest, `migrate --pretend`, and `npm run build` | P0-OPS01 | DevOps | 3 | A pull request with a style or type error fails the pipeline |
| P0-QA01 | Regression harness + baseline suite | Feature tests covering the 20 preserved behaviours in §1.15.1 of the rebuild plan, running against the **current** code | P0-OPS02 | QA + BE | 6 | All 20 pass on the current codebase; they become the regression gate for every later phase |
| P0-BE01 | Fix `R-1` — variant stock | Add `product_variant_id` to `OrderItem::$fillable`; make POS, Service, and Checkout write it; `StockService` resolves the correct model | P0-QA01 | BE | 3 | A POS sale of a variant reduces `product_variants.stock`, and `stock_transactions.product_variant_id` is no longer NULL |
| P0-BE02 | Fix `R-2` — cost snapshot | Add `cost_price` to `OrderItem::$fillable`; verify all three write paths persist it | P0-QA01 | BE | 2 | A new order line stores a non-zero `cost_price`; the profit report no longer falls back to `products.cost_price` for new rows |
| P0-FE01 | Fix `R-6` — POS totals | `Pos/Index.tsx` computes the same formula as `PosController::store`, honours `discount_type`, includes tax; remove or validate `less_fixed` and `paid_amount` | P0-QA01 | FE + BE | 4 | On-screen total equals the stored `total_amount` for every combination of discount type and tax rate |
| P0-BE03 | Fix `R-9` — permission catalogue (tactical) | One seeder that creates every permission the code actually checks; grants are additive, not `syncPermissions`; registered in `DatabaseSeeder` | — | BE | 3 | On a fresh `migrate:fresh --seed`, a user with the `admin` role can open POS, edit a product, update an order status, and open Accounting |
| P0-DB01 | Data-quality baseline report | A script reporting: variant stock variance, count of order lines with `cost_price = 0`, duplicate parties, duplicate attribute/service-type names, orphan FKs | — | BE | 4 | Report runs against production data and produces a signed baseline document |
| P0-BE04 | Fix `R-35` — config | Move `SmsService` from runtime `env()` to `config/services.php`; add the SMS keys to `.env.example` | — | BE | 1 | `php artisan config:cache` followed by an OTP request still sends SMS |
| P0-OPS03 | Staging environment | Production-sized anonymised copy, refreshable on demand | P0-OPS02 | DevOps | 3 | The copy can be restored from scratch in under one hour |

---

### Phase 1 — Foundation / Shared Kernel
**Goal:** the module skeleton and every cross-cutting concern, so no later phase invents its own.
**Effort: ~70 dev-days. Duration: ~3 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P1-BE01 | Module skeleton | `app/Modules/<Name>` layout with `Domain`, `Application`, `Infrastructure`, `Http`, `Database`, `Tests`; a generator command; per-module `ServiceProvider` | Phase 0 gate | Lead + BE | 5 | `php artisan make:module Foo` produces a registered, testable, empty module |
| P1-BE02 | Dependency lint | A static rule failing CI when a module imports another module's Eloquent model | P1-BE01 | Lead | 2 | A deliberate cross-module import fails CI |
| P1-DB01 | Party model | `parties`, `party_roles`; `users` reduced to login only; back-compat views or adapters for the legacy code path | P1-BE01 | BE | 6 | An existing customer, an existing supplier, and an existing employee each resolve to one party with the right roles |
| P1-DB02 | Addresses | Polymorphic `addresses` replacing `user_addresses`; single-default rule preserved | P1-DB01 | BE | 3 | Setting a default address clears the previous default; existing `[EXISTS]` behaviour preserved |
| P1-BE03 | Money value object | Integer minor units or `DECIMAL(18,4)`, single configured currency (decision 4), casts, formatting helper | P1-BE01 | BE | 3 | Arithmetic over 10 000 random line totals produces no rounding drift |
| P1-BE04 | Document numbering | `document_sequences` with a locked sequence per series; `ORD-`, `POS-`, `SRV-`, `PO-` prefixes preserved — fixes `R-7` | P1-BE01 | BE | 4 | 50 concurrent number requests on one series produce 50 unique, gapless numbers |
| P1-BE05 | Audit log | `audit_logs` + a model observer + explicit logging for approvals, postings, permission changes — closes `R-30` | P1-BE01 | BE | 5 | Every create, update, and delete on an auditable model writes a row with actor, before, after, and IP |
| P1-BE06 | Soft deletes | `SoftDeletes` on all master and transactional models; hard delete restricted and audited — closes `R-29` | P1-BE05 | BE | 3 | A deleted record disappears from listings, remains in the database, and is restorable by System Admin |
| P1-BE07 | Permission registry | Per-module permission manifest; a command generating both the PHP seeder and a TypeScript union type — structurally closes `R-9` | P1-BE01 | BE | 5 | Adding a permission to a manifest regenerates both artefacts; a hand-typed permission string fails to compile in TypeScript |
| P1-BE08 | Policies and scopes | A base policy per module, query scopes for row-level filtering (own shift, assigned job, own leave) | P1-BE07 | BE | 5 | Every controller action calls `authorize()`; a test proves a scoped user sees only their own rows |
| P1-QA01 | Permission matrix test | A data-driven test asserting every role × module × action cell of §11.3 of the rebuild plan | P1-BE07 | QA | 5 | The test fails when a permission is added to a role without updating the matrix |
| P1-BE09 | Attachments + settings | Polymorphic `attachments`, scoped `settings` with a cached accessor | P1-BE01 | BE | 4 | A file attaches to any model; a setting change invalidates its cache |
| P1-BE10 | Notification channels | Database `[EXISTS]` + mail + SMS through the existing gateway; per-user preferences | P1-BE01 | BE | 4 | One notification delivers on all three channels according to preference |
| P1-OPS01 | Queue, cache, storage, logging | Redis queue and cache; named queues `default`, `accounting`, `projections`, `notifications`, `exports`; Horizon; S3-compatible storage; structured logs with a correlation ID | P1-BE01 | DevOps | 6 | Horizon shows all five queues; a request's correlation ID appears in every log line it produces |
| P1-FE01 | Frontend foundation | Module-oriented page structure, shared component library, generated permission type wired into navigation — structurally closes `I-50` | P1-BE07 | FE | 6 | The sidebar gate for every item is generated, so a route/sidebar permission mismatch cannot be written |
| P1-BE11 | Fix `R-28` — Inertia share | Cache the category tree; make cart and category props lazy/partial | P1-BE01 | BE | 3 | A JSON or OTP request no longer runs the category or cart queries |
| P1-DOC01 | Module authoring guide | How to add a module, emit an event, declare permissions, write an action | P1-BE01 | Lead | 2 | A developer new to the project scaffolds a working module from the guide alone |

---

### Phase 2 — Catalog + Inventory
**Goal:** one SKU-level stock model, ending the dual stock path that causes `R-1` structurally.
**Effort: ~75 dev-days. Duration: ~3 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P2-DB01 | SKU consolidation | Every product gets at least one SKU; `products.stock` removed; `product_variants` becomes `skus` | Phase 1 gate | BE | 8 | Every simple product has exactly one SKU carrying its stock, price, SKU code, and barcode |
| P2-BE01 | Catalog module | Product, Category, Brand, Unit, Attribute moved into the module with repositories and actions | P2-DB01 | BE | 6 | All existing catalog CRUD and delete guards preserved; regression suite green |
| P2-BE02 | Fix `R-20` — attribute update | Explicit add/update/remove semantics; a missing `values` key no longer deletes every value | P2-BE01 | BE | 2 | Updating only the attribute name leaves its values intact |
| P2-BE03 | Fix `R-21` — image management | One polymorphic image collection with explicit replace, reorder, and primary selection | P2-BE01 | BE | 4 | Replacing images removes the old files from storage; the empty `if (!$append)` branch is gone |
| P2-BE04 | Fix `R-22` — variant uniqueness | SKU and barcode uniqueness validated on update with self-ignore | P2-BE01 | BE | 1 | A duplicate SKU on update returns a field error, not a database exception |
| P2-DB02 | Locations | `locations` table with one seeded default row; `location_id` on every movement (decision 6 — no UI) | P2-DB01 | BE | 2 | Every stock movement carries a location; no location UI exists |
| P2-BE05 | Stock ledger v2 | `stock_movements` with `location_id`, `unit_cost`, proper polymorphic reference, `reversal_of_id`; row locking preserved | P2-DB02 | BE | 6 | A reversal movement references its original and restores the exact quantity |
| P2-BE06 | Stock levels projection | `stock_levels` unique on `(sku_id, location_id)`, updated in the same transaction as the movement | P2-BE05 | BE | 4 | `stock_levels` always equals the sum of movements for that SKU and location |
| P2-BE07 | Reservations | `stock_reservations` with expiry; `available = on_hand − reserved`; an expiry job every 15 minutes | P2-BE06 | BE | 5 | Two customers cannot both check out the last unit; an abandoned cart releases its hold |
| P2-BE08 | Stock counts | `stock_counts`, `stock_count_lines`; a count posts an adjustment movement | P2-BE05 | BE | 4 | A completed count reconciles `stock_levels` and writes an auditable adjustment |
| P2-BE09 | Price lists | `price_lists`, `price_list_items`; channel resolution with a base-price fallback | P2-BE01 | BE | 5 | POS and storefront resolve different prices for the same SKU when a channel list exists |
| P2-BE10 | Fix `R-14`, `R-15` — storefront scopes | A global publishable scope; price filtering on a denormalised sellable price range | P2-BE09 | BE | 4 | A deactivated product is invisible in category browsing and search; a variant-priced product appears in price-filtered results |
| P2-FE01 | Catalog UI | Product, category, brand, unit, attribute screens on the new model, with server-side pagination everywhere — part of `R-26` | P2-BE01 | FE | 8 | No catalog screen loads an unpaginated collection |
| P2-FE02 | Inventory UI | Stock history, adjustment, stock count screens; paginated, server-searched | P2-BE08 | FE | 6 | The adjust screen no longer loads every product |
| P2-DB03 | Catalog + inventory migration | Legacy → new with `legacy_id`; stock recomputed from the ledger where possible, otherwise an opening adjustment | P2-BE06 | BE | 6 | Reconciliation shows zero unexplained variance; the known variant-stock variance is documented and signed off |
| P2-QA01 | Phase QA | Regression, stock reconciliation job, concurrency test on reservations | all above | QA | 4 | Phase gate criteria met |

---

### Phase 3 — CRM + Procurement
**Goal:** customer and supplier as party roles; a real purchase-to-receipt flow.
**Effort: ~45 dev-days. Duration: ~2 sprints. Off the critical path — can run parallel to Phase 4.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P3-BE01 | CRM module | Customer as a party role; contacts; segments; customer screens | Phase 1 gate | BE | 6 | An existing customer and an existing supplier that share a phone number resolve to one party with two roles |
| P3-DB01 | Party de-duplication | Match on normalised phone then email; a merge-candidate report; a merge action that re-points documents | P3-BE01 | BE | 5 | The merge report is reviewed and applied; no document is orphaned by a merge |
| P3-BE02 | Procurement module | `purchase_orders` and lines replacing `restock_orders`, with a draft → approved state | P3-BE01 | BE | 6 | A PO cannot be received until approved; the existing "only pending can be received" guard is preserved |
| P3-BE03 | Goods receipt | `goods_receipts` and lines supporting **partial** receipt; posts stock movements | P3-BE02, P2-BE05 | BE | 6 | Receiving 5 of 10 ordered units leaves the PO partially received and adds exactly 5 to stock |
| P3-BE04 | Supplier bill | `supplier_bills` as the AP document, matched to receipts | P3-BE03 | BE | 4 | A bill can be matched to one or more receipts and shows a variance when they disagree |
| P3-BE05 | Fix `R-24` — supplier search | OR groups wrapped in a closure | P3-BE01 | BE | 0.5 | Search combined with the active filter no longer returns inactive suppliers |
| P3-FE01 | CRM + procurement UI | Customer, supplier, PO, receipt, bill screens | P3-BE04 | FE | 8 | All screens paginated and permission-gated |
| P3-DB02 | Migration | `suppliers` → party role; `restock_orders` → PO + a receipt row for each received order | P3-BE03 | BE | 5 | Counts and totals reconcile; received POs carry a receipt dated from `received_at` |
| P3-QA01 | Phase QA | Regression + merge-safety tests | all above | QA | 4 | Phase gate criteria met |

---

### Phase 4 — Sales Core
**Goal:** one order aggregate, one state machine, one pricing engine, shared by all three channels.
**Effort: ~80 dev-days. Duration: ~3–4 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P4-DB01 | Order schema v2 | One `status` column (closes `R-3`); `channel` replacing `type` + `source`; one `sku_id` on lines (closes `R-1` structurally); `unit_cost` snapshot (closes `R-2`); retire `billing_address`, `shipping_amount`, `bonus_quantity`, `price_type` | Phase 2 gate | BE | 6 | The duplicate column pairs no longer exist; the regression suite is green |
| P4-BE01 | Order state machine | Declared transition matrix, guards, mandatory reason on cancel; `order_status_history` — closes `R-4` | P4-DB01 | BE | 6 | An undeclared transition is rejected; every transition writes a history row with actor and reason |
| P4-BE02 | Reversible stock effects | Cancel reverses the issue; un-cancel re-issues; both as referenced, reversible documents — closes `R-5` | P4-BE01, P2-BE05 | BE | 5 | A cancel → re-open → cancel cycle leaves stock exactly where it started |
| P4-BE03 | Pricing engine | One engine: line and document discount, `TaxCalculator` seam with a manual-rate strategy (decision 14), discount capped at subtotal (closes `R-23`) | P4-DB01 | BE | 7 | A discount larger than the subtotal is rejected; the same input produces the same total on server and client |
| P4-BE04 | Tender model | `tenders` supporting split payment; payment status derived from tenders, never set manually | P4-BE03 | BE | 6 | A sale paid half cash and half card produces two tender rows and a `PAID` status |
| P4-BE05 | Returns and refunds | `returns`, `return_lines`, `refunds` against the original tender | P4-BE04, P4-BE02 | BE | 8 | A partial return restocks only the returned quantity and refunds only its value |
| P4-BE06 | Invoice documents | Order and service invoice templates as PDF downloads; service invoice becomes a download, closing `I-59` | P4-BE01 | BE | 4 | Both invoice types download as PDF with identical branding |
| P4-BE07 | Sales events | `OrderPlaced`, `OrderConfirmed`, `OrderShipped`, `OrderDelivered`, `OrderCancelled`, `InvoiceIssued`, `PaymentReceived`, `ReturnAccepted`, `RefundIssued`, dispatched `afterCommit` | P4-BE05 | BE | 5 | Every event carries the source document identity and fires exactly once per transition |
| P4-BE08 | Fix `R-25` — cart abstraction | One cart service with a guest cart token; the dead session branch removed; merge-on-login preserved | P4-DB01 | BE | 5 | A guest builds a cart, logs in, and keeps every line and quantity |
| P4-FE01 | Order management UI | List with filters, detail with the state machine, status history timeline, return and refund screens | P4-BE05 | FE | 10 | Only legal transitions are offered; the timeline shows who changed what and why |
| P4-QA01 | State machine test suite | Every cell of the transition matrix, with the stock effect asserted for each | P4-BE02 | QA | 6 | The full matrix is covered; no transition changes stock unexpectedly |
| P4-DB02 | Order migration | Legacy orders → new schema; status mapped; `unit_cost` backfilled from `products.cost_price` and **flagged as an estimate** | P4-BE01 | BE | 7 | Counts and money totals reconcile to the cent; every backfilled cost is flagged |
| P4-QA02 | Phase QA | Regression, totals consistency job, concurrent numbering test | all above | QA | 5 | Phase gate criteria met |

---

### Phase 5 — Accounting
**Goal:** a real double-entry ledger, posting automatically from the events emitted in Phases 2–4.
**Basis: accrual / margin (decision 3).**
**Effort: ~85 dev-days. Duration: ~4 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P5-BIZ01 | Chart of accounts sign-off | Finance approves the §6.2 chart and the mapping of every existing `expense_categories` row onto an account | — | BA + Finance | 3 | Signed mapping document; every existing category has a target account |
| P5-BE01 | Accounting module core | `account_types`, `accounts` (self-referencing), `fiscal_years`, `fiscal_periods` with open/close | Phase 1 gate, P5-BIZ01 | BE | 7 | Posting into a closed period is rejected |
| P5-BE02 | Journal engine | `journals`, `journal_lines`; balanced-entry invariant; immutability after posting; reversal-only correction — rules A-1, A-2, A-8 | P5-BE01 | BE | 8 | An unbalanced entry cannot be saved; a posted entry cannot be edited, only reversed |
| P5-BE03 | Idempotent posting | Unique `(source_type, source_id, rule_key)`; queued, retried listeners — rules A-3, A-7 | P5-BE02, P4-BE07 | BE | 6 | Replaying the entire event stream produces zero duplicate journal lines |
| P5-BE04 | Sales posting rules | AR, revenue (goods and service separately), output tax, discount contra — §6.3 | P5-BE03 | BE | 7 | Every sale type produces the exact entry specified in §6.3 |
| P5-BE05 | Inventory posting rules | COGS on stock issue; inventory on receipt; valuation — the accrual half of decision 3 | P5-BE03, P2-BE05 | BE | 7 | Ledger account 1200 equals `Σ (stock_levels × unit cost)` at any point in time |
| P5-BE06 | Payment, AP, bank | Payment posting both directions; `bank_accounts`; reconciliation screen; over-payment guard preserved | P5-BE04 | BE | 8 | Recording a payment moves both the cash account and the AR/AP control account |
| P5-BE07 | Returns and refunds posting | Contra-revenue, inventory restore, refund against tender | P5-BE05, P4-BE05 | BE | 4 | A return reverses exactly the revenue and COGS of the returned lines |
| P5-BE08 | Ledger balances | `ledger_balances` materialised per account per period | P5-BE02 | BE | 4 | Materialised balances equal the sum of journal lines for every period |
| P5-BE09 | Financial statements | Trial balance, income statement (accrual), balance sheet, cash flow, account statement — decision 3 applied: **the income statement is the sole profit authority; cashbook and cash flow are cash views, never labelled profit** | P5-BE08 | BE | 8 | Trial balance nets to zero; the income statement reconciles to the ledger |
| P5-BE10 | AR / AP ageing | Ageing buckets 0-30 / 31-60 / 61-90 / 90+ replacing the flat dues lists | P5-BE06 | BE | 4 | Ageing totals equal the AR and AP control account balances |
| P5-BE11 | Fix `R-10` — permissions | Per-action accounting permissions; posting and period close split from entry | P5-BE02, P1-BE07 | BE | 3 | A user with accounting view can no longer delete an expense |
| P5-FE01 | Accounting UI | CoA, journal, ledger, statements, bank reconciliation, ageing, expenses, payments | P5-BE09 | FE | 12 | Every screen permission-gated per action |
| P5-BIZ02 | Opening balances | Finance supplies signed cash and bank balances as of the cutover date (decision 9) | P5-BIZ01 | BA + Finance | 2 | Signed worksheet received |
| P5-DB01 | Accounting migration | Expenses and payments → journal entries; the opening journal; historical documents posted at their original dates | P5-BIZ02, P5-BE09 | BE | 7 | Trial balance after migration nets to zero; totals match the legacy sums to the cent |
| P5-QA01 | Posting rule test suite | One integration test per rule in §6.3, plus a full event-replay idempotency test | P5-BE07 | QA | 8 | Every rule covered; replay produces no duplicates |

---

### Phase 6 — POS
**Goal:** a real point of sale with shifts, cash control, receipts, and returns.
**Effort: ~65 dev-days. Duration: ~3 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P6-BE01 | Terminal and shift | `pos_terminals`, `pos_shifts` with open, close, counted cash, variance | Phase 5 gate | BE | 6 | A shift cannot be opened twice on one terminal; closing computes variance correctly |
| P6-BE02 | Cash movements | `pos_cash_movements` for pay-in and payout; variance posts to account 6900 | P6-BE01, P5-BE06 | BE | 4 | A cash-over shift posts to 6900 and appears in the cashbook |
| P6-BE03 | Hold / resume | `pos_held_sales` scoped to terminal and operator | P6-BE01 | BE | 4 | A held sale resumes with every line, discount, and customer intact |
| P6-BE04 | POS sale action | Uses the shared pricing engine and tender model; fixes `R-8` by capturing payment at the sale | P4-BE04 | BE | 5 | A cash POS sale is created `PAID` with `paid_amount` set, and does **not** appear in Customer Dues |
| P6-BE05 | POS returns | Return against an original sale, refunded to the original tender | P4-BE05 | BE | 5 | A POS return restocks and refunds, and both post to the ledger |
| P6-BE06 | Server-side product search | Debounced search endpoint with barcode and SKU fallthrough — fixes `R-26` for POS (decision 8: no offline index) | P2-BE01 | BE | 4 | The POS page loads in under 2 seconds with 10 000 products; no full catalog is shipped to the browser |
| P6-FE01 | POS terminal rebuild | Search, cart, customer, split tender, discount, tax, hold/resume, return | P6-BE05 | FE | 12 | On-screen total equals the stored total in every case; `R-6` cannot recur |
| P6-FE02 | Receipt printing | 80 mm template, browser print, ESC/POS output (decision 7) | P6-FE01 | FE | 6 | A completed sale prints a receipt on an 80 mm printer with correct totals and tender breakdown |
| P6-FE03 | Shift screens | Open, X-report, close with counted-cash entry, Z-report | P6-BE02 | FE | 6 | X-report is repeatable and read-only; Z-report is immutable once generated |
| P6-DB01 | POS migration | Historical POS orders assigned to a synthetic migrated shift per day | P6-BE01, P4-DB02 | BE | 3 | Every historical POS order belongs to exactly one migrated shift |
| P6-QA01 | Phase QA | Full shift cycle: open → sale → return → pay-in → close → Z, with ledger assertions | all above | QA | 6 | Every step posts correctly; variance reconciles |

---

### Phase 7 — E-commerce
**Goal:** the storefront on the new core, with registration, coupons, campaigns, and returns.
**Effort: ~85 dev-days. Duration: ~4 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P7-BE01 | Storefront queries | Catalog browsing on the new model with the publishable scope and denormalised price range | Phase 2 gate | BE | 5 | `R-14` and `R-15` verified closed on category, brand, and search pages |
| P7-BE02 | Fix `R-27` — wishlist batching | Single batched wishlist lookup per listing | P7-BE01 | BE | 2 | A 24-product page runs a constant number of queries regardless of page size |
| P7-BE03 | Registration (decision 1) | `POST /register`, a `RegisterAction`, the 10-character password policy, a working `useAuth().register`; OTP and password paths create the same customer party — closes `R-34` | Phase 1 gate | BE + FE | 5 | A new customer registers by email and password and lands authenticated; the same phone via OTP resolves to the same party |
| P7-BE04 | Checkout v2 | Discount, manual tax, and shipping applied at checkout (today `total = subtotal`); reservation committed on order | P4-BE03, P2-BE07 | BE | 7 | Checkout total equals the stored `total_amount` including tax and shipping |
| P7-BE05 | Shipping | Shipping zones, methods, rates; `shipments` with tracking | P7-BE04 | BE | 8 | A shipping method is selectable at checkout and its cost appears in the order and the ledger |
| P7-BE06 | Discounts and coupons | Discount rule engine; `coupons` with validity window, usage limits, minimum spend, per-customer limit | P4-BE03 | BE | 8 | An expired or over-used coupon is rejected with a clear message |
| P7-BE07 | Campaigns | A real campaign entity with a schedule and a compare-at price, replacing the synthetic `price × 1.15` `old_price` | P2-BE09 | BE | 5 | Flash-sale pricing comes from a scheduled campaign; the fabricated old price is gone |
| P7-BE08 | RMA | Customer-initiated return request → approval → receipt → restock → refund | P4-BE05 | BE | 6 | A customer requests a return and the approved flow restocks and refunds |
| P7-BE09 | Payment gateway seam (decision 13) | `PaymentGateway` contract with a COD/offline driver only; no live provider | P4-BE04 | BE | 4 | Checkout records a COD tender through the contract; adding a provider later requires no checkout change |
| P7-FE01 | Storefront rebuild | Home, category, brand, search with facets, product detail, cart, checkout, account | P7-BE05 | FE | 16 | Every existing storefront behaviour preserved; responsive at phone width |
| P7-FE02 | Account area | Profile, password, addresses, orders (paginated — fixes part of `R-26`), invoices, returns | P7-BE08 | FE | 8 | `/my-account` no longer loads every order |
| P7-FE03 | Dead-link cleanup | Remove or implement `/help`; wire `NotFound.tsx`; remove `RoleAssignment.tsx`; fill `/profile` and `/settings` | Phase 1 gate | FE | 3 | No dead link or orphan page remains |
| P7-QA01 | Phase QA | Checkout ledger reconciliation, overselling test under concurrency, coupon abuse tests | all above | QA | 8 | No oversell is possible; checkout totals reconcile to the ledger |

---

### Phase 8 — Service Sale
**Goal:** a real service job lifecycle with quotations, typed serviced assets, and warranty.
**Domain: general retail + repair with a typed asset register (decision 5).**
**Effort: ~55 dev-days. Duration: ~3 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P8-BE01 | Service module core | `service_categories`, `service_types` with the missing unique index, service job aggregate | Phase 4 gate | BE | 5 | The existing auto-fill of `service_charge` from the selected type is preserved |
| P8-BE02 | Typed asset register (decision 5) | `asset_types`, `asset_type_attributes`, `serviced_assets` + values; seeded with a **Device** type (serial, model, brand, purchase date) and a **Vehicle** type (registration, chassis, engine number, odometer) | P8-BE01, P3-BE01 | BE | 6 | A new asset type can be added as data; both seeded types render their own fields with no code change |
| P8-BE03 | Job lifecycle | `RECEIVED → IN_PROGRESS → COMPLETED → DELIVERED → CLOSED`, plus `AWAITING_PARTS` and `AWAITING_APPROVAL`; `service_job_status_history`; an **express path** preserving today's one-step counter behaviour | P8-BE01, P4-BE01 | BE | 7 | The express path still creates a completed invoice in one action; the full path enforces its transitions |
| P8-BE04 | Parts and labour | Part issue posts a stock movement referencing the job; labour lines logged separately; revenue split between goods and service accounts | P8-BE03, P5-BE04 | BE | 6 | The ledger shows service revenue and goods revenue on separate accounts for one job |
| P8-BE05 | Quotation | `quotations` and lines; approval converts a quotation to a job | P8-BE03 | BE | 5 | An approved quotation creates a job with identical lines |
| P8-BE06 | Technician assignment | Technician drawn from HRM employees rather than the `admin|super-admin|sales` roles used today | P8-BE03, Phase 9 employee model | BE | 3 | Only employees flagged as technicians are assignable |
| P8-BE07 | Warranty | `warranties` from a job; `warranty_claims` creating a linked job | P8-BE03 | BE | 5 | A claim inside the warranty window creates a linked job at zero charge |
| P8-FE01 | Service UI | Job board, job detail, dynamic asset form, quotation, parts picker, warranty, invoice | P8-BE07 | FE | 12 | The asset form renders from the asset type definition with no hard-coded fields |
| P8-DB01 | Service migration | Legacy service orders → jobs at status `CLOSED`; `service_type` free text matched by name, unmatched values creating a type; assets not backfilled (no source data) | P8-BE03, P4-DB02 | BE | 4 | Every legacy service order becomes a closed job with its technician and parts |
| P8-QA01 | Phase QA | Both paths, warranty window boundaries, ledger revenue split | all above | QA | 5 | Phase gate criteria met |

---

### Phase 9 — HRM
**Goal:** departments, designations, shifts, holidays, leave entitlement, and immutable payroll that posts to the ledger.
**Off the critical path — may start any time after Phase 1.**
**Effort: ~70 dev-days. Duration: ~3–4 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P9-BIZ01 | HR data inputs | Department and designation per employee; leave entitlement per type; holiday calendar and weekend definition (decisions 10, 11, 12) | — | BA + HR | 3 | All three sheets received and signed |
| P9-BE01 | Employee module | `employees` separated from the login `User`; the missing unique index added; role-escalation guards preserved | Phase 1 gate | BE | 6 | An employee can exist without a login; existing guards still block escalation |
| P9-BE02 | Department and designation (decision 10) | `departments`, `designations` implemented; role stops doubling as designation | P9-BE01 | BE | 4 | Employee and user listings show a real designation, not the first role name |
| P9-BE03 | Fix `R-19` — status change | `is_active` validated and audited; an absent field no longer deactivates | P9-BE01 | BE | 1 | Editing an employee without sending `is_active` leaves their status unchanged |
| P9-BE04 | Shifts and holidays (decision 12) | `shifts`, `employee_shifts`, `holidays`, weekend configuration | P9-BIZ01, P9-BE01 | BE | 6 | Expected working days for a month are computed from shift + weekend + holidays |
| P9-BE05 | Attendance v2 | Enum-backed status (closes `R-17`); `shift_id`; future-date block and daily uniqueness preserved | P9-BE04 | BE | 5 | An invalid status is rejected; the existing grid behaviour is preserved |
| P9-BE06 | Attendance and late apply | `attendance_requests` for missed punch and late regularisation, with approval | P9-BE05 | BE | 5 | An approved request corrects the attendance record and is audited |
| P9-BE07 | Leave entitlement (decision 11) | `leave_types`, `leave_balances`, accrual, carry-forward; the existing overlap guard preserved | P9-BIZ01, P9-BE05 | BE | 7 | A request exceeding the balance is rejected; approval deducts the balance |
| P9-BE08 | Fix `R-18` — leave to attendance | Approved leave writes `on-leave` attendance rows for the period | P9-BE07 | BE | 3 | Approved leave days appear in the grid and are excluded from absence deduction |
| P9-BE09 | Salary structure | `salary_structures`, `salary_components` (allowances, deductions, overtime); bonus configurable, replacing the hard-coded `0` | P9-BE01 | BE | 6 | A structure with two allowances and one deduction computes correctly |
| P9-BE10 | Payroll v2 | Immutable `payroll_runs` (closes `R-16`); **working-day** basis from shift and holidays (decision 12); period lock; approval | P9-BE09, P9-BE08 | BE | 8 | An approved run cannot be regenerated; the deduction uses working days, not calendar days |
| P9-BE11 | Payroll posting | `PayrollApproved` → salary expense and payable; disbursement → cash payment | P9-BE10, P5-BE03 | BE | 4 | An approved run posts a balanced journal entry |
| P9-FE01 | HRM UI | Employee, department, designation, shift, holiday, attendance grid, apply screens, leave, payroll, payslip | P9-BE11 | FE | 12 | Attendance grid behaviour preserved; payroll screens paginated |
| P9-DB01 | HRM migration | `employee_profiles` → employees; attendance status mapped; `salaries` → locked historical runs; entitlement and calendar loaded from the HR sheets | P9-BIZ01, P9-BE10 | BE | 5 | Historical runs import unchanged and locked; unmapped employees land in `Unassigned` |
| P9-QA01 | Phase QA | Working-day payroll verification against a finance-approved worked example | all above | QA | 5 | The new figure matches the approved example for three sample employees |

---

### Phase 10 — Reporting
**Goal:** one reporting engine over read models, with the full catalogue of §8.2.
**Effort: ~65 dev-days. Duration: ~3 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P10-BE01 | Read model infrastructure | Projector base class, rebuild command, drift detection | Phase 5 gate | BE | 6 | Any read model can be rebuilt from scratch and matches the source |
| P10-BE02 | Sales read models | `rm_orders`, `rm_order_lines` projected from sales events | P10-BE01, P4-BE07 | BE | 6 | Projections match transactional totals exactly |
| P10-BE03 | Inventory, CRM, service, POS read models | `rm_stock_levels`, `rm_stock_valuation`, `rm_customers`, `rm_service_jobs`, `rm_pos_shifts` | P10-BE01 | BE | 8 | Each projection rebuilds clean and matches its source |
| P10-BE04 | Report registry | Definition contract of §8.3: key, permission, filters, columns, aggregations, detail route, exports, source | P10-BE02 | BE | 7 | A new report is added by registering a definition, with no new controller |
| P10-BE05 | Report catalogue | All 34 reports of §8.2, each with summary and detail | P10-BE04, P10-BE03 | BE | 16 | Every report returns correct figures over a known dataset |
| P10-BE06 | Fix `R-13`, `R-12` | One document-date convention across every report; cancelled documents excluded by default with an explicit toggle | P10-BE05 | BE | 3 | Two reports over the same range and filters never disagree |
| P10-BE07 | Export pipeline | CSV, Excel, PDF from one pipeline; large exports queued and delivered as a link | P10-BE04 | BE | 6 | A 100 000-row export completes without a timeout |
| P10-BE08 | Scheduling and saved views | `report_schedules`, `saved_views` | P10-BE07 | BE | 5 | A scheduled report is delivered on time to the configured recipients |
| P10-FE01 | Reporting UI | One report shell rendering any definition: filters, summary tiles, table, drill-down, export | P10-BE04 | FE | 10 | Adding a backend report definition makes it appear in the UI with no frontend change |
| P10-QA01 | Phase QA | Figure-by-figure verification of every report against a seeded dataset | all above | QA | 8 | Every report verified; drift job clean |

---

### Phase 11 — Analytics
**Goal:** fact tables, KPIs, and a management dashboard.
**Effort: ~40 dev-days. Duration: ~2 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P11-BE01 | Fact tables | `fact_daily_sales`, `fact_daily_inventory`, `fact_daily_finance`, `fact_daily_hr` | Phase 10 gate | BE | 6 | Each fact table is defined with its dimensions and measures |
| P11-BE02 | Aggregators | Idempotent, re-runnable for any date range; targeted re-aggregation on late corrections | P11-BE01 | BE | 7 | Re-running a date range twice produces identical rows |
| P11-BE03 | KPI definitions | The 14 KPIs of §9.2, each computed from fact tables only | P11-BE02 | BE | 6 | Each KPI matches a hand-calculated figure over a known dataset |
| P11-BE04 | Trend and cohort analysis | Sales trend, ABC analysis, RFM, cohorts, inventory turnover, POS performance, HR indicators | P11-BE03 | BE | 8 | Each analysis returns correct figures over the seeded dataset |
| P11-FE01 | Management dashboard | KPI tiles, trend charts, drill-down into the matching report | P11-BE04 | FE | 8 | The dashboard loads within the agreed budget on production-sized data |
| P11-QA01 | Phase QA | Aggregator idempotency, KPI verification, late-correction handling | all above | QA | 5 | Phase gate criteria met |

---

### Phase 12 — Integration, Optimisation & Hardening
**Effort: ~45 dev-days. Duration: ~2 sprints.**

| ID | Task | Deliverable | Depends on | Role | Days | Acceptance |
|---|---|---|---|---|---|---|
| P12-QA01 | End-to-end suite | Playwright on the critical paths: checkout, POS shift cycle, service job, payroll run, month-end close | Phase 11 gate | QA | 8 | All critical paths green in CI |
| P12-QA02 | Full permission matrix | Every role × module × action cell re-verified on the finished system | P1-QA01 | QA | 5 | Zero unexpected grants or denials |
| P12-OPS01 | Load testing | POS checkout, storefront browsing, reporting under production-sized data | — | DevOps + BE | 5 | Agreed response-time budgets met |
| P12-BE01 | Index and query tuning | Slow-query review against §13.11; missing indexes added | P12-OPS01 | BE | 5 | No query over the agreed threshold remains in the critical paths |
| P12-BE02 | Consistency job suite | All seven jobs of §14.6 scheduled and alerting | Phase 5 gate | BE | 5 | Each job runs nightly and reports zero drift |
| P12-OPS02 | Security review | CORS restricted to `api/*` with an explicit allow-list; rate limits on writes and exports; `APP_DEBUG=false` verified outside local; sensitive-field encryption verified | — | DevOps + Lead | 5 | Review checklist signed |
| P12-OPS03 | Deployment pipeline | Blue/green or rolling deploy; expand → backfill → contract migrations; Horizon supervised; backups with a **rehearsed restore** | — | DevOps | 6 | A restore from backup is demonstrated end to end |
| P12-DOC01 | Documentation and training | Operations runbook, module guide, user guides per module, training sessions | — | Lead + BA | 4 | Each module has an owner trained on it |
| P12-OPS04 | Flag removal | Legacy code paths and feature flags removed | all phases | Lead | 2 | No legacy module remains in the codebase |

---

## 6. Milestones and gates

| Milestone | Reached when | Business-visible outcome |
|---|---|---|
| **M0 — Bleeding stopped** | Phase 0 gate | Variant stock and order-line cost are recorded correctly from this day forward; a freshly seeded `admin` can actually use the system |
| **M1 — Platform ready** | Phase 1 gate | Audit log live, soft deletes live, permissions generated, queues and storage production-grade |
| **M2 — One stock truth** | Phase 2 gate | Stock is correct at SKU level and reconciles nightly; overselling is prevented |
| **M3 — Sales core live** | Phase 4 gate | One order model, guarded transitions, full history, returns and refunds possible |
| **M4 — Books are real** | Phase 5 gate | Double-entry ledger live; trial balance nets to zero; the income statement is the single profit authority |
| **M5 — Counter modernised** | Phase 6 gate | Shifts, cash control, receipts, and POS returns in daily use |
| **M6 — Storefront modernised** | Phase 7 gate | Registration, coupons, campaigns, shipping, and RMA live |
| **M7 — Service modernised** | Phase 8 gate | Job lifecycle, quotations, typed assets, and warranty live |
| **M8 — HR modernised** | Phase 9 gate | Departments, shifts, holidays, leave balances, and immutable payroll posting to the ledger |
| **M9 — One reporting truth** | Phase 10 gate | 34 reports, one date convention, no contradictory figures |
| **M10 — Management visibility** | Phase 11 gate | KPI dashboard on fact tables |
| **M11 — Rebuild complete** | Phase 12 gate | Legacy code removed; load, security, and restore all verified |

---

## 7. Timeline

Weekly capacity ~24 developer-days. Phases 3 and 9 run off the critical path.

```
Week   1   3   5   7   9  11  13  15  17  19  21  23  25  27  29  31  33
       │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
P0  ███████                                                              Stabilise
P1      ████████████                                                     Foundation
P2              ████████████                                             Catalog+Inventory
P3                      ████████                                         CRM+Procurement  (parallel)
P4                      ██████████████                                   Sales Core
P5                                  ████████████████                     Accounting
P6                                              ████████████             POS
P7                                                  ████████████████     E-commerce
P8                                                      ████████████     Service
P9              ████████████████                                         HRM  (parallel, off critical path)
P10                                                         ████████████ Reporting
P11                                                                 ████ Analytics
P12                                                                   ██ Hardening
```

**Critical path:** P0 → P1 → P2 → P4 → P5 → P6 → P10 → P12.
**Sprint count:** ~17 two-week sprints.
**Buffer:** the plan above contains no schedule buffer. Add 15 % (≈5 weeks) before committing a date externally.

---

## 8. QA plan

| Level | Scope | When |
|---|---|---|
| Unit | Domain logic, pricing engine, payroll calculation, state machines | Every task |
| Feature | One test per action; happy path plus each guard | Every task |
| Integration | Accounting posting rules (one per rule in §6.3), stock movement paths, event replay idempotency | Phases 2, 4, 5 |
| Regression | The 20 preserved behaviours of §1.15.1, built in `P0-QA01` | Every phase gate |
| Permission matrix | Every role × module × action cell | Phase 1, re-run at every gate, full re-verify in Phase 12 |
| Migration reconciliation | Row counts, money totals, referential integrity, 20-record spot checks per entity | Every phase with a migration |
| Performance | Query-count assertions per endpoint; load tests on POS, storefront, reporting | Every task; formally in Phase 12 |
| End-to-end | Checkout, POS shift cycle, service job, payroll run, month-end close | Phase 12 |

**Negative and boundary scenarios** are already enumerated in §14.3 and §14.9 of the system analysis; QA should lift them directly into the test plan rather than re-deriving them.

---

## 9. Business input checklist

Each input blocks a **cutover**, not development. The "needed by" column is the start of the phase's migration task, not the start of the phase.

| # | Input | Owner | Needed by | Blocks | Status |
|---|---|---|---|---|---|
| 1 | Chart of accounts sign-off + expense-category mapping | Finance | Phase 5, task `P5-BE01` | All accounting posting | ☐ |
| 2 | Opening cash and bank balances as of cutover (decision 9) | Finance | Phase 5, task `P5-DB01` | Opening journal | ☐ |
| 3 | Acknowledgement that the new income statement will not match the old cash P&L (decision 3) | Finance | Phase 5 gate | Sign-off on M4 | ☐ |
| 4 | Department and designation per employee (decision 10) | HR | Phase 9, task `P9-DB01` | HRM migration | ☐ |
| 5 | Leave entitlement per type + opening balances (decision 11) | HR | Phase 9, task `P9-DB01` | Leave balances | ☐ |
| 6 | Holiday calendar + weekend definition (decision 12) | HR | Phase 9, task `P9-BE04` | Working-day payroll | ☐ |
| 7 | Sign-off that payroll deductions change under the working-day basis (decision 12) | Finance + HR | Phase 9 gate | Sign-off on M8 | ☐ |
| 8 | Receipt printer model and paper width confirmation (decision 7) | Operations | Phase 6, task `P6-FE02` | Receipt output format | ☐ |
| 9 | Party merge review — approve or reject each merge candidate | Operations | Phase 3, task `P3-DB01` | Customer migration | ☐ |
| 10 | Attendance status mapping for any free-text value not in the new enum | HR | Phase 9, task `P9-DB01` | Attendance migration | ☐ |

---

## 10. Risk register

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| RK-1 | Historical margin is unrecoverable — every existing `order_items.cost_price` is `0` (`R-2`) | Certain | Medium | Backfill from `products.cost_price`, flag every backfilled row as an estimate, and state the limitation in every historical margin report | Tech lead |
| RK-2 | Variant stock in the current data is wrong (`R-1`), so migrated opening stock is wrong | Certain | High | Phase 0 fixes it forward; Phase 2 recomputes from the ledger where possible; a signed variance list covers the rest; a physical stock count before cutover is strongly recommended | Tech lead + Operations |
| RK-3 | Old and new profit figures disagree, and the business distrusts the new system | High | High | Decision 3 recorded with reasoning; a reconciliation document explaining the difference; finance sign-off is a Phase 5 gate item | BA + Finance |
| RK-4 | Payroll deduction changes under the working-day basis and employees query their pay | High | High | Run both bases in parallel for one month; obtain finance and HR sign-off on a worked example before cutover (`P9-QA01`) | BA + HR |
| RK-5 | Business inputs in §9 arrive late | Medium | High | Each is on the checklist with an owner and a needed-by task; a missing input delays only that cutover, and development continues behind the flag | PM |
| RK-6 | Scope creep from `[NEW]` items | High | Medium | Every `[NEW]` item is tagged in the rebuild plan; anything not in a task row here is out of scope for this programme | PM + Tech lead |
| RK-7 | Party de-duplication merges two genuinely different people | Medium | High | Merges are reviewed and approved individually (§9 item 9), reversible for 30 days, and fully audited | BA |
| RK-8 | Accounting listeners double-post on an event replay | Medium | High | Idempotency key `(source_type, source_id, rule_key)` plus a dedicated replay test (`P5-QA01`) | BE |
| RK-9 | Key-person dependency on the tech lead | Medium | High | Module authoring guide (`P1-DOC01`); two reviewers on every architectural change | PM |
| RK-10 | Staging is not production-sized, so migration rehearsals mislead | Medium | High | `P0-OPS03` makes a production-sized anonymised copy a Phase 0 deliverable | DevOps |
| RK-11 | The legacy system keeps generating data during a long rebuild, widening the migration delta | Certain | Medium | Per-phase migration with idempotent, re-runnable scripts and a rehearsed delta run (§17.5 of the rebuild plan) | Tech lead |
| RK-12 | Timeline pressure leads to skipping phase gates | Medium | High | Gates are defined in §4.3 and require two signatures; no phase starts until the previous gate passes | PM |

---

## 11. Cutover runbook outline

Per phase, not once at the end.

```
T-14 days   Freeze the phase scope. Confirm all §9 inputs for this phase have arrived.
T-7  days   Full migration rehearsal on the production-sized copy. Reconciliation report produced.
T-5  days   Rollback rehearsal. Restore verified.
T-2  days   Delta run rehearsal. Timing recorded.
T-1  day    Go / no-go meeting. Gate criteria (§4.3) reviewed and signed.
T-0         Cutover window:
              1. Maintenance mode (or read-only) on the affected module only
              2. Delta migration
              3. Reconciliation script — abort if any unexplained variance
              4. Flip the feature flag
              5. Smoke test (scripted, 15 minutes)
              6. Release maintenance mode
T+1  day    Monitored operation. Consistency jobs reviewed each morning.
T+7  days   Phase retrospective. Flag retained until the phase after next begins.
```

**Abort criteria at any step:** unexplained reconciliation variance, a failed smoke test, or a consistency job reporting drift. Abort means flip the flag back, not fix forward.

---

## 12. Effort summary

| Phase | Name | Dev-days | On critical path |
|---|---|---|---|
| 0 | Stabilise & Prepare | 30 | Yes |
| 1 | Foundation / Shared Kernel | 70 | Yes |
| 2 | Catalog + Inventory | 75 | Yes |
| 3 | CRM + Procurement | 45 | No |
| 4 | Sales Core | 80 | Yes |
| 5 | Accounting | 85 | Yes |
| 6 | POS | 65 | Yes |
| 7 | E-commerce | 85 | No |
| 8 | Service Sale | 55 | No |
| 9 | HRM | 70 | No |
| 10 | Reporting | 65 | Yes |
| 11 | Analytics | 40 | Yes |
| 12 | Integration & Hardening | 45 | Yes |
| | **Total** | **~810** | |

| Measure | Value |
|---|---|
| Total effort | ~810 developer-days |
| Weekly capacity | ~24 developer-days |
| Elapsed duration | ~34 weeks (~8 months) with the parallelisation in §7 |
| Sprints | ~17 (two-week) |
| Recommended buffer | +15 % (~5 weeks) before committing an external date |

---

## 13. Tracking

**Board columns:** Backlog → Ready (DoR met) → In Progress → In Review → In QA → Done (DoD met) → Released (flag on).

**Per-task fields to carry into the tracker:** task ID, phase, stream, deliverable, dependencies, role, estimate, acceptance criterion, linked `R-` items.

**Weekly reporting:** developer-days burned vs. estimated per phase; gate criteria status; §9 checklist status; open risks from §10.

**Non-negotiables** — escalate rather than silently skip:
1. A phase gate (§4.3) is never partially passed.
2. A migration script is never run in production without two clean rehearsal runs.
3. A `[NEW]` item not present in a task row above is out of scope for this programme.
4. The regression suite from `P0-QA01` never goes red.

---

*End of work plan.*

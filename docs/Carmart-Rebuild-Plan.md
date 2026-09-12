# Carmart Rebuild Plan
### From the current Laravel/Inertia application to a modular, scalable business management platform
### E-commerce · POS · Service Sale · Accounting · HRM · Reports · Analytics

> **Basis of this document.** Section 1 is derived entirely from the actual source code in `D:\Test\carMart` (branch `dev-a`), and cross-references the companion audit [Carmart-Full-System-Analysis.md](Carmart-Full-System-Analysis.md). Sections 2–18 are the rebuild proposal.
>
> **Audience.** Solution architects, backend and frontend developers, QA leads, and the project manager owning the rebuild.

---

## Legend — how to read every table in this document

| Tag | Meaning |
|---|---|
| **`[EXISTS]`** | Implemented in the current codebase today. Preserve the behaviour. |
| **`[IMPROVE]`** | Implemented today, but the current implementation has a defect, a design flaw, or a scalability limit. Rebuild with changes. |
| **`[NEW]`** | **Recommended / Future Improvement.** Not present in the current codebase. Proposed as an industry-standard requirement, not as existing functionality. |
| **`[VERIFY]`** | **Not Found / Requires Verification.** Cannot be determined from the codebase; a business decision or a document outside the repository is required. |

Nothing tagged `[EXISTS]` or `[IMPROVE]` has been assumed — each maps to a specific file in the repository.

---

# PART A — EXISTING SYSTEM ANALYSIS

## 1. Existing System Analysis

### 1.1 Existing technology stack

| Layer | Current |
|---|---|
| Backend | Laravel 12, PHP ^8.2 |
| SPA bridge | Inertia.js 2 (`inertiajs/inertia-laravel`, `@inertiajs/react`) |
| Frontend | React 18 + TypeScript, Tailwind CSS 3, Radix UI (shadcn-style), Recharts, react-hook-form + zod, TanStack Query, Ziggy |
| Database | MySQL (raw SQL uses MySQL-only `IF()`) |
| RBAC | `spatie/laravel-permission` ^6.21 |
| Auth | Session (web) + `laravel/sanctum` ^4 (installed, no token-issuing route) |
| PDF | `barryvdh/laravel-dompdf` ^3.1 |
| Queue / Cache / Session | database driver for all three |
| Build | Vite 7 + `laravel-vite-plugin` |

### 1.2 Existing modules

| # | Module | Controllers | Status |
|---|---|---|---|
| 1 | Storefront (public shop) | `Web\ShopController` | `[EXISTS]` |
| 2 | Authentication + phone OTP | `Web\AuthController` | `[EXISTS]` |
| 3 | Customer account | `Web\AccountController` | `[EXISTS]` |
| 4 | Cart & Checkout | `CartController`, `Web\CheckoutController` | `[EXISTS]` |
| 5 | Wishlist | `WishlistController` | `[EXISTS]` |
| 6 | Product / Variant / Attribute / Unit | `Web\ProductController`, `AttributeController`, `UnitController` | `[EXISTS]` |
| 7 | Brand | `Web\BrandController` | `[EXISTS]` |
| 8 | Category (self-referencing tree) | `Web\CategoryController` | `[EXISTS]` |
| 9 | POS | `Web\PosController` | `[EXISTS]` |
| 10 | Service Invoice + Service Types | `Web\ServiceInvoiceController`, `ServiceTypeController` | `[EXISTS]` |
| 11 | Order management | `Web\OrderController` | `[EXISTS]` |
| 12 | Inventory (ledger + manual adjust) | `Web\InventoryController`, `Services\StockService` | `[EXISTS]` |
| 13 | Supplier | `Web\SupplierController` | `[EXISTS]` |
| 14 | Restock order (purchase order) | `Web\RestockOrderController` | `[EXISTS]` |
| 15 | Accounting (expense, payment, dues, 3 reports) | `Accounting\*` | `[EXISTS]` |
| 16 | HRM (employee, attendance, leave, payroll) | `HRM\*` | `[EXISTS]` |
| 17 | Reports (sales, source, top products, profit, PDF/CSV) | `Web\ReportController` | `[EXISTS]` |
| 18 | RBAC administration | `Web\RoleController`, `PermissionController`, `UserController`, `UserPermissionController` | `[EXISTS]` |
| 19 | Notifications (database channel) | `Web\NotificationController` | `[EXISTS]` |
| 20 | Dashboard | `Web\DashboardController` | `[EXISTS]` |

### 1.3 Existing features by area (condensed)

**Storefront** — home rails (flash sale / new arrivals / you-may-like), new arrivals page, flash sales, all brands, brand products, category products, product detail with variants and related products, search. Filters: `q`, `category`, `min_price`, `max_price`, `brands`. Sort: `default | price_low | price_high | newest`. Pagination 24.

**Auth** — password login on `login` field auto-detected as email or phone; separate `/admin/login` restricted to `super-admin|admin|sales|accountant`; phone OTP (6 digits, 5-minute expiry, max 3 requests per phone per 10 minutes) with auto-registration into the `customer` role; session-cart merge into the DB cart on OTP verify; deactivated-employee login block.

**Customer account** — profile, password (10-char policy), address book with single default, order list, order detail, PDF invoice, order cancellation limited to `pending`.

**Catalog** — simple and variant products, attribute/attribute-value matrix with a pivot, product and variant images on the `public` disk, slug auto-generation with de-duplication, barcode/SKU lookup endpoint, delete guards on sales/restock history.

**POS** — full-catalog client-side product list, barcode-focused search, category filter, cart, existing-customer select or quick-create by phone, discount, tax percentage, note. Server re-prices every line. Order created directly at `delivered` with `source = pos`.

**Service Sale** — service type catalogue with an auto-filled charge, technician assignment (drawn from `admin|super-admin|sales`), optional parts consuming stock, fixed discount, tax percentage, HTML invoice view. Order created directly at `delivered` with `type = service`.

**Inventory** — single `stock_transactions` ledger (`in | out | adjustment | return`) with `balance_after`, row locking, product and variant stock movement, low-stock and out-of-stock helpers.

**Restock** — supplier-linked purchase order, `pending → received` receive action that locks the row and posts stock in, delete blocked once received.

**Accounting** — expense categories, expenses with a 24-hour deletion audit rule, polymorphic payments against `Order` and `RestockOrder` with over-payment prevention, customer dues, supplier dues, daily sales, cash-basis profit & loss, running-balance cashbook.

**HRM** — employee = user + `employee_profiles`, month-grid attendance with a future-date block and one record per user per day, leave requests with an overlap guard, payroll generation from attendance with per-day deduction.

**Reports** — date-ranged sales summary, daily sales series, source split, top products, margin profit, PDF and CSV export.

**RBAC** — Spatie roles and permissions, protected system roles, per-user direct permission override, super-admin global bypass.

### 1.4 Existing business workflows

| Workflow | Entry state | Path | Terminal state |
|---|---|---|---|
| Online order | cart populated | checkout → order `ORD-…` → stock out → admin notification | `pending` (manually advanced) |
| Order fulfilment | `pending` | any status → any status (no matrix) | `delivered` or `cancelled` |
| Customer cancellation | `pending` only | reason captured, `cancelled_by` set | `cancelled` + stock restored |
| POS sale | operator cart | server re-price → order `POS-…` → stock out | `delivered`, `payment_status = pending` |
| Service invoice | operator form | server re-price → order `SRV-…` → stock out if parts | `delivered` |
| Restock receiving | `pending` PO | lock → `received` → stock in | `received` (irreversible) |
| Payment recording | due > 0 | lock payable → create payment → recompute | `partially_paid` or `paid` |
| Leave request | employee submits | overlap guard → manager decides | `approved` / `rejected` |
| Payroll | month selected | attendance-driven deduction | `pending` → `paid` |
| OTP login | guest with session cart | OTP → login → cart merge | authenticated customer |

### 1.5 Existing user roles and permissions

Roles seeded by `RoleSeeder`: `super-admin`, `admin`, `sales`, `accountant`, `customer`.

`super-admin` bypasses every permission check through the `User::hasPermissionTo()` override combined with `config('permission.register_permission_check_method') === true`.

Permission naming is split across two seeders that disagree: the code requires `product.edit`, `brand.edit`, `category.edit`, `unit.edit`, `pos.view`, `pos.checkout`, `order.manage`, `role.manage`, `permission.manage`, `user.manage`, `accounting.view`, while `RoleSeeder` (the only seeder registered in `DatabaseSeeder`) creates `*.update` variants instead. `unit.edit` is created by no seeder at all.

### 1.6 Existing database structure

37 application tables plus the Laravel and Spatie infrastructure tables. Key facts:

* No table uses soft deletes. Every delete is permanent.
* `orders` carries **two synchronised status columns** (`order_status` ENUM and `status` string) kept in step by model boot hooks.
* `order_items` carries **two variant columns** (`variant_id`, `product_variant_id`), only one of which is fillable.
* `payments` is polymorphic (`payable` → `Order` | `RestockOrder`).
* `stock_transactions` is a manual polymorphic reference pair (`reference_type` + `reference_id`).
* `designations` exists with no model, controller, route, or reference anywhere.
* Missing unique indexes where validation implies one: `attributes.name`, `service_types.name`, `wishlists(user_id, product_id)`, `carts(user_id, product_id, variant_id)`, `employee_profiles.user_id`.

### 1.7 Existing API / backend architecture

* Almost all traffic is Inertia over the `web` guard. `routes/api.php` contains only `GET /api/user` and an `apiResource` for attributes that returns **Inertia** responses rather than JSON, plus a route to `AttributeController@addValue` — a method that does not exist.
* Three genuine JSON endpoints: `POST /api/auth/send-otp`, `POST /api/auth/verify-otp` (both **unauthenticated**), and `GET /products/barcode/{barcode}`.
* Layering is partial: repositories exist for Brand, Category, Product, Unit, Supplier, Wishlist only. POS, Service, Order, Inventory, Restock, Accounting, HRM, and Reports call Eloquent directly from controllers.
* Two services only: `StockService` and `SmsService`. One job: `SendSmsJob`. No policies, no gates, no events, no listeners, no form-request `authorize()` logic.
* Write responses are redirect-with-flash, consumed by `FlashHandler` → toast.

### 1.8 Existing frontend structure

62 page components, ~48 shadcn/Radix UI wrappers, 2 layouts (`DashboardLayout`, `ShopLayout`), permission-filtered sidebar reading `auth.user.permissions` from the globally shared Inertia props. Forms use Inertia `useForm`; tables consume Laravel pagination payloads; filters are debounced and pushed with `router.get(..., { preserveState: true })`.

### 1.9 Existing integrations

| Integration | State |
|---|---|
| SMS (Greenweb default, Twilio branch, dummy log mode) | `[EXISTS]` — configured with `env()` at runtime, keys absent from `.env.example` |
| DomPDF invoices and report PDF | `[EXISTS]` |
| CSV streaming export | `[EXISTS]` |
| Database notifications | `[EXISTS]` — only `OrderCreatedNotification` is ever dispatched |
| Payment gateway | `[VERIFY]` — none in code |
| Email | `[VERIFY]` — `MAIL_MAILER=log`, no Mailables |
| Broadcasting / realtime | `[VERIFY]` — `BROADCAST_CONNECTION=log` |
| Object storage | `[VERIFY]` — `FILESYSTEM_DISK=local`, images on the `public` disk |

### 1.10 Existing reports

| Report | Source | Filters |
|---|---|---|
| Sales summary + daily series | `orders.order_date` | start/end date |
| Source split (online vs pos) | `orders.source` | start/end date |
| Top selling products | `order_items` join `orders` join `products` | start/end date, limit |
| Profit (margin basis) | `order_items.total_price − qty × cost` | start/end date |
| Accounting daily sales | `orders.created_at` | none |
| Profit & loss (cash basis) | `payments` and `expenses` | none |
| Cashbook | `payments ∪ expenses` running balance | none |
| Dashboard stats and charts | orders, order_items, users, products | fixed windows |

Two profit definitions coexist (cash basis in Accounting, margin basis in Reports/Dashboard) and no report excludes cancelled orders.

### 1.11 Existing sales / order flow

All three sales channels write into the **same `orders` table**, discriminated by `type` (`sales` | `service`) and `source` (`online` | `pos`). Line items all live in `order_items`, discriminated by `item_type` (`product` | `service_part`).

### 1.12 Existing accounting functionality

A cash log, not a general ledger: expenses, polymorphic payments, dues listings, and three reports. There is no chart of accounts, no journal, no debit/credit, no double entry, no bank entity, no tax master, and no audit trail beyond `created_by` columns.

### 1.13 Existing HRM functionality

Employee (user + profile), attendance grid, leave requests, payroll. There is no department, no designation entity in use, no shift, no holiday calendar, no late-apply, no attendance-apply, and no payslip.

### 1.14 Existing module dependencies

```
RBAC ──gates──▶ every dashboard module
Catalog ──▶ Orders (online / POS / service) ──▶ Inventory ledger
Supplier ──▶ Restock ──▶ Inventory ledger
Orders + Restock ──▶ Payments ──▶ Accounting reports
Attendance ──▶ Payroll
Orders + Inventory ──▶ Reports + Dashboard
Checkout ──▶ Notifications
```

---

### 1.15 Preserve / Redesign decision matrix

This is the most important table in Part A. It is the input to every phase in Part C.

#### 1.15.1 Preserve as-is (behaviour is correct and worth keeping)

| Capability | Where it lives now | Why preserve |
|---|---|---|
| Single stock ledger with `balance_after` and row locking | `StockService::adjustStock` | Correct concurrency model; `balance_after` gives an auditable running balance |
| Row locking on restock receive and payment recording | `RestockOrderController::receive`, `PaymentController::store` | Prevents double-receive and double-payment |
| Over-payment prevention against outstanding due | `PaymentController::store` | Correct financial guard |
| Delete guards on referenced master data | Product, Brand, Category, Unit, Attribute, Supplier, ExpenseCategory, Permission `destroy` | Prevents orphaned history |
| Server-side re-pricing in POS and Service | `PosController`, `ServiceInvoiceController` | Client-supplied prices are never trusted |
| OTP rate limiting and expiry | `AuthController::sendOTP` | Sound abuse control |
| Deactivated-employee login block | `AuthController::login` / `adminLogin` | Correct offboarding control |
| Role-escalation guards on employee create/update | `EmployeeController` | Prevents privilege escalation |
| Self-permission-edit block, super-admin/customer permission block | `UserPermissionController` | Prevents self-elevation |
| Protected system roles | `RoleController` | Prevents lockout |
| 24-hour expense deletion audit rule | `ExpenseController::destroy` | Financial-record discipline |
| Attendance future-date block and one-record-per-day uniqueness | `AttendanceController` + unique index | Correct attendance semantics |
| Leave overlap guard | `LeaveController::store` | Correct leave semantics |
| Session-cart → DB-cart merge on login | `AuthController::verifyOTP` | Good conversion behaviour |
| Slug auto-generation with numeric de-duplication | Brand/Category/Product repositories | Correct and collision-safe |
| Barcode / SKU lookup falling through product → variant | `ProductRepository::findByBarcodeOrSku` | Correct POS scanning behaviour |
| Repository + interface pattern | `app/Repositories/` | Right direction — extend it, do not remove it |
| Permission-filtered navigation from shared props | `Sidebar.tsx` + `HandleInertiaRequests` | Right pattern — fix only the gate mismatches |
| Debounced server-side filtering with `preserveState` | `Orders/Index.tsx` and peers | Good UX pattern to standardise on |

#### 1.15.2 Redesign (exists, but must change)

| # | Capability | Problem in the current code | Rebuild direction |
|---|---|---|---|
| R-1 | Order line variant reference | `OrderItem::$fillable` lacks `product_variant_id`; `StockService` branches on it ⇒ **variant stock never decrements** | One `variant_id` column, fillable, used everywhere. Stock movement resolved from the line's stock-keeping unit |
| R-2 | Historical cost on order lines | `cost_price` not fillable ⇒ always `0`; profit falls back to the *current* product cost | Snapshot unit cost on every line at write time; never recompute from master data |
| R-3 | Order status modelling | Two synchronised columns (`order_status` + `status`) kept in step by boot hooks | One status column per lifecycle, driven by an explicit state machine |
| R-4 | Status transitions | Any status → any status; no reason capture on the staff cancel path | Declared transition matrix, guard per transition, mandatory reason on cancel/refund, transition history table |
| R-5 | Stock on cancel/uncancel | Cancel restores stock; nothing re-deducts on un-cancel | Stock movements posted as reversible, referenced documents — never as ad-hoc mutations |
| R-6 | POS totals | Client computes percentage discount but sends `discount_type: "fixed"`, ignores tax, sends unvalidated `less_fixed` and `paid_amount` | One shared pricing engine; client calls it or mirrors it exactly; every submitted field validated |
| R-7 | POS / SRV numbering | `'POS-' . str_pad(Order::latest()->first()->id + 1, 6, '0')` — collides under concurrency | Per-series document numbering with a locked sequence table |
| R-8 | POS payment capture | Neither POS nor Service sets `payment_status`/`paid_amount`, so every cash sale lands in Customer Dues | Payment captured as part of the sale; tender lines recorded |
| R-9 | Permission catalogue | Two seeders with contradictory names; only `RoleSeeder` is registered; `syncPermissions` wipes earlier grants | One generated permission registry, one seeder, additive grants |
| R-10 | Accounting authorisation | The entire `accounting` prefix is gated by the single `accounting.view` permission | Per-action permissions on every accounting entity |
| R-11 | Accounting model | Cash log with no chart of accounts, no journal, no double entry | Full double-entry ledger (Section 6) |
| R-12 | Two profit definitions | Cash basis in Accounting vs. margin basis in Reports/Dashboard; neither excludes cancelled orders | One canonical definition sourced from the ledger; cancelled documents excluded |
| R-13 | Report date basis | Accounting daily sales groups on `created_at`; everything else on `order_date` | One document date convention across all reporting |
| R-14 | Storefront visibility filter | `categoryProducts` and `search` do not filter `is_active` | Publishable/visibility scope applied globally |
| R-15 | Storefront price filter | Filters on `products.base_price` only, excluding variant-priced products | Filter on a denormalised sellable price range |
| R-16 | Payroll regeneration | `updateOrCreate` overwrites `paid` rows and resets them to `pending` | Immutable payroll runs; approved/paid runs locked |
| R-17 | Attendance status | Validated as `required|string`; any typo becomes a new status; payroll matches exact strings | Enum-backed status, validated at the boundary |
| R-18 | Leave → attendance → payroll link | Approved leave writes nothing to attendance and affects nothing in payroll | Approved leave posts attendance rows and feeds payroll |
| R-19 | Employee `is_active` on update | Written from an unvalidated field; absent ⇒ `false` ⇒ silent lockout | Explicit, validated, audited status change |
| R-20 | Attribute update | Missing `values` key deletes every value of the attribute | Explicit add/update/remove semantics |
| R-21 | Product image replacement | `if (!$append) { }` is an empty block — images only accumulate | Explicit image collection management with ordering and primary selection |
| R-22 | Variant SKU/barcode uniqueness on update | Not validated; surfaces as a raw DB constraint error | Validated with self-ignore |
| R-23 | Discount ceiling | No cap; a negative `total_amount` can be stored | Discount validated against the line/document subtotal |
| R-24 | Supplier search grouping | `where(...)->orWhere(...)->orWhere(...)` combined with `is_active` without a closure | All OR groups wrapped |
| R-25 | Cart guest branch | Cart routes are `auth`-only but carry full dead session-cart branches | One cart abstraction with a real guest identity (session key or cart token) |
| R-26 | Full-table loads | POS loads the entire catalog with variants and images; Inventory Adjust, Restock Create, My Account, Roles, Permissions, Units, Payroll, Service Types all use `->get()` | Server-side search endpoints and pagination everywhere |
| R-27 | N+1 wishlist checks | One `EXISTS` query per product in every storefront rail | Single batched lookup |
| R-28 | Global Inertia share cost | Category tree with three `withCount` levels plus a full cart query on **every** request | Cached, lazily-evaluated partial props |
| R-29 | Soft deletes | None anywhere | Soft deletes on all master and transactional data |
| R-30 | Audit trail | Only `created_by` / `cancelled_by` columns | Full audit log (Section 12) |
| R-31 | API surface | `routes/api.php` returns Inertia responses; a route points at a non-existent method; no token issuing | Versioned JSON API with resources and a token endpoint |
| R-32 | Missing DB constraints | Validation-only uniqueness on 5 relationships | Real unique indexes |
| R-33 | Test coverage | Two Laravel skeleton tests only | Test strategy in Section 18 |
| R-34 | Registration | `Register.tsx` calls `useAuth().register`, which does not exist; no `POST /register` route | Decide and implement (see `[VERIFY]` list) |
| R-35 | Config via `env()` at runtime | `SmsService` breaks under `config:cache` | All config through `config/*.php` |
| R-36 | Repository contents | Repositories exist for 6 entities; 14 modules bypass the pattern entirely | Consistent layering (Section 2) |

#### 1.15.3 Retire

| Item | Reason |
|---|---|
| `designations` table | Orphan — no model, controller, route, or reference |
| `orders.billing_address`, `orders.shipping_amount` | Never written |
| `order_items.bonus_quantity`, `order_items.price_type` | Always `0` / `'flat'` |
| `stock_transactions.type = 'return'` | Never written |
| `restock_orders.status = 'cancelled'` | Never written; cancellation is implemented as deletion |
| `orders.status` (the string mirror of `order_status`) | Duplicate of `order_status` |
| `order_items.product_variant_id` **or** `variant_id` | Two columns for one relationship; keep exactly one |
| `OrderApprovedNotification` | Never dispatched; no approval event exists |
| `RoleAssignment.tsx` | Never rendered |
| `Product::getOldPriceAttribute()` (`price × 1.15`) | Fabricates a "was" price that never existed |
| `useAuth().login` / `useAuth().register` | Wrong field name / missing function |
| `app.zip`, `public.zip`, `gldqpoea_radian_agrovet.sql`, `build_output.log`, `debug_variants.json`, committed `.env` | Repository hygiene |

#### 1.15.4 `[VERIFY]` — business decisions required before the rebuild starts

| Question | Why it matters |
|---|---|
| Is email/password self-registration wanted, or is OTP the only customer entry? | Determines whether `Register` is built or removed (R-34) |
| Should `admin` reach POS and Accounting out of the box? | Determines the default role matrix (R-9) |
| Which profit definition is authoritative — cash basis or margin basis? | Determines the canonical P&L (R-12) |
| Single currency (BDT) or multi-currency? | `BDT` is hard-coded in `OrderCreatedNotification`; views use `TK` |
| Is the domain automotive, general retail + repair, or both? | The folder is `carMart`; seeded service types include IT, AC, and CCTV work |
| Single branch/warehouse or multi-location? | Drives the entire inventory schema (Section 10) |
| Is POS receipt printing required? | No print handler exists in `Pos/Index.tsx` |
| Does the SRS in the repository root add requirements not present in code? | `Software Requirements Specification (SRS).pdf` and `Detailed_Implementation_Plan.md` were **not** analysed for this document |

---

# PART B — TARGET SYSTEM DESIGN

## 2. Target System Architecture

### 2.1 Architectural goals mapped to concrete decisions

| Goal | Decision |
|---|---|
| Loosely coupled modules | Modular monolith: one deployable, hard module boundaries enforced by directory structure + a dependency lint rule. Cross-module communication only through **domain events** and **published contracts**, never through another module's Eloquent models |
| Reusable shared functionality | A `Shared` (kernel) module holding identity, money, addresses, documents, numbering, audit, attachments, and settings |
| Easy to add a new module | A documented module skeleton: `Domain`, `Application`, `Infrastructure`, `Http`, `Database`, `Tests`, plus a `ServiceProvider` that self-registers routes, migrations, permissions, and event listeners |
| Maintainable business logic | Actions/Use-cases per operation, not fat controllers. Controllers validate and delegate. Domain rules live in the domain layer |
| Large data volumes | Read/write separation at the query level: normalised transactional tables + denormalised read models for reporting and analytics, refreshed by queued jobs |
| Proper role & permission system | Generated permission registry, policies on every model, per-action gates, no super-admin short-circuit outside an explicit, logged escalation |
| Scalable reporting & analytics | Reporting reads only from read models and materialised aggregates, never from live transactional joins |
| Reliable, auditable accounting | Double-entry ledger, immutable posted journals, reversal-only corrections, full audit log |

### 2.2 Module map

```
┌───────────────────────────────────────────────────────────────────────┐
│                          SHARED KERNEL                                │
│  Identity · Party (Customer/Supplier/Employee) · Money · Address      │
│  Document numbering · Attachments · Settings · Audit · Notifications  │
└───────────────┬───────────────────────────────────────────────────────┘
                │
   ┌────────────┴───────────┬──────────────┬──────────────┐
   ▼                        ▼              ▼              ▼
┌─────────┐          ┌────────────┐  ┌──────────┐  ┌────────────┐
│ CATALOG │          │ INVENTORY  │  │   CRM    │  │PROCUREMENT │
│ Product │◀────────▶│  Stock     │  │ Customer │  │ Supplier   │
│ Variant │          │  Ledger    │  │ Contact  │  │ Purchase   │
│ Category│          │  Location  │  │ Segment  │  │ Receipt    │
│ Brand   │          │  Movement  │  │          │  │            │
│ Unit    │          │  Valuation │  │          │  │            │
└────┬────┘          └─────▲──────┘  └────▲─────┘  └─────┬──────┘
     │                     │              │              │
     │        ┌────────────┼──────────────┼──────────────┘
     │        │            │              │
     ▼        ▼            │              │
┌──────────────────────────┴──────────────┴─────────────────────────┐
│                        SALES (shared core)                        │
│   Order · OrderLine · Pricing · Discount · Tax · Fulfilment       │
│   Payment/Tender · Return · Refund · Document numbering           │
│      ┌──────────────┬──────────────────┬───────────────────┐      │
│      ▼              ▼                  ▼                   │      │
│ ┌──────────┐  ┌───────────┐   ┌────────────────┐           │      │
│ │E-COMMERCE│  │    POS    │   │  SERVICE SALE  │           │      │
│ │ channel  │  │  channel  │   │    channel     │           │      │
│ └──────────┘  └───────────┘   └────────────────┘           │      │
└────────────────────────────┬───────────────────────────────┴──────┘
                             │ domain events
                             ▼
                    ┌─────────────────┐        ┌──────────┐
                    │   ACCOUNTING    │        │   HRM    │
                    │ CoA · Journal   │        │ Employee │
                    │ Ledger · AR/AP  │        │ Attend.  │
                    │ Tax · Audit     │        │ Leave    │
                    └────────┬────────┘        │ Shift    │
                             │                 │ Payroll  │
                             │                 └────┬─────┘
                             ▼                      │
                    ┌────────────────────────────────┴──────┐
                    │            REPORTING                  │
                    │   read models · exports · scheduling  │
                    └────────────────┬──────────────────────┘
                                     ▼
                    ┌───────────────────────────────────────┐
                    │            ANALYTICS                  │
                    │  aggregates · KPI · trends · forecasts│
                    └───────────────────────────────────────┘
```

### 2.3 Dependency rules

| Rule | Statement |
|---|---|
| D-1 | The Shared kernel depends on nothing. Every module may depend on it. |
| D-2 | Catalog, CRM, and Inventory are **upstream** — they never import from Sales, Accounting, HRM, Reporting, or Analytics. |
| D-3 | Sales channels (E-commerce, POS, Service) depend on the Sales core, Catalog, Inventory, and CRM. They never depend on one another. |
| D-4 | Accounting depends only on the Shared kernel and **listens** to domain events. It never queries a Sales table directly. |
| D-5 | Reporting reads only from read models. Analytics reads only from aggregates built on read models. |
| D-6 | HRM is independent of Sales. Only Accounting listens to payroll events. |
| D-7 | Any cross-module read that cannot go through an event goes through a published, versioned **query contract** (an interface in the provider module, resolved from the container). |

### 2.4 Internal layering per module

```
Modules/<Name>/
├── Domain/          entities, value objects, enums, domain events, domain services, repository interfaces
├── Application/     actions (use-cases), DTOs, query handlers, policies
├── Infrastructure/  Eloquent models, repository implementations, external clients, event listeners
├── Http/            controllers, form requests, API resources, Inertia page controllers, routes
├── Database/        migrations, factories, seeders
├── Resources/       module-scoped React pages/components (if not centralised)
├── Tests/           unit, feature, integration
└── <Name>ServiceProvider.php
```

**Action pattern** — one class per business operation, e.g. `PlaceOrderAction`, `ReceivePurchaseAction`, `PostJournalEntryAction`, `RunPayrollAction`. Each is transactional, emits domain events, and is unit-testable without HTTP.

### 2.5 Event catalogue (the integration backbone)

| Event | Emitted by | Consumed by |
|---|---|---|
| `OrderPlaced` | Sales | Inventory (reserve), Accounting (AR + revenue), Notifications, Reporting |
| `OrderConfirmed` | Sales | Inventory (commit), Accounting |
| `OrderShipped` / `OrderDelivered` | Sales | Accounting (revenue recognition), Reporting |
| `OrderCancelled` | Sales | Inventory (release/reverse), Accounting (reverse), Reporting |
| `SaleCompleted` (POS) | POS | Inventory, Accounting, Reporting, Shift totals |
| `ServiceJobCompleted` | Service | Sales (invoice), Reporting |
| `InvoiceIssued` | Sales | Accounting (AR), Notifications |
| `PaymentReceived` / `PaymentMade` | Sales / Procurement | Accounting (cash + AR/AP), Reporting |
| `ReturnAccepted` / `RefundIssued` | Sales | Inventory (stock in), Accounting (contra-revenue) |
| `StockMoved` | Inventory | Accounting (COGS / inventory valuation), Reporting, Analytics |
| `PurchaseReceived` | Procurement | Inventory, Accounting (AP + inventory) |
| `ExpenseRecorded` | Accounting | Reporting |
| `PayrollApproved` | HRM | Accounting (salary expense + payable) |
| `AttendanceRecorded`, `LeaveApproved` | HRM | Payroll, HR reports |
| `AuditableActionPerformed` | Shared | Audit log |

**Delivery.** Events are dispatched inside the transaction and **listeners run after commit** (`afterCommit`). Accounting listeners are queued and idempotent, keyed on the source document identity, so a replay never double-posts.

---

## 3. E-commerce Module

### 3.1 Functional scope

| Capability | Status | Notes |
|---|---|---|
| Product catalogue (simple + variant) | `[EXISTS]` | Preserve. Redesign per R-14, R-15, R-21, R-22 |
| Category tree (self-referencing) | `[EXISTS]` | Preserve. Add publishing/visibility scope |
| Brand | `[EXISTS]` | Preserve |
| Product variants with attribute matrix | `[EXISTS]` | Preserve. Add a variant generator from attribute combinations `[NEW]` |
| Product images (product + variant) | `[EXISTS]` | Redesign image management (R-21); add alt text and CDN-friendly paths `[NEW]` |
| Unit of measure | `[EXISTS]` | Preserve |
| Inventory availability check on add-to-cart | `[EXISTS]` | Preserve; move to a shared availability service |
| Customer accounts | `[EXISTS]` | Preserve; unify under the Party model (Section 10) |
| Customer address book with a default | `[EXISTS]` | Preserve |
| Wishlist | `[EXISTS]` | Preserve; add the missing unique index |
| Cart (DB for authenticated users) | `[EXISTS]` | Preserve |
| Guest cart | `[IMPROVE]` | Session branch exists but is unreachable (R-25). Rebuild with a real guest cart token |
| Cart → login merge | `[EXISTS]` | Preserve |
| Checkout | `[EXISTS]` | Redesign: apply discount, tax, and shipping at checkout (currently `total = subtotal`) |
| Search + filter + sort + pagination | `[EXISTS]` | Redesign R-14, R-15; add facet counts `[NEW]` |
| Order placement and order history | `[EXISTS]` | Preserve |
| Order status | `[EXISTS]` | Redesign with a state machine (R-3, R-4) |
| Customer order cancellation (pending only) | `[EXISTS]` | Preserve; extend to a cancellation-request workflow after fulfilment starts `[NEW]` |
| PDF invoice | `[EXISTS]` | Preserve |
| Payment method (free text) | `[IMPROVE]` | Becomes a tender/payment-method master with a gateway abstraction |
| Online payment gateway | `[NEW]` | None in the codebase. Recommended: an abstract `PaymentGateway` contract with per-provider drivers |
| Shipping / delivery | `[NEW]` | `orders.shipping_amount` exists but is never written. Recommended: shipping zones, methods, rates, and a shipment entity with tracking |
| Discount rules | `[IMPROVE]` | Only a manual per-document discount exists. Recommended: a discount engine (percentage / fixed / tiered / category- and product-scoped) |
| Coupon | `[NEW]` | Not present. Recommended: coupon codes with validity window, usage limits, minimum spend, and per-customer limits |
| Return / RMA | `[NEW]` | Not present. Recommended: return request → approval → receipt → restock → refund |
| Refund | `[NEW]` | Not present. Recommended: full and partial refunds against the original tender |
| Product reviews / ratings | `[NEW]` | Not present |
| Flash sale / campaign engine | `[IMPROVE]` | `/flash-sales` returns random active products and `old_price` is a synthetic `price × 1.15`. Recommended: a real campaign entity with a schedule and a compare-at price |
| Tax rules | `[NEW]` | Tax is a manual per-document percentage today. Recommended: a tax master with rules per product class and jurisdiction |
| Multi-currency | `[VERIFY]` | Currently single-currency by implication |

### 3.2 Order state machine (replaces the free-for-all in R-4)

```
                 ┌──────────┐
                 │  DRAFT   │ (cart converted, not yet submitted)
                 └────┬─────┘
                      ▼
                 ┌──────────┐   cancel(reason)    ┌───────────┐
   ┌────────────▶│ PENDING  │────────────────────▶│ CANCELLED │
   │             └────┬─────┘                      └───────────┘
   │  payment failed  │ confirm                         ▲
   │             ┌────▼──────┐  cancel(reason, guard)   │
   │             │ CONFIRMED │──────────────────────────┘
   │             └────┬──────┘
   │                  │ allocate + pick
   │             ┌────▼──────┐
   │             │ PROCESSING│
   │             └────┬──────┘
   │                  │ ship
   │             ┌────▼──────┐
   │             │  SHIPPED  │
   │             └────┬──────┘
   │                  │ deliver
   │             ┌────▼──────┐   return request   ┌──────────┐
   └─────────────│ DELIVERED │───────────────────▶│ RETURNED │
                 └────┬──────┘                     └────┬─────┘
                      │ close                           │ refund
                 ┌────▼──────┐                     ┌────▼─────┐
                 │ COMPLETED │                     │ REFUNDED │
                 └───────────┘                     └──────────┘
```

Rules: transitions are declared in one place; every transition writes an `order_status_history` row (from, to, actor, reason, timestamp); backward transitions require a specific permission and a reason; stock effects are posted as **reversible documents**, never as ad-hoc field updates (R-5).

### 3.3 Payment status (independent lifecycle)

`UNPAID → PARTIALLY_PAID → PAID`, with `REFUNDED` and `PARTIALLY_REFUNDED` reachable from `PAID`, and `FAILED` reachable from a gateway attempt. Derived from the sum of successful tender lines, never set manually.

---

## 4. POS Module

### 4.1 Functional scope

| Capability | Status | Notes |
|---|---|---|
| POS terminal screen | `[EXISTS]` | Preserve the layout; rebuild the data loading (R-26) |
| Product search | `[IMPROVE]` | Currently the full catalog is shipped to the browser. Replace with a debounced server-side search endpoint plus an offline-capable local index `[NEW]` |
| Barcode scanning | `[EXISTS]` | Preserve; auto-focused input + product/variant fallthrough already work |
| Cart | `[EXISTS]` | Preserve |
| Customer selection / quick create | `[EXISTS]` | Preserve; route through the shared Party service |
| Walk-in / anonymous sale | `[EXISTS]` | Preserve (phone-only quick create) |
| Payment method | `[EXISTS]` | `cash, credit, bank_transfer, card, mobile_banking` — preserve the list |
| Split tender (multiple payment methods on one sale) | `[NEW]` | Recommended: a `sale_tenders` table |
| Change / cash tendered calculation | `[NEW]` | `paid_amount` is submitted by the UI but never validated or stored |
| Discount | `[IMPROVE]` | Client/server mismatch (R-6). Rebuild with one pricing engine; support both line-level and document-level discount |
| Tax | `[IMPROVE]` | Manual percentage today; move to the tax master |
| Hold / Resume sale | `[NEW]` | Not present. Recommended: parked sales per terminal per operator |
| Sales return | `[NEW]` | Not present |
| Refund | `[NEW]` | Not present |
| Invoice / receipt (data) | `[EXISTS]` | Order is created and an invoice view exists |
| Receipt printing (thermal / 80 mm) | `[NEW]` | No print handler in `Pos/Index.tsx`. `[VERIFY]` whether required |
| Cash drawer | `[NEW]` | Not present |
| Opening / closing balance | `[NEW]` | Not present |
| Shift (open, close, reconcile, variance) | `[NEW]` | Not present |
| Terminal / register master | `[NEW]` | Not present |
| Daily sales summary | `[IMPROVE]` | Exists only as an accounting report with no filters |
| POS-specific reports (Z-report, X-report, tender summary, operator summary) | `[NEW]` | Not present |
| Offline mode | `[NEW]` | Not present. Recommended if counter connectivity is unreliable — `[VERIFY]` |

### 4.2 POS shift lifecycle `[NEW]`

```
Terminal registered
      ↓
OPEN SHIFT  (operator, terminal, opening cash counted)
      ↓
Sales · Returns · Payouts · Pay-ins   →  each posts to Inventory + Accounting
      ↓
X-REPORT (read-only mid-shift snapshot, repeatable)
      ↓
CLOSE SHIFT (counted cash entered)
      ↓
Variance = counted − (opening + cash sales + pay-ins − payouts − refunds)
      ↓
Z-REPORT (immutable) → variance posted to Accounting as cash over/short
```

### 4.3 What POS shares with E-commerce and Service

| Entity | Sharing model |
|---|---|
| Product / Variant / Price | **Single Catalog module.** Channel-specific price lists on top of a base price `[NEW]` |
| Inventory | **Single stock ledger.** Channel is a dimension on the movement, never a separate stock table |
| Customer | **Single Party record.** POS quick-create writes the same `customers` record the storefront uses (already the behaviour today) |
| Order / Sale | **One Sales core** with a `channel` discriminator — the current design already puts all three channels in `orders`/`order_items`. Preserve that decision; formalise it |
| Payment | **One tender model** across channels |
| Accounting | Every channel emits the same events; Accounting has one posting rule set per event type |
| Numbering | One numbering service, separate series per channel (`ORD-`, `POS-`, `SRV-`, `PO-`) — preserve the prefixes, replace the generation mechanism (R-7) |

---

## 5. Service Sale Module

### 5.1 Functional scope

| Capability | Status | Notes |
|---|---|---|
| Service catalogue (`service_types` with a charge) | `[EXISTS]` | Preserve; add the missing unique index on `name` |
| Service category | `[NEW]` | Services are a flat list today |
| Service charge auto-fill on selection | `[EXISTS]` | Preserve (already in `Service/Create.tsx`) |
| Customer selection / quick create | `[EXISTS]` | Preserve |
| Assigned employee / technician | `[IMPROVE]` | Drawn from `admin|super-admin|sales`; the code comment reads "Or specific technician role if exists". Introduce a real technician/skill assignment from HRM |
| Parts consumption from stock | `[EXISTS]` | Preserve (`item_type = service_part`, stock posted only when parts exist) |
| Service invoice | `[EXISTS]` | Preserve; make it a PDF download like order invoices (currently returns an HTML view) |
| Payment | `[IMPROVE]` | Same gap as POS — `payment_status` is never set |
| Service quotation / estimate | `[NEW]` | Not present. Recommended: quotation → customer approval → job |
| Service job status tracking | `[NEW]` | Not present — service invoices are created directly at `delivered` |
| Service history per customer / per asset | `[IMPROVE]` | Reachable only by filtering orders; no dedicated view |
| Serviced asset / device register (serial, model) | `[NEW]` | Not present |
| Warranty tracking | `[NEW]` | Not present |
| After-sales / follow-up scheduling | `[NEW]` | Not present |
| Labour vs. parts revenue split | `[IMPROVE]` | `service_charge` and part lines exist; reporting does not separate them |
| Technician performance | `[NEW]` | Not present |

### 5.2 Proposed service job lifecycle `[NEW]`

```
QUOTATION (optional)
     │ customer approves
     ▼
  RECEIVED  ── job created, asset logged, technician assigned
     │
     ▼
IN_PROGRESS ── parts issued from stock (reserves + consumes), labour logged
     │
     ├──▶ AWAITING_PARTS ──▶ back to IN_PROGRESS
     └──▶ AWAITING_APPROVAL (scope change) ──▶ back to IN_PROGRESS
     │
     ▼
 COMPLETED  ── invoice issued (labour + parts + tax − discount)
     │
     ▼
 DELIVERED  ── handed to customer, payment captured
     │
     ▼
  CLOSED    ── warranty window starts
     │
     └──▶ WARRANTY_CLAIM ──▶ new job linked to the original
```

The existing behaviour (create → immediately `delivered`) becomes the **express path** for counter work, preserved as a single-step shortcut through the same state machine.

### 5.3 Service integration points

| Target | Flow |
|---|---|
| Inventory | Part issue posts a stock movement referencing the job |
| Accounting | `InvoiceIssued` → AR + service revenue (separate account from goods revenue) + parts COGS; `PaymentReceived` → cash + AR |
| CRM | Job history and warranty status on the customer record |
| HRM | Technician identity, availability, and labour hours |
| Reporting | Service sales report, technician productivity, parts consumption, warranty claim rate |

---

## 6. Accounting Module

> The current module is a **cash log**: expenses, polymorphic payments, dues listings, and three reports. Everything in this section beyond that is `[NEW]`, with the existing pieces explicitly marked.

### 6.1 Scope

| Capability | Status |
|---|---|
| Expense categories | `[EXISTS]` |
| Expenses with a creator and a 24-hour deletion audit rule | `[EXISTS]` |
| Payments (polymorphic, `in`/`out`, 4 methods) | `[EXISTS]` |
| Over-payment prevention | `[EXISTS]` |
| Customer dues / supplier dues listings | `[EXISTS]` |
| Cash-basis profit & loss | `[EXISTS]` — to be replaced by a ledger-derived P&L |
| Cashbook with a running balance | `[EXISTS]` — to be replaced by a ledger-derived cash account statement |
| Chart of Accounts | `[NEW]` |
| Account types (Asset / Liability / Equity / Income / Expense) | `[NEW]` |
| Journal entries with debit/credit lines | `[NEW]` |
| General Ledger | `[NEW]` |
| Trial balance | `[NEW]` |
| Balance sheet | `[NEW]` |
| Income statement (accrual) | `[NEW]` |
| Cash flow statement | `[NEW]` |
| AR / AP sub-ledgers with ageing | `[IMPROVE]` — dues listings exist, ageing does not |
| Bank accounts and bank reconciliation | `[NEW]` — `bank_transfer` is a payment method with no bank entity |
| Tax accounts and tax reporting | `[NEW]` |
| Refund / credit note accounting | `[NEW]` |
| Inventory valuation and COGS posting | `[NEW]` |
| Fiscal periods with open/close | `[NEW]` |
| Audit trail on financial documents | `[NEW]` |

### 6.2 Chart of Accounts skeleton `[NEW]`

| Code | Account | Type | Used by |
|---|---|---|---|
| 1000 | Cash on Hand | Asset | POS shift, cash payments |
| 1010 | Cash in Bank | Asset | Bank transfers, card settlement |
| 1020 | Mobile Banking Wallet | Asset | Mobile banking payments |
| 1100 | Accounts Receivable | Asset | Credit sales |
| 1200 | Inventory | Asset | Purchase receipt, COGS |
| 1300 | Prepaid Expenses | Asset | Expenses |
| 1400 | Input Tax (recoverable) | Asset | Purchase tax |
| 2000 | Accounts Payable | Liability | Purchase receipt |
| 2100 | Output Tax Payable | Liability | Sales tax |
| 2200 | Salary Payable | Liability | Payroll |
| 2300 | Customer Advances | Liability | Prepayments |
| 3000 | Owner's Equity | Equity | Opening balances |
| 3100 | Retained Earnings | Equity | Period close |
| 4000 | Sales Revenue — Goods | Income | E-commerce + POS |
| 4010 | Sales Revenue — Service | Income | Service Sale |
| 4100 | Sales Returns & Allowances | Income (contra) | Returns |
| 4200 | Discounts Given | Income (contra) | Discounts |
| 5000 | Cost of Goods Sold | Expense | Stock issue on sale |
| 5010 | Cost of Parts — Service | Expense | Service part issue |
| 6000 | Salary & Wages | Expense | Payroll |
| 6100 | Rent / Utilities / Other | Expense | Expense categories map here |
| 6900 | Cash Over/Short | Expense | POS shift variance |

**Migration note.** Existing `expense_categories` rows map one-to-one onto child accounts under 6100. This mapping is a required migration step (Section 17).

### 6.3 Posting rules — how each source document becomes a journal entry

| Trigger event | Debit | Credit |
|---|---|---|
| `InvoiceIssued` (goods, credit sale) | 1100 Accounts Receivable | 4000 Sales Revenue — Goods; 2100 Output Tax Payable |
| `InvoiceIssued` (service) | 1100 Accounts Receivable | 4010 Sales Revenue — Service; 2100 Output Tax Payable |
| `SaleCompleted` (POS, cash) | 1000 Cash on Hand | 4000 Sales Revenue; 2100 Output Tax Payable |
| Discount applied on a sale | 4200 Discounts Given | (reduces the AR/cash debit) |
| `StockMoved` (issue on sale) | 5000 COGS (or 5010 for service parts) | 1200 Inventory |
| `PaymentReceived` | 1000/1010/1020 Cash account | 1100 Accounts Receivable |
| `PurchaseReceived` | 1200 Inventory; 1400 Input Tax | 2000 Accounts Payable |
| `PaymentMade` (supplier) | 2000 Accounts Payable | 1000/1010 Cash account |
| `ExpenseRecorded` | 6xxx Expense account | 1000/1010 Cash or 2000 AP |
| `ReturnAccepted` | 4100 Sales Returns; 1200 Inventory | 1100 AR (or cash); 5000 COGS |
| `RefundIssued` | 1100 AR (clearing) | 1000/1010 Cash account |
| `PayrollApproved` | 6000 Salary & Wages | 2200 Salary Payable |
| Salary paid | 2200 Salary Payable | 1000/1010 Cash account |
| POS shift variance | 6900 Cash Over/Short | 1000 Cash on Hand (or the reverse) |

### 6.4 Ledger integrity rules `[NEW]`

| Rule | Statement |
|---|---|
| A-1 | Every journal entry balances: `Σ debit = Σ credit`, enforced in the domain and asserted by a DB check or a posting service invariant |
| A-2 | A posted journal entry is **immutable**. Corrections are made by a reversing entry that references the original |
| A-3 | Every journal entry carries `source_type` + `source_id` (the originating document) and a unique `(source_type, source_id, rule_key)` index, making posting **idempotent** |
| A-4 | Journal entries fall inside an **open fiscal period**; posting into a closed period is rejected |
| A-5 | Cash and bank accounts are reconciled against statements; unreconciled items are visible |
| A-6 | Every posting, reversal, and period close writes an audit-log row |
| A-7 | Accounting listeners are queued, retried, and idempotent, so an event replay never double-posts |
| A-8 | Deleting a source document is impossible once posted; only cancellation/reversal is allowed |

---

## 7. HRM Module

### 7.1 Scope

| Capability | Status | Notes |
|---|---|---|
| Employee (user + `employee_profiles`) | `[EXISTS]` | Preserve; separate the Employee entity from the login User (Section 10) |
| Employee active/inactive with a login block | `[EXISTS]` | Preserve; fix R-19 |
| Base salary, join date | `[EXISTS]` | Preserve; extend to a salary-structure history `[NEW]` |
| Role-escalation guards | `[EXISTS]` | Preserve |
| Employee search + pagination | `[EXISTS]` | Preserve |
| Department | `[NEW]` | Not present |
| Designation | `[IMPROVE]` | A `designations` table exists but is **orphaned** — no model, controller, or route. Role name is currently displayed as the designation. Build it properly and stop overloading roles |
| Attendance (month grid, one per day, no future dates) | `[EXISTS]` | Preserve; fix R-17 (enum status) |
| Check-in / check-out times | `[EXISTS]` | Stored as nullable free-form strings; type them properly |
| Leave request with an overlap guard | `[EXISTS]` | Preserve |
| Leave approval | `[EXISTS]` | Preserve; add approver identity and timestamp `[NEW]` |
| Leave balance / entitlement / accrual | `[NEW]` | Not present — only overlap is checked |
| Leave types beyond `casual|sick|annual` | `[IMPROVE]` | Make configurable |
| Shift management | `[NEW]` | Not present |
| Holiday calendar | `[NEW]` | Not present |
| Weekend configuration | `[NEW]` | Not present — payroll divides by calendar days, not working days |
| Late Apply (regularisation of a late mark) | `[NEW]` | Not present |
| Attendance Apply (missed-punch request) | `[NEW]` | Not present |
| Payroll generation from attendance | `[EXISTS]` | Preserve the formula as the baseline; fix R-16 (immutable runs) |
| Bonus | `[IMPROVE]` | Hard-coded to `0` with the comment "Configurable later" |
| Allowances / deductions / overtime | `[NEW]` | Not present |
| Payslip document | `[NEW]` | Not present |
| Payroll → Accounting posting | `[NEW]` | Not present |
| Employee documents / attachments | `[NEW]` | Not present |
| HR reports | `[IMPROVE]` | Only the attendance grid exists today |

### 7.2 Proposed HRM flows

```
Employee onboarding
  Create Employee → Department + Designation + Shift + Salary structure
        → optional User account + Role assignment → Active

Daily attendance
  Shift + Holiday calendar define the expectation
        → punch / manual entry / bulk grid   [grid EXISTS]
        → deviation detected (late / early / missed)
        → Late Apply or Attendance Apply     [NEW]
        → manager approves → attendance corrected

Leave
  Balance check [NEW] → overlap check [EXISTS] → submit
        → manager approves [EXISTS] → attendance auto-marked on-leave [NEW]
        → balance deducted [NEW]

Payroll (monthly)
  Lock attendance for the period [NEW]
        → generate run (base + allowances + overtime − absence − deductions)
        → review → approve (run becomes immutable) [NEW]
        → PayrollApproved event → Accounting posts salary expense + payable [NEW]
        → disburse → mark paid → Accounting posts the cash payment [NEW]
        → payslips issued [NEW]
```

---

## 8. Reporting Module

### 8.1 Design principles

| Principle | Detail |
|---|---|
| One reporting engine | A single report registry — definition, permission, filters, columns, aggregations, export formats. Adding a report is registering a definition, not writing a controller |
| Read models only | Reports never join live transactional tables. They query denormalised read models refreshed by queued jobs on domain events |
| One date convention | Every report uses the **document date** (`order_date` equivalent), never `created_at` (fixes R-13) |
| Cancelled excluded | Cancelled and draft documents are excluded by default, with an explicit "include cancelled" toggle (fixes R-12) |
| Summary + detail | Every report has a summary view and a drill-down detail view sharing the same filter state |
| Consistent export | CSV, Excel, and PDF from one export pipeline; large exports queued and delivered as a download link `[NEW]` |
| Scheduling | Scheduled report delivery `[NEW]` |
| Saved views | Per-user saved filter presets `[NEW]` |

### 8.2 Report catalogue

| Report | Status | Data source | Filters | Summary | Detail |
|---|---|---|---|---|---|
| **Sales Summary** | `[EXISTS]` | `sales_read.orders` | date range, channel, status, customer, salesperson | revenue, orders, AOV, units | order list |
| **Daily Sales Series** | `[EXISTS]` | `sales_read.daily_sales` | date range, channel | per-day revenue and count | orders per day |
| **Sales by Channel** | `[EXISTS]` (source split) | `sales_read.orders` | date range | count and value per channel | orders per channel |
| **Sales by Product / Category / Brand** | `[IMPROVE]` (top products only) | `sales_read.order_lines` | date range, category, brand, channel | qty, revenue, margin | line detail |
| **Sales by Salesperson / Operator** | `[NEW]` | `sales_read.orders` | date range, user | revenue, count, discount given | order list |
| **Purchase Report** | `[NEW]` | `procurement_read.purchases` | date range, supplier, status | value, count | PO lines |
| **Product Report** | `[IMPROVE]` | Catalog + `sales_read` | category, brand, active, type | count, price band, sell-through | product list |
| **Inventory Report** | `[IMPROVE]` (low/out-of-stock only) | `inventory_read.stock_levels` | location, category, brand, below-reorder | on-hand, reserved, available, value | per-SKU with ledger link |
| **Stock Movement / Ledger** | `[EXISTS]` (history page) | `stock_movements` | date range, product, type, reference | in/out totals | movement rows |
| **Stock Valuation** | `[NEW]` | `inventory_read.valuation` | as-of date, location | value by category | per-SKU cost and value |
| **POS Report (X / Z / shift)** | `[NEW]` | `pos_read.shifts` | date range, terminal, operator | sales, tenders, variance | transaction list |
| **POS Tender Summary** | `[NEW]` | `sales_read.tenders` | date range, terminal | totals per method | tender rows |
| **Service Sales Report** | `[IMPROVE]` (list only) | `service_read.jobs` | date range, technician, service type, status | labour vs parts revenue, job count | job detail |
| **Technician Productivity** | `[NEW]` | `service_read.jobs` | date range, technician | jobs, hours, revenue | job list |
| **Customer Report** | `[NEW]` | `crm_read.customers` | date range, segment, channel | count, new vs returning, LTV | customer detail |
| **Customer Dues / AR Ageing** | `[IMPROVE]` (flat list) | Accounting AR | as-of date, customer, bucket | 0-30/31-60/61-90/90+ | invoice list |
| **Supplier Dues / AP Ageing** | `[IMPROVE]` (flat list) | Accounting AP | as-of date, supplier, bucket | ageing buckets | bill list |
| **Payment Report** | `[EXISTS]` (payment list) | Accounting payments | date range, method, direction, account | totals per method | payment rows |
| **Expense Report** | `[IMPROVE]` (list only) | Accounting expenses | date range, category, creator | totals per category | expense rows |
| **Trial Balance** | `[NEW]` | General Ledger | as-of date | debit/credit totals | per-account |
| **General Ledger / Account Statement** | `[NEW]` | General Ledger | account, date range | opening, movement, closing | journal lines |
| **Income Statement (accrual)** | `[NEW]` | General Ledger | period, comparison | revenue, COGS, gross margin, expenses, net | per-account |
| **Balance Sheet** | `[NEW]` | General Ledger | as-of date | assets, liabilities, equity | per-account |
| **Cash Flow** | `[NEW]` | General Ledger | period | operating/investing/financing | transactions |
| **Cashbook / Bank Book** | `[EXISTS]` | General Ledger cash accounts | date range, account | running balance | entries |
| **Tax Report** | `[NEW]` | Tax accounts | period | input vs output tax, net payable | per-document |
| **Profit & Loss by Channel / Product** | `[NEW]` | GL + `sales_read` | period, dimension | contribution margin | drill-down |
| **HRM — Attendance Summary** | `[IMPROVE]` (grid only) | `hrm_read.attendance` | month, department, designation, employee | present/absent/late/leave days | daily grid |
| **HRM — Leave Report** | `[NEW]` | `hrm_read.leaves` | period, type, status, department | days taken, balance | request list |
| **HRM — Payroll Register** | `[IMPROVE]` (list only) | Payroll runs | period, department, status | gross, deductions, net | payslip detail |
| **HRM — Headcount / Turnover** | `[NEW]` | `hrm_read.employees` | as-of date, department | joiners, leavers, headcount | employee list |

### 8.3 Standard report contract

Every report definition declares:

```
key                 unique identifier, e.g. "sales.summary"
title               display name
permission          required permission, e.g. "report.sales.view"
filters[]           typed filter descriptors (date range, select, multi-select, search, boolean)
default_date_range  e.g. last 30 days
columns[]           key, label, type (money/int/percent/date/text), alignment, sortable, visible-by-default
aggregations[]      summary tiles computed over the filtered set
detail_route        drill-down target
exports[]           csv | xlsx | pdf
source              read-model name (never a live transactional query)
```

---

## 9. Analytics

Analytics is separate from Reporting: reports answer "what were the numbers?", analytics answers "how are we trending and where should we act?".

### 9.1 Analytics scope

| Analysis | Status | Source | Aggregation |
|---|---|---|---|
| Sales trend (day / week / month / year, YoY) | `[IMPROVE]` (6-month chart on the dashboard) | `sales_read.daily_sales` | pre-aggregated daily fact rows rolled up |
| Revenue by channel over time | `[IMPROVE]` (static source split) | `sales_read.daily_sales` grouped by channel | daily rollup |
| Gross profit and margin % trend | `[IMPROVE]` (margin formula exists) | `sales_read.order_lines` (snapshotted cost) + GL | daily rollup |
| Product performance (ABC, sell-through, dead stock) | `[IMPROVE]` (top 5 only) | `sales_read.order_lines` + `inventory_read.stock_levels` | per-SKU period aggregate |
| Category / brand contribution | `[IMPROVE]` (top 5 chart) | `sales_read.order_lines` | period aggregate |
| Customer performance (new vs returning, cohorts, RFM, LTV, churn) | `[IMPROVE]` (new vs returning chart) | `crm_read.customers` + `sales_read.orders` | cohort and RFM tables |
| Service performance (jobs, revenue, turnaround time, repeat rate) | `[NEW]` | `service_read.jobs` | period aggregate |
| Technician utilisation | `[NEW]` | `service_read.jobs` + HRM | period aggregate |
| Inventory performance (turnover, days of cover, stockout rate, ageing) | `[NEW]` | `inventory_read` + `sales_read` | period aggregate |
| POS performance (sales per terminal / operator / hour, basket size, peak hours) | `[NEW]` | `pos_read.shifts` + `sales_read.orders` | hourly + daily rollup |
| Expense trend by category | `[NEW]` | GL expense accounts | monthly rollup |
| Cash flow indicators (runway, burn, collection days, payment days) | `[NEW]` | GL cash + AR/AP | monthly rollup |
| HR indicators (attendance %, absenteeism, leave utilisation, overtime, turnover) | `[NEW]` | `hrm_read.*` | monthly rollup |
| Forecasting (sales, reorder point) | `[NEW]` | `sales_read.daily_sales` | moving average / seasonal |

### 9.2 KPI set for the management dashboard

| KPI | Formula | Source |
|---|---|---|
| Revenue (period, vs. previous) | Σ net sales excluding cancelled | `sales_read.daily_sales` |
| Gross margin % | (revenue − COGS) / revenue | `sales_read.order_lines` + GL |
| Net profit | ledger-derived income statement | GL |
| Average order value | revenue / order count | `sales_read.orders` |
| Orders per channel | count grouped by channel | `sales_read.orders` |
| New vs returning customer revenue | first-order-date cohort | `crm_read` + `sales_read` |
| Inventory turnover | COGS / average inventory value | GL + `inventory_read.valuation` |
| Stockout rate | SKUs at zero available / total active SKUs | `inventory_read.stock_levels` |
| AR ageing > 60 days | AR sub-ledger | GL |
| Cash position | cash + bank account balances | GL |
| Service turnaround time | avg(`completed_at − received_at`) | `service_read.jobs` |
| POS shift variance | Σ absolute variance | `pos_read.shifts` |
| Attendance rate | present days / expected working days | `hrm_read.attendance` |
| Payroll cost as % of revenue | salary expense / revenue | GL |

### 9.3 Aggregation pipeline

```
Transactional write (order, movement, journal, attendance)
        │ domain event, after commit
        ▼
Queued projector  →  READ MODEL  (denormalised, one row per business fact)
        │ nightly + on-demand
        ▼
Queued aggregator →  FACT TABLES (daily_sales_facts, daily_inventory_facts,
                                   daily_finance_facts, daily_hr_facts)
        │
        ▼
Analytics queries read fact tables only  →  cached per (report, filter hash, period)
```

Rules: aggregators are **idempotent** and re-runnable for any date range; every fact row carries the date, the dimension keys, and the measures; late-arriving corrections trigger a re-aggregation of the affected dates only.

---

## 10. Inventory & Shared Data

### 10.1 The shared-data spine

```
                          ┌───────────────────┐
                          │      PARTY        │  one identity for a person or organisation
                          └─────────┬─────────┘
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
        ┌──────────┐          ┌──────────┐          ┌──────────┐
        │ CUSTOMER │          │ SUPPLIER │          │ EMPLOYEE │
        └────┬─────┘          └────┬─────┘          └────┬─────┘
             │                     │                     │
   ┌─────────┴────────┐            │                     │
   ▼         ▼        ▼            ▼                     ▼
E-comm     POS     Service    Procurement               HRM
   │         │        │            │
   └─────────┴────────┴────────────┘
                  │
                  ▼
        ┌───────────────────┐
        │  USER (login)     │  optional, linked to a Party
        └───────────────────┘

        ┌───────────────────┐
        │     PRODUCT       │  marketing entity
        └─────────┬─────────┘
                  ▼
        ┌───────────────────┐
        │  VARIANT / SKU    │  the stock-keeping unit — the ONLY thing stock moves on
        └─────────┬─────────┘
                  ▼
        ┌───────────────────┐
        │  STOCK LEDGER     │  append-only movements, one row per event
        └─────────┬─────────┘
                  ▼
        ┌───────────────────┐
        │  STOCK LEVEL      │  derived projection: on_hand, reserved, available
        └─────────┬─────────┘
      ┌───────────┼────────────┐
      ▼           ▼            ▼
 E-commerce      POS       Service
```

### 10.2 Key modelling decisions

| Decision | Rationale | Change from today |
|---|---|---|
| **Every sellable item is a SKU.** A "simple product" is a product with exactly one implicit variant | Removes the dual stock path that causes R-1 today (product stock and variant stock moving independently) | Significant change — the current schema keeps `products.stock` **and** `product_variants.stock` and moves both |
| **Stock moves only on SKUs.** Product-level stock becomes a derived sum | Single source of truth | Fixes R-1 |
| **Stock ledger is append-only.** Current level is a projection, kept in a `stock_levels` table updated in the same transaction | Auditability + fast reads | The current `stock_transactions` ledger already does this well — extend it |
| **Reserved vs. available.** `available = on_hand − reserved` | Prevents overselling between add-to-cart and fulfilment | `[NEW]` — no reservation concept exists today |
| **Location dimension on every movement** | Multi-warehouse readiness without a schema rewrite. Ships with a single default location | `[NEW]` — `[VERIFY]` whether multi-location is required now |
| **Party unification.** One `parties` table; Customer, Supplier, and Employee are roles on a party | A supplier who is also a customer is one record; a technician is an employee party | Today `users` holds customers **and** staff, `suppliers` is separate, and `employee_profiles` extends `users` |
| **User ≠ Employee.** A login is optional on any party | An employee with no system access is still an employee | Today an employee **must** be a `User` |
| **Documents share one numbering service** with per-series sequences | Fixes R-7 | Today three different generation strategies coexist |
| **Money as a value object** (`amount` + `currency`, integer minor units) | Removes float/decimal rounding drift | Today plain `decimal` columns |

### 10.3 Centralised common entities

| Entity | Owner module | Consumed by |
|---|---|---|
| Party / Customer / Supplier / Employee | Shared + CRM + Procurement + HRM | every sales channel, Accounting |
| Address | Shared | Customer, Supplier, Employee, Order, Shipment |
| Product / Variant / Category / Brand / Unit | Catalog | E-commerce, POS, Service, Procurement, Inventory |
| Price list | Catalog | all channels `[NEW]` |
| Stock level / Stock movement | Inventory | all channels, Accounting |
| Tax rule | Shared `[NEW]` | all channels, Accounting |
| Payment method / Tender | Shared | all channels, Accounting |
| Document number sequence | Shared | all modules |
| Attachment | Shared `[NEW]` | Product, Order, Service job, Employee, Expense |
| Setting | Shared `[NEW]` | all modules |
| Audit log | Shared `[NEW]` | all modules |
| Notification | Shared | all modules |

---

## 11. User Roles & Permissions

### 11.1 Permission naming convention

`<module>.<resource>.<action>` — for example `sales.order.view`, `accounting.journal.post`, `hrm.payroll.approve`.

Actions: `view`, `view_any`, `create`, `update`, `delete`, `restore`, `approve`, `reject`, `export`, `post`, `void`.

**Generated, not hand-written.** Permissions are declared per module in a manifest and a single command generates the seeder and the TypeScript union type used by the frontend. This eliminates the class of defect in R-9 by construction.

### 11.2 Proposed role set

| Role | Status | Scope |
|---|---|---|
| System Admin | `[IMPROVE]` (`super-admin` exists with a hard-coded bypass) | Everything, including settings and role management. The bypass is replaced by an explicit full grant so that access is visible and auditable |
| Manager | `[NEW]` | Cross-module read, approvals, analytics; no destructive actions |
| Sales | `[EXISTS]` | E-commerce and order management, customer read/create |
| POS User / Cashier | `[NEW]` | POS terminal, own shift, own sales; no price override without approval |
| POS Supervisor | `[NEW]` | Shift close, void, refund approval, discount override |
| Service Staff / Technician | `[NEW]` | Assigned jobs, parts issue, job status |
| Service Manager | `[NEW]` | All jobs, quotation approval, technician assignment |
| Inventory / Store Keeper | `[NEW]` (permissions exist, no role) | Stock adjustment, purchase receipt, transfers |
| Purchase Officer | `[NEW]` | Purchase orders, supplier management |
| Accountant | `[EXISTS]` | Accounting entry, payments, expenses, financial reports |
| Accounts Manager | `[NEW]` | Journal posting, period close, reconciliation, approvals |
| HR | `[NEW]` (permissions exist, no role) | Employees, attendance, leave, payroll preparation |
| HR Manager | `[NEW]` | Leave and payroll approval |
| Auditor | `[NEW]` | Read-only across all financial data + audit log |
| Customer | `[EXISTS]` | Storefront and own account only |

### 11.3 Role → module permission matrix (proposed)

Legend: **V** view · **C** create · **E** edit · **D** delete · **A** approve/reject · **X** export · **—** no access

| Module | System Admin | Manager | Sales | POS User | POS Supervisor | Technician | Service Mgr | Store Keeper | Purchase | Accountant | Accounts Mgr | HR | HR Mgr | Auditor | Customer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Catalog | VCEDX | VX | V | V | V | V | V | V | V | V | V | — | — | V | V (public) |
| Inventory | VCEDX | VX | V | V | V | V | V | VCE | V | V | V | — | — | VX | — |
| CRM / Customer | VCEDX | VX | VCE | VC | VCE | V | VCE | — | — | V | V | — | — | VX | own |
| E-commerce orders | VCEDAX | VAX | VCEA | — | — | — | — | V | — | V | V | — | — | VX | own |
| POS | VCEDAX | VX | — | VC | VCEA | — | — | — | — | V | V | — | — | VX | — |
| POS shift | VCEDAX | VX | — | VC (own) | VCEA | — | — | — | — | V | V | — | — | VX | — |
| Service jobs | VCEDAX | VAX | V | — | — | VE (assigned) | VCEDA | V | — | V | V | — | — | VX | own |
| Procurement | VCEDAX | VAX | — | — | — | — | — | VC | VCEA | V | V | — | — | VX | — |
| Accounting — entry | VCEDX | V | — | — | — | — | — | — | — | VCE | VCE | — | — | VX | — |
| Accounting — posting/close | VCEDAX | — | — | — | — | — | — | — | — | — | VA | — | — | VX | — |
| HRM — employee | VCEDX | V | — | — | — | own | V | — | — | — | — | VCE | VCEA | VX | — |
| HRM — attendance | VCEDAX | V | — | — | — | own | V | — | — | — | — | VCE | VCEA | VX | — |
| HRM — leave | VCEDAX | V | own | own | own | own | VA | own | own | own | own | VCE | VCEA | VX | — |
| HRM — payroll | VCEDAX | V | — | — | — | own payslip | — | — | — | V | V | VCE | VCEA | VX | — |
| Reports | VX | VX | VX (sales) | VX (own shift) | VX (POS) | VX (own) | VX (service) | VX (inventory) | VX (purchase) | VX (finance) | VX | VX (HR) | VX (HR) | VX (all) | — |
| Analytics | VX | VX | — | — | V | — | V | — | — | V | VX | — | V | VX | — |
| Settings / Roles | VCEDX | — | — | — | — | — | — | — | — | — | — | — | — | V | — |
| Audit log | VX | V | — | — | — | — | — | — | — | — | V | — | — | VX | — |

This matrix is the **default seed**, not a hard limit — every cell is a permission that can be granted or revoked per role or per user.

### 11.4 Enforcement approach

| Layer | Mechanism |
|---|---|
| Route | `permission:` middleware for coarse gating |
| Controller / Action | Laravel **Policy** per model, invoked with `authorize()` — currently there are **no policies at all** |
| Query | Scope-based row filtering (own shift, assigned jobs, own leave) — replaces today's ad-hoc `if (!$user->hasPermissionTo(...))` filters |
| Field | Sensitive fields (cost price, salary, margin) hidden by an API-resource policy check `[NEW]` |
| Frontend | Same generated permission list shared through Inertia props; navigation and action buttons driven by it — **generated from the same manifest as the backend**, so the R-9/I-50 class of mismatch cannot recur |
| Approval | Approval permissions (`.approve`, `.post`, `.void`) are distinct from edit permissions and always audited |

---

## 12. Audit & Security

| Area | Current state | Proposed |
|---|---|---|
| Audit log | `[VERIFY]` — none. Only `created_by` / `cancelled_by` columns | `[NEW]` A polymorphic `audit_logs` table: actor, action, auditable type/id, before/after payload, IP, user agent, timestamp. Written by a model observer for every auditable model and explicitly for every approval, posting, and permission change |
| Activity history per record | `[VERIFY]` — none | `[NEW]` A timeline view on every document (order, job, PO, journal, employee) built from the audit log plus status-history rows |
| Status history | `[VERIFY]` — none; only the current status is stored | `[NEW]` `*_status_history` tables for order, service job, purchase, payroll run |
| Authentication | `[EXISTS]` Session + OTP; `throttle:5,1` on login; OTP rate limit | Preserve. `[NEW]` Add optional 2FA for staff, forced password rotation for privileged roles, and a session/device list |
| Forgot password | `[VERIFY]` — the `password_reset_tokens` table exists but there is no route or controller | `[NEW]` Implement the standard flow |
| Authorization | `[IMPROVE]` Middleware only; no policies; super-admin hard bypass | Policies on every model; the bypass replaced by an explicit, auditable full grant |
| Sensitive-data protection | `[IMPROVE]` `password`, `otp`, `otp_expires_at` are hidden on the User model | `[NEW]` Encrypt salary, bank details, and national ID at rest; redact them in logs; field-level permission on cost price and margin |
| Financial auditability | `[IMPROVE]` Only the 24-hour expense-deletion rule | `[NEW]` Immutable posted journals, reversal-only corrections, fiscal-period locks, maker/checker on posting, full audit trail (Section 6.4) |
| Transaction history | `[EXISTS]` `stock_transactions` is a good model | Extend the same append-only pattern to money and documents |
| Soft delete | `[VERIFY]` — none anywhere | `[NEW]` Soft deletes on all master data and all transactional documents; hard delete restricted to System Admin and always audited |
| Data consistency | `[IMPROVE]` Locking exists in three places; five relationships lack unique indexes; two duplicate column pairs exist | Unique and foreign-key constraints everywhere, check constraints on money and quantity, idempotency keys on document creation, and a nightly consistency job (Section 14.6) |
| Secrets | `[IMPROVE]` `.env` is committed; `SmsService` reads `env()` at runtime | Remove `.env` from version control, move all config into `config/*.php`, and verify `APP_DEBUG=false` outside local so `otp_preview` is never returned |
| CORS | `[IMPROVE]` `paths => ['*']` with `supports_credentials => true` and an `'*'` origin fallback | Restrict to `api/*` with an explicit allow-list |
| Rate limiting | `[IMPROVE]` Login and OTP only | Per-route rate limits on all write endpoints and all exports |
| API security | `[IMPROVE]` Sanctum installed with no token endpoint; the OTP endpoints are public | Versioned API with token issuing, scoped abilities, and per-token rate limits |

---

## 13. Database Architecture

### 13.1 Core / Shared tables

| Table | Purpose | Key columns | Notes |
|---|---|---|---|
| `parties` | Unified person/organisation | `id`, `type`, `name`, `email`, `phone`, `tax_id` | `[NEW]` |
| `party_roles` | Customer / Supplier / Employee flags | `party_id`, `role`, `code` | `[NEW]` |
| `users` | Login only | `id`, `party_id`, `email`, `phone`, `password`, `is_active` | `[IMPROVE]` — split from Party |
| `addresses` | Polymorphic addresses | `addressable_type/id`, `type`, lines, `city`, `is_default` | `[IMPROVE]` from `user_addresses` |
| `attachments` | Polymorphic files | `attachable_type/id`, `disk`, `path`, `mime`, `size` | `[NEW]` |
| `settings` | Key/value config per scope | `scope`, `key`, `value` | `[NEW]` |
| `document_sequences` | Per-series numbering | `series`, `prefix`, `next_number`, `period` | `[NEW]` — fixes R-7 |
| `audit_logs` | Immutable audit trail | `actor_id`, `action`, `auditable_type/id`, `before`, `after`, `ip` | `[NEW]` |
| `roles`, `permissions`, pivots | Spatie RBAC | — | `[EXISTS]` |
| `notifications` | Database notifications | — | `[EXISTS]` |
| `tax_rules` | Tax master | `code`, `rate`, `type`, `account_id`, validity | `[NEW]` |
| `payment_methods` | Tender master | `code`, `name`, `ledger_account_id`, `is_active` | `[NEW]` |

### 13.2 Catalog

| Table | Status | Notes |
|---|---|---|
| `categories` | `[EXISTS]` | Add `description` (currently in `$fillable` with no column), publishing scope |
| `brands` | `[EXISTS]` | Preserve |
| `units` | `[EXISTS]` | Preserve |
| `attributes`, `attribute_values` | `[EXISTS]` | Add the missing unique index on `attributes.name` |
| `products` | `[IMPROVE]` | Remove `stock` — stock lives on the SKU |
| `product_variants` → `skus` | `[IMPROVE]` | Every product gets at least one SKU; remove the dual stock path (R-1) |
| `sku_attribute_values` | `[EXISTS]` (pivot) | Preserve, including the composite unique index |
| `product_images`, `variant_images` | `[IMPROVE]` | Merge into one polymorphic `attachments`-backed image collection |
| `price_lists`, `price_list_items` | `[NEW]` | Channel and customer-group pricing |

### 13.3 Inventory

| Table | Status | Notes |
|---|---|---|
| `locations` | `[NEW]` | Ships with one default row |
| `stock_movements` | `[IMPROVE]` from `stock_transactions` | Add `location_id`, `unit_cost`, a proper polymorphic reference, and `reversal_of_id` |
| `stock_levels` | `[NEW]` | `(sku_id, location_id)` unique; `on_hand`, `reserved`, `available` |
| `stock_reservations` | `[NEW]` | Cart/order holds with expiry |
| `stock_counts`, `stock_count_lines` | `[NEW]` | Physical stock take |
| `stock_transfers` | `[NEW]` | Location-to-location |
| `inventory_valuations` | `[NEW]` | Period-end cost snapshot |

### 13.4 Sales core (shared by all three channels)

| Table | Status | Notes |
|---|---|---|
| `orders` | `[IMPROVE]` | One `status` column (drop the `order_status`/`status` pair, R-3); `channel` replaces the `type`+`source` pair; drop `billing_address` and `shipping_amount` unless implemented |
| `order_lines` | `[IMPROVE]` from `order_items` | One `sku_id` (drop the `variant_id`/`product_variant_id` pair, R-1); `unit_cost` snapshot fillable (R-2); drop `bonus_quantity` and `price_type` unless implemented |
| `order_status_history` | `[NEW]` | Every transition with actor and reason |
| `order_discounts` | `[NEW]` | Line- and document-level discount attribution |
| `order_taxes` | `[NEW]` | Per-line tax breakdown |
| `tenders` | `[NEW]` | Split payment lines against a sale |
| `shipments`, `shipment_lines` | `[NEW]` | Fulfilment and tracking |
| `returns`, `return_lines` | `[NEW]` | RMA |
| `refunds` | `[NEW]` | Against the original tender |
| `carts`, `cart_lines` | `[IMPROVE]` | Add a guest cart token and the missing unique index |
| `wishlists` | `[EXISTS]` | Add the missing unique index |
| `coupons`, `coupon_redemptions` | `[NEW]` | — |

### 13.5 POS

| Table | Status |
|---|---|
| `pos_terminals` | `[NEW]` |
| `pos_shifts` (open/close, counted cash, variance) | `[NEW]` |
| `pos_cash_movements` (pay-in, payout) | `[NEW]` |
| `pos_held_sales` | `[NEW]` |

### 13.6 Service

| Table | Status |
|---|---|
| `service_categories` | `[NEW]` |
| `service_types` | `[EXISTS]` — add the unique index on `name` |
| `service_jobs` | `[NEW]` — currently a service sale is only an `orders` row |
| `service_job_lines` (labour + parts) | `[IMPROVE]` — parts exist as `order_items.item_type = 'service_part'` |
| `service_job_status_history` | `[NEW]` |
| `serviced_assets` (serial, model, customer) | `[NEW]` |
| `warranties`, `warranty_claims` | `[NEW]` |
| `quotations`, `quotation_lines` | `[NEW]` |

### 13.7 Procurement

| Table | Status |
|---|---|
| `suppliers` | `[EXISTS]` — becomes a party role |
| `purchase_orders` | `[IMPROVE]` from `restock_orders` — add an approval state and a real `cancelled` path |
| `purchase_order_lines` | `[IMPROVE]` from `restock_order_items` |
| `goods_receipts`, `goods_receipt_lines` | `[NEW]` — separate receiving from ordering to allow partial receipt |
| `supplier_bills` | `[NEW]` — AP document distinct from the PO |

### 13.8 Accounting

| Table | Status |
|---|---|
| `fiscal_years`, `fiscal_periods` | `[NEW]` |
| `accounts` (chart of accounts, self-referencing) | `[NEW]` |
| `account_types` | `[NEW]` |
| `journals` (header: date, period, source, memo, posted flag) | `[NEW]` |
| `journal_lines` (account, debit, credit, dimensions) | `[NEW]` |
| `ledger_balances` (per account per period, materialised) | `[NEW]` |
| `bank_accounts`, `bank_reconciliations` | `[NEW]` |
| `payments` | `[EXISTS]` — keep the polymorphic payable, add `ledger_account_id` and link to a journal |
| `expenses`, `expense_categories` | `[EXISTS]` — map categories onto ledger accounts |
| `tax_transactions` | `[NEW]` |

### 13.9 HRM

| Table | Status |
|---|---|
| `employees` | `[IMPROVE]` from `employee_profiles` — add the missing unique index on the party/user key |
| `departments` | `[NEW]` |
| `designations` | `[IMPROVE]` — the table exists but is orphaned |
| `shifts`, `employee_shifts` | `[NEW]` |
| `holidays` | `[NEW]` |
| `attendances` | `[EXISTS]` — enum-backed status (R-17), add `shift_id` |
| `attendance_requests` (late apply, missed punch) | `[NEW]` |
| `leave_types`, `leave_balances` | `[NEW]` |
| `leave_requests` | `[EXISTS]` — add approver and approval timestamp |
| `salary_structures`, `salary_components` | `[NEW]` |
| `payroll_runs` | `[NEW]` — immutable run header (R-16) |
| `payroll_run_lines` | `[IMPROVE]` from `salaries` |
| `payslips` | `[NEW]` |

### 13.10 Reporting & Analytics

| Table | Status | Notes |
|---|---|---|
| `rm_orders`, `rm_order_lines` | `[NEW]` | Denormalised sales read model |
| `rm_stock_levels`, `rm_stock_valuation` | `[NEW]` | Inventory read model |
| `rm_customers` | `[NEW]` | CRM read model with LTV and RFM |
| `rm_service_jobs` | `[NEW]` | Service read model |
| `rm_pos_shifts` | `[NEW]` | POS read model |
| `fact_daily_sales` | `[NEW]` | date × channel × category × brand |
| `fact_daily_inventory` | `[NEW]` | date × sku × location |
| `fact_daily_finance` | `[NEW]` | date × account |
| `fact_daily_hr` | `[NEW]` | date × department |
| `report_schedules`, `saved_views` | `[NEW]` | — |

### 13.11 Indexing strategy

| Category | Rule |
|---|---|
| Foreign keys | Index every FK column |
| Document lookup | Unique on every document number; index `(channel, status, document_date)` on orders |
| Date-ranged reporting | Composite `(document_date, status)` and `(document_date, channel)` |
| Stock | Unique `(sku_id, location_id)` on `stock_levels`; index `(sku_id, created_at)` and `(reference_type, reference_id)` on `stock_movements` |
| Ledger | Index `(account_id, posted_at)`, `(period_id, account_id)`, unique `(source_type, source_id, rule_key)` on journals for idempotency |
| Search | Full-text on `products.name`/`description`; index `sku`, `barcode` (already unique today) |
| Party | Unique `email` and `phone` where not null; index `(role, name)` |
| Attendance / payroll | Unique `(employee_id, date)` and `(employee_id, period)` — both already exist today |
| Audit | Index `(auditable_type, auditable_id, created_at)` and `(actor_id, created_at)` |
| Read models / facts | Cover the exact filter+group columns of each report; keep them narrow and rebuildable |

### 13.12 Duplicate-reduction analysis (explicitly requested)

| Duplication in the current schema | Consolidation |
|---|---|
| `orders.order_status` **and** `orders.status` | One `status` column |
| `orders.type` **and** `orders.source` | One `channel` column (`ecommerce`, `pos`, `service`) |
| `order_items.variant_id` **and** `order_items.product_variant_id` | One `sku_id` |
| `products.stock` **and** `product_variants.stock` | Stock only on the SKU; product-level stock derived |
| `product_images` **and** `variant_images` (identical shape) | One polymorphic image collection |
| Customers in `users`, suppliers in `suppliers`, employees in `employee_profiles` | One `parties` table with roles |
| `orders.customer_name/phone/email` denormalised alongside `user_id` | Keep the snapshot (correct for invoicing) but link to the party; document it as an intentional snapshot |
| `restock_orders` vs. `orders` (near-identical header shape) | Keep separate — sales and purchase documents diverge — but share the numbering, party, tax, and payment infrastructure |
| Hand-built `data/links/meta` pagination in six controllers | One shared paginated-resource class |
| POS and Service store methods duplicating pricing, customer resolution, and order assembly | One `CreateSaleAction` with per-channel strategies |
| `AuthController::login` and `adminLogin` (near-identical) | One action with a channel guard |
| Two profit formulas | One canonical definition sourced from the ledger |

---

## 14. Module Integration

### 14.1 E-commerce flow

```
Customer browses  →  Catalog (product, price list, availability from stock_levels)
        │
        ▼  add to cart
   Cart  ──▶ stock RESERVED (soft, with expiry)                     [NEW]
        │
        ▼  checkout
   ORDER created (channel = ecommerce, status = PENDING)
        │  emits OrderPlaced
        ├──▶ Inventory : confirm reservation
        ├──▶ Accounting: AR + revenue + output tax                  [NEW]
        ├──▶ Notification: staff + customer
        └──▶ Reporting : rm_orders projection
        │
        ▼  payment captured (gateway or COD on delivery)            [gateway NEW]
   PaymentReceived ──▶ Accounting: cash Dr / AR Cr
        │
        ▼  confirm → allocate → ship
   StockMoved (issue) ──▶ Accounting: COGS Dr / Inventory Cr        [NEW]
        │
        ▼  deliver → complete
   Reporting ──▶ Analytics (fact_daily_sales)
        │
        └──▶ return requested  ──▶ RMA ──▶ stock in ──▶ refund      [NEW]
                                            └──▶ Accounting: contra-revenue
```

### 14.2 POS flow

```
Operator opens SHIFT (terminal, opening cash)                       [NEW]
        │
        ▼  scan / search  →  Catalog + stock_levels
   POS cart  →  pricing engine (discount + tax)
        │
        ▼  tender (split payment supported)                         [split NEW]
   ORDER created (channel = pos, status = COMPLETED)
        │  emits SaleCompleted
        ├──▶ Inventory : StockMoved (issue)
        ├──▶ Accounting: cash/card Dr, revenue + tax Cr, COGS Dr / Inventory Cr
        ├──▶ POS shift : running totals per tender
        └──▶ Reporting : rm_orders + rm_pos_shifts
        │
        ▼  close SHIFT (counted cash)                               [NEW]
   Variance ──▶ Accounting: cash over/short
        │
        ▼  Z-report (immutable) ──▶ Reporting ──▶ Analytics
```

### 14.3 Service Sale flow

```
Customer arrives  →  CRM (party) + serviced asset registered        [asset NEW]
        │
        ▼  quotation (optional)                                     [NEW]
   SERVICE JOB created, technician assigned                         [job entity NEW]
        │
        ▼  parts issued  ──▶ Inventory StockMoved (issue)
        ▼  labour logged                                            [NEW]
        │
        ▼  job COMPLETED
   INVOICE issued (labour + parts + tax − discount)
        │  emits InvoiceIssued
        ├──▶ Accounting: AR Dr; service revenue Cr; goods revenue Cr; tax Cr
        │                 parts COGS Dr / Inventory Cr
        └──▶ Reporting : rm_service_jobs
        │
        ▼  payment captured  ──▶ Accounting: cash Dr / AR Cr
        │
        ▼  delivered → closed → warranty window opens               [NEW]
        └──▶ warranty claim ──▶ linked job
```

### 14.4 Procurement flow

```
Purchase Order (draft → approved)                                   [approval NEW]
        │
        ▼  goods receipt (full or partial)                          [partial NEW]
   PurchaseReceived
        ├──▶ Inventory : StockMoved (receipt) at unit cost
        └──▶ Accounting: Inventory Dr + Input Tax Dr / AP Cr
        │
        ▼  supplier bill matched                                    [NEW]
        ▼  payment made ──▶ Accounting: AP Dr / cash Cr
        │
        └──▶ Reporting (purchase report) ──▶ Analytics
```

### 14.5 HRM flow

```
Employee (department, designation, shift, salary structure)
        │
        ▼  attendance (punch / grid / apply)
   Holiday calendar + shift define expected days                    [NEW]
        │
        ▼  leave requested → balance checked → approved
   LeaveApproved ──▶ attendance auto-marked on-leave                [NEW]
        │
        ▼  period locked → payroll run generated → reviewed → approved
   PayrollApproved ──▶ Accounting: salary expense Dr / salary payable Cr   [NEW]
        │
        ▼  disbursed ──▶ Accounting: salary payable Dr / cash Cr
        │
        └──▶ payslips + HR reports ──▶ Analytics (HR KPIs)
```

### 14.6 Cross-cutting consistency jobs `[NEW]`

| Job | Frequency | Check |
|---|---|---|
| Stock reconciliation | nightly | `stock_levels` vs. the sum of `stock_movements` per `(sku, location)` |
| Ledger balance check | nightly | `Σ debit = Σ credit` per period; `ledger_balances` vs. `journal_lines` |
| AR/AP reconciliation | nightly | Sub-ledger totals vs. the control accounts |
| Order totals check | nightly | Header totals vs. the sum of lines, discounts, and taxes |
| Payment reconciliation | nightly | `paid_amount` vs. the sum of successful tenders |
| Read-model drift | nightly | Row counts and checksums vs. the source tables |
| Reservation expiry | every 15 min | Release expired cart reservations |

---

## 15. Recommended Technology Architecture

> The existing stack is sound. The recommendation is to **keep it and structure it properly**, not to replace it. A framework change would add risk without addressing any of the 36 redesign items in §1.15.2.

| Concern | Recommendation | Rationale relative to today |
|---|---|---|
| **Backend** | Laravel 12, PHP 8.3+, **modular monolith** under `app/Modules/<Module>` (or a `nwidart/laravel-modules`-style layout), with the Domain/Application/Infrastructure/Http layering of §2.4 | Today everything lives in flat `app/Http/Controllers/{Web,Accounting,HRM}` with only 2 services and 6 repositories |
| **Business logic** | One Action class per use-case; domain events; queued, idempotent listeners with `afterCommit` | Today logic is inline in controllers; only `StockService` is a real service |
| **Persistence** | Eloquent, repository interfaces per aggregate, strict `$fillable`, model observers for audit | Preserve the repository pattern already started; extend to every module |
| **Database** | MySQL 8 (InnoDB, `utf8mb4`), all money as `DECIMAL(18,4)` or integer minor units, no MySQL-only SQL in the domain layer | Today `DB::raw('IF(...)')` in Reports and Dashboard binds the app to MySQL |
| **Read models** | Same MySQL instance initially; a read replica when volume requires it. Projections rebuilt by queued jobs | Today reports join live transactional tables |
| **API** | Versioned `/api/v1/*` returning JSON via API Resources, Sanctum tokens with abilities, OpenAPI spec generated from the code | Today `routes/api.php` returns Inertia responses and points at a missing method |
| **Frontend** | Keep Inertia 2 + React 18 + TypeScript + Tailwind + Radix. Organise pages by module; a shared component library; typed props generated from backend DTOs; a generated permission union type | Today the structure is flat and permission strings are hand-typed in the sidebar |
| **State** | Inertia for server state; TanStack Query only where genuinely client-driven (POS search, live stock) | TanStack Query is already installed but barely used |
| **Auth** | Session for the web app (`web` guard), Sanctum tokens for the API and any future mobile POS, optional 2FA for staff | Sanctum is installed today with no token endpoint |
| **Authorization** | Policies + generated permission registry + `permission:` middleware | No policies exist today |
| **Queue** | Redis in production (database driver acceptable for local). Named queues: `default`, `accounting`, `projections`, `notifications`, `exports`. Horizon for visibility | Today everything is on the `database` driver with one queue |
| **Cache** | Redis. Tagged caches for the permission registry, settings, catalog, and report results | Today the cache uses the database driver |
| **Notifications** | Database (in-app) `[EXISTS]` + mail `[NEW]` + SMS via the existing gateway abstraction `[EXISTS]`. Per-user preferences `[NEW]` | Today only the database channel is used, and only for one event |
| **File storage** | S3-compatible object storage in production, `public` disk locally; all access through a `MediaService` with a signed-URL option | Today images are on the `public` disk with hard-coded `/storage/...` paths |
| **Logging** | Structured JSON logs, correlation ID per request, separate `audit` and `accounting` channels, error tracking (Sentry or equivalent) | Today it is the default stack channel with ad-hoc `Log::error` in `SmsService` |
| **Scheduled tasks** | `routes/console.php` + a scheduler: nightly aggregation, consistency jobs, reservation expiry, scheduled reports, backups, log rotation | `routes/console.php` is effectively empty today |
| **Config** | Everything through `config/*.php` so `config:cache` is safe; no runtime `env()` | `SmsService` uses runtime `env()` today |
| **Testing** | Pest or PHPUnit: unit tests on domain and pricing, feature tests per action, integration tests for accounting posting rules and stock movements, a permission matrix test, Playwright for critical UI paths | Two Laravel skeleton tests today |
| **CI/CD** | Pipeline running Pint, PHPStan/Larastan level 6+, the test suite, a migration dry-run, and the frontend build | None today |

### 15.1 Laravel best-practice checklist for this rebuild

1. Thin controllers — validate, authorize, delegate to an Action, return a response.
2. Form Requests for every write, with real `authorize()` logic (all current ones return `true`).
3. Policies on every model; `authorize()` in every controller action.
4. API Resources for every JSON response; never return raw models.
5. Events + queued, idempotent listeners for cross-module effects; never call another module's controller or model.
6. `DB::transaction()` around every multi-write action, with `afterCommit` event dispatch.
7. Strict types, enums for every status column, casts for money and dates.
8. Repository interfaces bound in each module's ServiceProvider, not in a single global provider.
9. No `env()` outside `config/`.
10. Route model binding with scoped bindings; no manual `findOrFail` in controllers.
11. Eager loading declared per query; a query-count assertion in tests to prevent N+1 regressions (fixes R-27).
12. Database transactions never wrap HTTP calls; external calls go through queued jobs (the existing `SendSmsJob` is the right pattern).

---

# PART C — EXECUTION

## 16. Rebuild Strategy

### 16.1 Approach

**Strangler-fig, not big-bang.** The new modular structure is built alongside the current application inside the same repository. Modules are cut over one at a time behind feature flags. The current UI keeps working until each module's replacement is accepted.

**Rationale from the analysis:** three sales channels already share `orders`/`order_items`, and `StockService` is already the single stock chokepoint. That makes the Catalog/Inventory/Sales core the natural first cut, and it means Accounting can be introduced as an *event consumer* without touching the sales code again.

### 16.2 Phase order (reordered from the generic sequence, with justification)

| Phase | Name | Contents | Why here |
|---|---|---|---|
| **0** | **Stabilise & Prepare** | Fix the correctness defects that corrupt data today: variant stock (R-1), order-line cost snapshot (R-2), POS totals mismatch (R-6), permission catalogue (R-9). Remove repository junk. Set up CI, Pint, PHPStan, and a test harness. Baseline data-quality report | **Every later phase migrates this data.** Migrating corrupted variant stock and zeroed costs into a new system multiplies the problem. This phase is short and pays for itself immediately |
| **1** | **Foundation / Shared Kernel** | Module skeleton and service providers, Party model, User split, addresses, attachments, settings, document numbering, audit log, soft deletes, permission registry generator, policies, notification channels, queue/cache/storage/logging configuration | Everything else depends on it |
| **2** | **Catalog + Inventory** | Product/SKU consolidation, price lists, locations, stock ledger with reservations, `stock_levels` projection, stock counts and transfers | Sales cannot be rebuilt on the current dual stock path |
| **3** | **CRM + Procurement** | Customer and supplier as party roles, purchase order with approval, goods receipt, supplier bill | Supplies the cost side that Accounting needs, and the customer side that all three channels need |
| **4** | **Sales Core** | Order aggregate, state machine, status history, pricing engine (discount + tax), tender model, returns and refunds, numbering, invoice documents | The shared spine for all three channels — build once |
| **5** | **Accounting** | Chart of accounts, fiscal periods, journal, ledger, AR/AP, bank, tax, posting listeners for every event emitted in phases 2–4, financial statements | **Moved ahead of the channels.** Posting rules must exist before channel cutover, otherwise every channel is migrated twice |
| **6** | **POS** | Terminal, shift, cash drawer, hold/resume, split tender, returns, receipt, X/Z reports, offline-capable product search | Highest daily transaction volume; needs Sales core + Accounting in place |
| **7** | **E-commerce** | Storefront on the new catalog, guest cart token, checkout with discount/tax/shipping, coupon, campaign, RMA, payment gateway | Largest surface area; benefits from POS having proved the Sales core |
| **8** | **Service Sale** | Service job entity and lifecycle, quotation, serviced asset, warranty, technician assignment, labour vs. parts split | Depends on Sales core, Inventory, and HRM technicians |
| **9** | **HRM** | Department, designation, shift, holiday, attendance apply, late apply, leave balance, salary structure, immutable payroll runs, payslips, payroll → Accounting posting | Independent of sales; can run in parallel with 6–8 if staffing allows |
| **10** | **Reporting** | Read models, projectors, report registry, all reports in §8.2, export pipeline, scheduling, saved views | Needs every source module to emit events |
| **11** | **Analytics** | Fact tables, aggregators, KPI definitions, management dashboard, trends and forecasting | Needs Reporting read models |
| **12** | **Integration, Optimisation & QA** | End-to-end integration tests, permission matrix tests, load testing, index tuning, consistency jobs, security review, documentation, training | Final hardening |

### 16.3 Parallelisation

```
Phase 0  ──────▶ Phase 1
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
  Phase 2       Phase 3       Phase 9 (HRM — independent, can start early)
      │             │
      └──────┬──────┘
             ▼
         Phase 4 (Sales Core)
             │
             ▼
         Phase 5 (Accounting)
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
  Phase 6  Phase 7  Phase 8
   (POS)  (E-comm) (Service)
      └──────┼──────┘
             ▼
         Phase 10 (Reporting)
             ▼
         Phase 11 (Analytics)
             ▼
         Phase 12 (Hardening)
```

**Critical path:** 0 → 1 → 2 → 4 → 5 → 6 → 10 → 12. HRM (9) and Procurement (3) are off the critical path.

### 16.4 Exit criteria per phase

Every phase is complete only when all of the following hold:

1. All `[EXISTS]` behaviour listed for that module in §1.15.1 is preserved and covered by a feature test.
2. Every redesign item assigned to the phase from §1.15.2 is closed.
3. Migration scripts for the phase's data run clean on a production-sized copy.
4. The permission matrix test passes for every role touched by the phase.
5. No N+1 regression (query-count assertions).
6. Consistency jobs for the phase report zero drift.
7. Documentation and a rollback plan exist.

---

## 17. Migration Strategy

### 17.1 Principles

| Principle | Detail |
|---|---|
| Migrate per phase | Data moves when its module cuts over, not in one final event |
| Idempotent and re-runnable | Every migration script can run repeatedly without duplicating rows; keyed on a `legacy_id` column carried on every migrated table |
| Read-only source | Migration reads a snapshot; the live system is never mutated by a migration script |
| Reconcile every run | Row counts, sum totals, and spot checks compared source vs. target after every run |
| Fix-forward with a rollback | Each cutover has a documented rollback to the previous module version; data written after cutover is replayed if a rollback occurs |

### 17.2 Data mapping

| Source (current) | Target (new) | Transformation | Risk |
|---|---|---|---|
| `users` (customers) | `parties` + `party_roles(customer)` + `users` | Split identity from login; users with `password = null` become login-less parties | Medium — phone/email uniqueness collisions |
| `users` (staff) | `parties` + `party_roles(employee)` + `users` + `employees` | Merge with `employee_profiles` | Medium |
| `suppliers` | `parties` + `party_roles(supplier)` | Direct | Low |
| `categories`, `brands`, `units` | Same tables | Direct; add the `description` column | Low |
| `attributes`, `attribute_values`, pivot | Same tables | Direct; add the missing unique index (de-duplicate names first) | Low |
| `products` (simple) | `products` + one implicit `skus` row | **Create a SKU per simple product**; move `stock`, `sku`, `barcode`, prices to the SKU | **High** — schema shape change |
| `product_variants` | `skus` | Direct | Medium |
| `products.stock` + `product_variants.stock` | `stock_levels` at the default location | **Recompute from `stock_transactions` where possible; otherwise take the current value and post an opening-balance adjustment** | **High** — variant stock is known-wrong today (R-1) |
| `stock_transactions` | `stock_movements` | Add `location_id` (default), map the reference pair, backfill `unit_cost` where derivable | Medium — `product_variant_id` is always NULL today |
| `product_images`, `variant_images` | Unified image collection | Direct; re-point paths if storage moves to S3 | Low |
| `carts` | `carts` + `cart_lines` | Direct; may be discarded instead (`[VERIFY]` business call) | Low |
| `wishlists` | Same | De-duplicate before adding the unique index | Low |
| `orders` (`type=sales, source=online`) | `orders` with `channel = ecommerce` | Collapse `order_status`/`status` to one column; map to the new state machine | Medium |
| `orders` (`source=pos`) | `orders` with `channel = pos` | Same; no shift linkage available — assign to a synthetic migrated shift | Medium |
| `orders` (`type=service`) | `orders` with `channel = service` **and** a `service_jobs` row | Job status set to `CLOSED`; technician from `technician_id`; `service_type` free text matched to `service_types` by name, unmatched values create a type | Medium |
| `order_items` | `order_lines` | Collapse `variant_id`/`product_variant_id` to `sku_id`; **backfill `unit_cost` from `products.cost_price` and flag the row as an estimate** (it is `0` for every existing row, R-2) | **High** — historical margin cannot be recovered exactly |
| `orders.paid_amount`, `payment_status` | `tenders` + derived status | Create one synthetic tender per order with a non-zero `paid_amount` | Medium |
| `restock_orders`, `restock_order_items` | `purchase_orders`, `purchase_order_lines`, and a `goods_receipts` row for `received` POs | Direct | Low |
| `expense_categories` | `accounts` under 6100 + `expense_categories` retained as an analytic dimension | **Requires a mapping decision per category** | Medium |
| `expenses` | `expenses` + a journal entry per row | Post to the mapped account with the original date | Medium |
| `payments` | `payments` + a journal entry per row | Map `payment_method` to a cash/bank account; direction from `type` | Medium |
| **Opening balances** | `journals` (opening entry) | **A single opening journal as of the cutover date**: inventory value, AR (from open dues), AP (from open supplier dues), cash/bank (`[VERIFY]` — actual balances are not in the system), equity as the balancing figure | **High** — needs finance sign-off |
| `employee_profiles` | `employees` | Direct; add department and designation (`[VERIFY]` — not in the system) | Medium |
| `attendances` | `attendances` | Map free-text status onto the enum; **unmapped values require a decision list** | Medium |
| `leave_requests` | `leave_requests` | Direct; approver unknown for historical rows | Low |
| `salaries` | `payroll_runs` + `payroll_run_lines` | One migrated run per distinct `month_year` | Low |
| `roles`, `permissions` | Regenerated from the manifest | **Not migrated** — re-granted from the new matrix, with a report of any custom grants in the old system | Medium |
| `notifications` | Same | Direct, or archived | Low |

### 17.3 Duplicate handling

| Duplicate class | Resolution |
|---|---|
| Same customer as multiple `users` rows (different phone/email) | Match on normalised phone, then email; produce a merge candidate list for manual review; merge keeps the oldest party and re-points orders |
| A supplier who is also a customer | Merge into one party with two roles |
| Duplicate `attributes.name` / `service_types.name` (no DB index today) | Merge, re-point references, then add the unique index |
| Duplicate `wishlists` / `carts` rows | Sum quantities (cart) or keep the earliest (wishlist), then add the unique index |
| Multiple `employee_profiles` per user (no unique index today) | Keep the most recent, archive the rest |
| Order numbers colliding across `POS-`/`SRV-` series (R-7) | The unique index prevents them today; the migration re-issues numbers only if a collision is found, keeping the old number in `legacy_number` |

### 17.4 Validation

| Check | Method |
|---|---|
| Row counts | Source vs. target per table, per phase |
| Financial totals | Σ `orders.total_amount`, Σ `payments.amount`, Σ `expenses.amount` must match to the cent |
| Stock | `stock_levels` after migration vs. the current `products.stock` (with a documented, signed-off variance list for variant products, which are known-wrong today) |
| Referential integrity | Zero orphan FKs after migration |
| Ledger | Opening journal balances; trial balance equals zero |
| Spot checks | 20 orders per channel, 20 products with variants, 10 employees, 10 POs — compared field by field |
| Report parity | Run the old and new sales reports over the same date range and reconcile; **expect a documented difference for profit** (cost snapshot, R-2) and for revenue (cancelled orders now excluded, R-12) |

### 17.5 Migration testing

1. **Dry run** on an anonymised production copy; capture timing and the full reconciliation report.
2. **Repeat run** on the same copy to prove idempotency.
3. **Delta run** — migrate, let the source run for a day, then migrate only the delta.
4. **Rehearsal cutover** with the full runbook, timed end to end.
5. **Rollback rehearsal** — execute the rollback and confirm the old system is fully operational.

### 17.6 Rollback strategy

| Level | Trigger | Action |
|---|---|---|
| Per-phase feature flag | A defect found after cutover, no new data written | Toggle the flag back to the legacy module |
| Per-phase with new data | Defect found after new data exists | Replay the new-module writes into the legacy schema using the `legacy_id` mapping, then toggle back |
| Full cutover rollback | Critical failure during the final cutover window | Restore the pre-cutover database snapshot; the source system is untouched by migration scripts by design |
| Point of no return | Defined per phase (typically the first accounting period closed in the new system) | Documented in the runbook; after this point only fix-forward |

---

## 18. Final Rebuild Roadmap

### 18.1 Existing vs. proposed architecture

| Dimension | Existing | Proposed |
|---|---|---|
| Structure | Flat Laravel app, 3 controller namespaces | Modular monolith, 13 modules with enforced boundaries |
| Business logic | In controllers; 2 services | Actions per use-case; domain events; queued listeners |
| Data access | 6 repositories, 14 modules using raw Eloquent in controllers | Repository interface per aggregate, consistently applied |
| Sales channels | 3 channels sharing `orders` with `type` + `source` | 3 channels sharing a Sales core with one `channel` discriminator |
| Stock | Dual path (product stock + variant stock), variant path broken | Single SKU-level ledger with reservations and locations |
| Accounting | Cash log with 3 reports | Double-entry ledger with fiscal periods, immutable journals, and statements |
| Status | 2 mirrored columns; unrestricted transitions | One enum column per lifecycle; declared state machine; history table |
| Permissions | 2 contradictory seeders; super-admin hard bypass; no policies | One generated registry; policies on every model; explicit, auditable full grant |
| Reporting | Live joins on transactional tables | Read models + fact tables, report registry, unified export |
| Analytics | 4 dashboard charts | Fact tables, KPI set, management dashboard, forecasting |
| Audit | `created_by` columns | Full audit log + status history + immutable financial documents |
| Deletes | Permanent everywhere | Soft deletes with audited hard delete |
| API | Inertia responses on `api.php`; one broken route | Versioned JSON API with Sanctum abilities and an OpenAPI spec |
| Tests | 2 skeleton tests | Unit + feature + integration + permission matrix + E2E in CI |

### 18.2 Module list and priority

| Priority | Module | Phase | Depends on |
|---|---|---|---|
| P0 | Shared Kernel | 1 | — |
| P0 | Catalog | 2 | Shared |
| P0 | Inventory | 2 | Shared, Catalog |
| P0 | Sales Core | 4 | Shared, Catalog, Inventory, CRM |
| P0 | Accounting | 5 | Shared, events from 2–4 |
| P1 | CRM | 3 | Shared |
| P1 | Procurement | 3 | Shared, Catalog, Inventory |
| P1 | POS | 6 | Sales Core, Inventory, Accounting |
| P1 | E-commerce | 7 | Sales Core, Catalog, Inventory, CRM |
| P1 | Service Sale | 8 | Sales Core, Inventory, HRM |
| P2 | HRM | 9 | Shared |
| P2 | Reporting | 10 | all source modules |
| P3 | Analytics | 11 | Reporting |

### 18.3 Strategy summary

| Strategy | Statement |
|---|---|
| **Database** | Normalised transactional core + denormalised read models. All money `DECIMAL(18,4)`, all statuses enum-backed, soft deletes everywhere, `legacy_id` on every migrated table, indexes designed per §13.11, and a nightly consistency job suite |
| **API** | Inertia remains the primary web transport. A versioned `/api/v1` JSON API is added for POS terminals, future mobile apps, and integrations, using API Resources, Sanctum abilities, and a generated OpenAPI spec |
| **Frontend** | Inertia + React + TypeScript retained. Pages organised per module, a shared component library, props typed from backend DTOs, permissions from a generated union type, and one design system across the storefront and back office |
| **Permission** | `<module>.<resource>.<action>`, generated from a manifest into both the PHP seeder and the TypeScript type, enforced by route middleware + model policies + query scopes + field-level resource checks |
| **Reporting** | One report registry; every report declares source, filters, columns, aggregations, and exports; read models only; one document-date convention; cancelled documents excluded by default |
| **Analytics** | Idempotent, re-runnable daily aggregators feeding fact tables; a defined KPI set; cached query results; late-arriving corrections trigger targeted re-aggregation |
| **Accounting integration** | Every module emits domain events; Accounting owns the posting rules; posting is idempotent on `(source_type, source_id, rule_key)`; posted journals are immutable and corrected only by reversal; periods lock |
| **Data migration** | Per-phase, idempotent, reconciled, with `legacy_id` traceability and a rehearsed rollback |
| **QA** | Unit tests on the domain; feature tests per action; integration tests for every accounting posting rule and every stock movement path; a permission matrix test covering every role × module cell; query-count assertions against N+1; E2E on the critical paths (checkout, POS sale, service invoice, payroll run, month-end close); load tests on POS and reporting |
| **Deployment** | Feature-flagged module cutover; blue/green or rolling deploys; zero-downtime migrations (expand → backfill → contract); queue workers under Horizon; scheduled tasks under supervision; automated backups with a rehearsed restore |
| **Future scalability** | Read replica for reporting; Redis for cache, queue, and sessions; object storage for media; module boundaries clean enough that any module can be extracted into a service later; multi-location and multi-currency modelled from day one even if a single location and currency ship first |

### 18.4 Phase-wise implementation plan

| Phase | Deliverables | Key exit criteria |
|---|---|---|
| **0 — Stabilise** | Correctness fixes (R-1, R-2, R-6, R-9), repository cleanup, CI + Pint + PHPStan + test harness, data-quality baseline report | Variant stock correct going forward; POS totals match; a fresh install grants working permissions to `admin`; CI green |
| **1 — Foundation** | Module skeleton, Party, User split, addresses, attachments, settings, numbering, audit log, soft deletes, permission generator, policies, queue/cache/storage/logging | A new module can be scaffolded and registered; audit log captures every write; permission matrix test runs |
| **2 — Catalog + Inventory** | Product/SKU model, price lists, locations, stock ledger, reservations, `stock_levels`, counts, transfers | Stock reconciliation job reports zero drift; every existing catalog feature preserved |
| **3 — CRM + Procurement** | Customer and supplier as party roles, PO with approval, goods receipt, supplier bill | Duplicate-party merge report reviewed and applied; partial receipt works |
| **4 — Sales Core** | Order aggregate, state machine, status history, pricing engine, tenders, returns, refunds, numbering, invoices | Every transition audited; totals check job clean; concurrent numbering test passes |
| **5 — Accounting** | CoA, fiscal periods, journal, ledger, AR/AP, bank, tax, posting listeners, statements | Trial balance balances; posting is idempotent under event replay; opening journal signed off by finance |
| **6 — POS** | Terminal, shift, cash drawer, hold/resume, split tender, returns, receipt, X/Z reports | A full shift open→sale→return→close→Z cycle posts correctly to Accounting; offline search acceptable |
| **7 — E-commerce** | Storefront, guest cart, checkout with discount/tax/shipping, coupon, campaign, RMA, payment gateway | Checkout totals match the ledger; overselling prevented by reservations |
| **8 — Service Sale** | Service job lifecycle, quotation, serviced asset, warranty, technician assignment | Labour vs. parts revenue split correct in both the ledger and reporting |
| **9 — HRM** | Department, designation, shift, holiday, attendance/late apply, leave balance, salary structure, immutable payroll, payslips, payroll posting | A payroll run cannot be regenerated once approved; approved leave reflects in attendance and payroll |
| **10 — Reporting** | Read models, projectors, report registry, the full report catalogue, exports, scheduling, saved views | Every report in §8.2 delivered with summary + detail + export; read-model drift job clean |
| **11 — Analytics** | Fact tables, aggregators, KPI definitions, management dashboard, forecasting | Aggregators are idempotent and re-runnable for any date range; dashboard loads within the agreed budget |
| **12 — Hardening** | E2E suite, permission matrix, load tests, index tuning, consistency jobs, security review, documentation, training | All exit criteria from every phase re-verified on production-sized data |

---

## Appendix A — Traceability: redesign item → phase

| Item | Description | Phase |
|---|---|---|
| R-1 | Variant stock never decrements | 0 (hotfix) → 2 (structural) |
| R-2 | Order line cost snapshot | 0 (hotfix) → 4 |
| R-3 | Dual order status columns | 4 |
| R-4 | No transition matrix | 4 |
| R-5 | Stock on cancel/uncancel | 4 |
| R-6 | POS totals mismatch | 0 (hotfix) → 6 |
| R-7 | POS/SRV numbering collisions | 1 |
| R-8 | POS payment capture | 6 |
| R-9 | Permission catalogue | 0 (hotfix) → 1 |
| R-10 | Accounting authorisation granularity | 1 → 5 |
| R-11 | Accounting model | 5 |
| R-12 | Two profit definitions | 5 → 10 |
| R-13 | Report date basis | 10 |
| R-14 | Storefront `is_active` filter | 2 → 7 |
| R-15 | Storefront price filter | 2 → 7 |
| R-16 | Payroll regeneration overwrites paid | 9 |
| R-17 | Attendance status enum | 9 |
| R-18 | Leave → attendance → payroll link | 9 |
| R-19 | Employee `is_active` on update | 9 |
| R-20 | Attribute update deletes all values | 2 |
| R-21 | Product image replacement | 2 |
| R-22 | Variant SKU uniqueness on update | 2 |
| R-23 | Discount ceiling | 4 |
| R-24 | Supplier search grouping | 3 |
| R-25 | Guest cart | 7 |
| R-26 | Full-table loads | 2, 6, 7 |
| R-27 | N+1 wishlist checks | 7 |
| R-28 | Global Inertia share cost | 1 |
| R-29 | Soft deletes | 1 |
| R-30 | Audit trail | 1 |
| R-31 | API surface | 1 → 12 |
| R-32 | Missing DB constraints | 1, 2 |
| R-33 | Test coverage | 0 → all |
| R-34 | Registration flow | `[VERIFY]` → 7 |
| R-35 | `env()` at runtime | 1 |
| R-36 | Inconsistent repository layering | 1 → all |

## Appendix B — Open decisions blocking the plan

These must be answered before Phase 1 begins. Each is `[VERIFY]` — the codebase does not contain the answer.

1. Email/password self-registration: build or drop? (R-34)
2. Should `admin` reach POS and Accounting by default? (Section 11.3 seed)
3. Authoritative profit definition: cash basis or accrual/margin? (R-12, Section 6)
4. Single currency (BDT) or multi-currency?
5. Business domain: automotive, general retail + repair, or both? (Affects the catalog and service taxonomy)
6. Single location or multi-warehouse from day one? (Section 10.2)
7. Is POS receipt printing required, and on what hardware?
8. Is POS offline mode required?
9. Opening balances for cash and bank accounts as of the cutover date — not present in the system (Section 17.2)
10. Department and designation structure — not present in the system (Section 13.9)
11. Leave entitlement policy per leave type — not present in the system
12. Working-week and holiday calendar — not present in the system (payroll currently divides by calendar days)
13. Which payment gateway(s), if any?
14. Tax regime and rates — currently a manual per-document percentage
15. Do `Software Requirements Specification (SRS).pdf` and `Detailed_Implementation_Plan.md` in the repository root add requirements not present in the code? **These were not analysed for this document.**

---

*End of rebuild plan.*

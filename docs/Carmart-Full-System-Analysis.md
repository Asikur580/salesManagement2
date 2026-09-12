# Carmart Full System Analysis

> **Scope of this document.** This is a complete functional and technical analysis of the `Carmart` codebase (working directory `D:\Test\carMart`, branch `dev-a`). Every statement below is derived from the actual source code in the repository. Where the codebase does not contain the information, the item is explicitly marked **Not Found / Requires Verification**. No functionality has been assumed or invented.
>
> **Audience.** Developers, QA engineers, and project managers.
>
> **Terminology note.** The repository uses several names for itself: the folder is `carMart`, `resources/views/app.blade.php` falls back to the title `CarMart`, `README.md` calls the project "Sales Management System", the dashboard sidebar brand label is `SalesHub`, and `.env.example` uses the database name `salesmanagement`. This document uses **Carmart** for the system as a whole and preserves the original terminology of each module (POS, Service Invoice, Restock Order, HRM, Accounting, etc.).

---

## 1. System Overview

Carmart is a combined **e-commerce storefront + back-office ERP** built as a single Laravel application with a React single-page frontend delivered through Inertia.js.

The system serves two distinct audiences from the same codebase:

| Audience | Entry point | Layout | Purpose |
|---|---|---|---|
| Public / customers | `/` (`shop.index`) | `ShopLayout` | Browse catalog, search, wishlist, cart, checkout, self-service account |
| Staff / administrators | `/dashboard` | `DashboardLayout` | POS, service invoicing, order fulfilment, catalog, inventory, HRM, accounting, reports, RBAC |

Functional areas present in the code:

1. Public storefront (home, new arrivals, flash sales, brands, categories, product detail, search)
2. Customer account (profile, password, addresses, order history, invoice download, order cancellation, wishlist)
3. Cart and checkout (guest session cart + authenticated DB cart)
4. Authentication (password login, separate admin login, phone OTP login with auto-registration)
5. Product Management System (products, variants, attributes, attribute values, units, images, barcode/SKU lookup)
6. Brand and Category management (with parent/child category tree)
7. Point of Sale (POS)
8. Service Invoice module (with Service Types CRUD and technician assignment)
9. Order Management (listing, detail, status update, PDF invoice)
10. Inventory (stock transactions ledger, manual adjustment, low/out-of-stock detection)
11. Supplier and Restock Order (purchase order) management
12. Accounting (expense categories, expenses, payments, customer/supplier dues, daily sales, profit & loss, cashbook)
13. HRM (employees, attendance grid, leave requests, payroll generation)
14. Reports (sales summary, source split, top products, profit, PDF/CSV export)
15. Roles, Permissions, and per-user permission overrides
16. Database notifications
17. SMS gateway integration (Greenweb or Twilio) via queued job

**Business domain observation.** The `ServiceTypeSeeder` seeds service types such as `Engine Repair`, `AC Service`, `Laptop Screen Replacement`, `CCTV Installation`, and `Network Setup`. The domain is therefore a general retail + repair-service shop rather than strictly automotive, despite the `carMart` folder name.

---

## 2. Architecture Overview

### 2.1 Stack

| Layer | Technology | Version constraint (from manifests) |
|---|---|---|
| Language | PHP | `^8.2` |
| Framework | Laravel | `^12.0` |
| SPA bridge | `inertiajs/inertia-laravel` | `^2.0` |
| API tokens | `laravel/sanctum` | `^4.0` |
| RBAC | `spatie/laravel-permission` | `^6.21` |
| PDF | `barryvdh/laravel-dompdf` | `^3.1` |
| Named routes in JS | `tightenco/ziggy` | `^2.6` (`@routes` directive in `app.blade.php`) |
| Frontend | React 18 + TypeScript, `@inertiajs/react` `^2.3.13` | — |
| UI kit | Radix UI primitives + Tailwind CSS `^3.4.19` + `tailwindcss-animate` (shadcn/ui style) | — |
| Charts | `recharts` `^2.15.1` | — |
| Forms/validation (client) | `react-hook-form`, `zod`, `@hookform/resolvers` | — |
| Data fetching | `@tanstack/react-query` (provider mounted in `app.tsx`) | — |
| Toasts | `@radix-ui/react-toast` + `sonner` (both mounted) | — |
| Build | Vite `^7` + `laravel-vite-plugin` `^2` | — |
| Database | MySQL (`DB_CONNECTION=mysql`) | — |

### 2.2 Request lifecycle

```
Browser
   |
   v
routes/web.php  (web middleware group)
   |
   +-- HandleInertiaRequests  -> shares auth, flash, categories, cart, wishlist_count on EVERY response
   |
   +-- role: / permission:    -> Spatie middleware aliases registered in bootstrap/app.php
   |
   v
Controller (App\Http\Controllers\{Web|Accounting|HRM})
   |
   +-- FormRequest validation (Brand, Category, Product, Supplier, Unit, Attribute) or inline $request->validate()
   |
   +-- Repository (Brand, Category, Product, Unit, Supplier, Wishlist)  OR  direct Eloquent
   |
   +-- Service (StockService, SmsService)
   |
   v
Inertia::render('PageName', props)  ->  resources/js/Pages/PageName.tsx
```

### 2.3 Layering

* **Repository pattern (partial).** Interfaces live in `app/Repositories/Interfaces/`; bindings are split across two providers:
  * `AppServiceProvider::register()` binds `Brand`, `Category`, `Product`, `Unit`.
  * `RepositoryServiceProvider::register()` binds `Wishlist`, `Supplier`.
  * All other modules (Order, POS, Service Invoice, Inventory, Restock, HRM, Accounting, Reports) call Eloquent directly from the controller.
* **Service layer.** Only two services exist: `App\Services\StockService` (all stock mutations and the stock ledger) and `App\Services\SmsService` (SMS gateway abstraction).
* **Jobs.** One job: `App\Jobs\SendSmsJob` (queued, dispatched from OTP send).
* **Notifications.** Two database notifications: `OrderCreatedNotification`, `OrderApprovedNotification`.
* **Policies / Gates.** None defined. Authorization is entirely route/controller middleware + inline `hasRole()` / `hasPermissionTo()` checks. All `FormRequest::authorize()` methods return `true`.

### 2.4 Global bootstrap configuration (`bootstrap/app.php`)

* `redirectUsersTo` — authenticated users hitting a guest route are sent to `dashboard` when they hold `super-admin|admin|sales|accountant`, otherwise to `shop.index`.
* Middleware appended to the `web` group: `HandleInertiaRequests`, `AddLinkHeadersForPreloadedAssets`.
* Middleware aliases registered: `role`, `permission`, `role_or_permission`.
* `withExceptions` is empty — no custom exception rendering (so a Spatie `UnauthorizedException` surfaces as the framework default 403).

### 2.5 Shared Inertia props (`HandleInertiaRequests::share`)

Every Inertia response carries:

| Prop | Content |
|---|---|
| `auth.user` | `id`, `name`, `email`, `phone`, `roles` (names), `permissions` (all effective permission names), `unread_count`, `notifications` (latest 10) |
| `flash` | `success`, `error`, `message` |
| `categories` | Root categories with 2 levels of children and `products_count` on each level |
| `cart` | `items[]`, `count`, `total` — read from `carts` table for authenticated users, from `session('cart')` for guests |
| `wishlist_count` | Integer, `0` when unauthenticated |

This is the single source of truth for the frontend's permission-driven navigation (`Sidebar.tsx` reads `user.permissions`).

---

## 3. Module Overview

| # | Module | Primary controllers | Main tables | Dashboard route prefix |
|---|---|---|---|---|
| 1 | Storefront | `Web\ShopController` | products, categories, brands | `/` (public) |
| 2 | Authentication & OTP | `Web\AuthController` | users | `/login`, `/admin/login`, `/api/auth/*` |
| 3 | Customer Account | `Web\AccountController` | orders, user_addresses, users | `/my-account` |
| 4 | Cart & Checkout | `CartController`, `Web\CheckoutController` | carts, orders, order_items | `/cart`, `/checkout` |
| 5 | Wishlist | `WishlistController` | wishlists | `/wishlist` |
| 6 | Product Management | `Web\ProductController`, `AttributeController`, `UnitController` | products, product_variants, attributes, attribute_values, product_images, variant_images | `/products`, `/attributes`, `/units` |
| 7 | Brand | `Web\BrandController` | brands | `/brands` |
| 8 | Category | `Web\CategoryController` | categories | `/categories` |
| 9 | POS | `Web\PosController` | orders, order_items, stock_transactions, users | `/pos` |
| 10 | Service Invoice | `Web\ServiceInvoiceController`, `ServiceTypeController` | orders, order_items, service_types | `/services`, `/service-types` |
| 11 | Order Management | `Web\OrderController` | orders, order_items | `/orders` |
| 12 | Inventory | `Web\InventoryController` | stock_transactions, products, product_variants | `/inventory` |
| 13 | Supplier | `Web\SupplierController` | suppliers | `/suppliers` |
| 14 | Restock Order | `Web\RestockOrderController` | restock_orders, restock_order_items | `/restock-orders` |
| 15 | Accounting | `Accounting\{ExpenseCategory,Expense,Payment,Report}Controller` | expense_categories, expenses, payments | `/accounting` |
| 16 | HRM | `HRM\{Employee,Attendance,Leave,Payroll}Controller` | employee_profiles, attendances, leave_requests, salaries | `/hrm` |
| 17 | Reports | `Web\ReportController` | orders, order_items, products | `/reports` |
| 18 | RBAC | `Web\RoleController`, `PermissionController`, `UserController`, `UserPermissionController` | roles, permissions, model_has_*, role_has_permissions | `/roles`, `/permissions`, `/users` |
| 19 | Notifications | `Web\NotificationController` | notifications | `/notifications` |
| 20 | Dashboard | `Web\DashboardController` | orders, order_items, products, users | `/dashboard` |

---

## 4. Module-wise Detailed Analysis

### 4.1 Storefront (Public Shop)

**Purpose.** Anonymous and authenticated product discovery.

**Pages / screens**

| Route | Name | Inertia page |
|---|---|---|
| `GET /` | `shop.index` | `Index` |
| `GET /new-arrivals` | `shop.new-arrivals` | `NewArrivalsPage` |
| `GET /flash-sales` | `shop.flash-sales` | `Shop/FlashSalePage` |
| `GET /shop/offers` | `shop.offers` | `Shop/FlashSalePage` (same controller method `flashSales`) |
| `GET /all-brands` | `shop.all-brands` | `BrandsPage` |
| `GET /brand/{brand:slug}` | `shop.brand` | `Shop/BrandProductsPage` |
| `GET /category/{category:slug}` | `shop.category` | `CategoryPage` |
| `GET /product/{product:slug}` | `shop.product.show` | `ProductDetails` |
| `GET /search` | `shop.search` | `SearchPage` |

**Main features**
* Home page composes three product rails: `flashSaleProducts` (6, `inRandomOrder`), `newArrivals` (10, `latest`), `youMayLike` (12, `inRandomOrder`), plus root categories (2 child levels) and 20 brands.
* Every product collection has the appended accessors `price` and `old_price` and, for authenticated users, an `is_wishlisted` flag computed per product.
* Product detail loads variants with attribute values, images, and related products from the same category; if fewer than 4 related products exist and the product has a brand, it back-fills from the same brand.

**Search / filter / sort**

| Endpoint | Filters | Sort options |
|---|---|---|
| `search` | `q` (name OR description LIKE), `category` (slug), `min_price`, `max_price`, `brands` (comma-separated IDs) | `default`, `price_low`, `price_high`, `newest` |
| `categoryProducts` | `min_price`, `max_price`, `brands` | same |
| `brandProducts` | `min_price`, `max_price` | same |

**Pagination.** 24 per page with `withQueryString()` on `newArrivals`, `flashSales`, `brandProducts`, `categoryProducts`, `search`. Home page rails are not paginated.

**Business rules found in code**
* Price filters compare against `products.base_price` only — variant prices are ignored by the filter.
* `Product::getPriceAttribute()` returns `base_price` when `> 0`, otherwise the minimum variant price, otherwise `0`.
* `Product::getOldPriceAttribute()` returns `round(price * 1.15, 2)` — the "old price" is a synthetic 15 % markup, not stored data.
* `index`, `newArrivals`, `flashSales`, `brandProducts`, `show` filter on `is_active = true`. **`categoryProducts` and `search` do not filter on `is_active`.**

**Statuses.** None (catalog has only the boolean `is_active`).

**Role & permission.** Public, no middleware.

**Dependencies.** Product, Category, Brand, Wishlist modules.

---

### 4.2 Authentication, Admin Login and OTP

**Purpose.** Three parallel authentication paths.

**Pages**

| Route | Method | Name | Page / behaviour |
|---|---|---|---|
| `/login` | GET | `login` | `Login` |
| `/login` | POST | — | credential login, `throttle:5,1` |
| `/admin/login` | GET | `admin.login` | `AdminLogin` |
| `/admin/login` | POST | — | credential login restricted to staff roles, `throttle:5,1` |
| `/logout` | POST | `logout` | — |
| `/api/auth/send-otp` | POST | `auth.send-otp` | JSON |
| `/api/auth/verify-otp` | POST | `auth.verify-otp` | JSON |
| `/register` | GET | `register` | `Register` (inside the staff-only group) |

**Validation**

| Endpoint | Rules |
|---|---|
| `login` / `adminLogin` | `login` required string, `password` required |
| `sendOTP` | `phone` required string min:11 |
| `verifyOTP` | `phone` required string, `otp` required string |

**Login logic**
* `login` field is auto-detected: `filter_var($login, FILTER_VALIDATE_EMAIL)` → credential key `email`, else `phone`.
* After a successful attempt, if the user has an `employeeProfile` and `is_active` is false, the session is invalidated and the error `Your account has been deactivated. Please contact the administrator.` is returned.
* `login` redirects to `shop.index`; `adminLogin` additionally requires `hasAnyRole(['super-admin','admin','sales','accountant'])` and otherwise logs out with `Access denied. Only administrators can access the dashboard.`

**OTP workflow (`sendOTP`)**
1. Rate limit key `otp_requests_{phone without '+'}` in cache; at `>= 3` requests returns HTTP 429 with `Too many OTP requests for this number. Please wait 10 minutes before trying again.` TTL 10 minutes.
2. Generates `rand(100000, 999999)`; expiry `now()+5 minutes`.
3. If no user exists with that phone, one is created with `name = 'Guest ' . substr(phone,-4)` and assigned the `customer` role (auto-registration).
4. `otp` and `otp_expires_at` written to `users`.
5. `SendSmsJob::dispatch($phone, $otp)` (queued).
6. Response includes `otp_preview` **only when `config('app.debug')` is true**.

**OTP verification (`verifyOTP`)**
1. Matches `phone` + `otp` + `otp_expires_at > now()`; failure → HTTP 422 `Invalid or expired OTP.`
2. Clears OTP fields, `Auth::login($user, true)` (remember me).
3. **Session cart merge:** every `session('cart')` item is merged into the `carts` table — quantity is incremented when a matching `(user_id, product_id, variant_id)` row exists, otherwise a row is created. Session cart is then forgotten and the session regenerated.

**Password policy.** `AppServiceProvider::boot()` sets `Password::defaults()` to `min(10)->letters()->mixedCase()->numbers()->symbols()`. This default is applied only where `Password::defaults()` is referenced — currently just `AccountController::updatePassword`.

**Role & permission.** `/login` and `/admin/login` are inside `middleware('guest')`. OTP endpoints are **public and unauthenticated** (declared outside the `auth` group).

---

### 4.3 Customer Account (`My Account`)

**Purpose.** Customer self-service.

**Routes** (all under `auth`)

| Method | URI | Name |
|---|---|---|
| GET | `/my-account` | `account.index` |
| PATCH | `/my-account/profile` | `account.profile.update` |
| PUT | `/my-account/password` | `account.password.update` |
| GET | `/my-account/orders/{order}` | `account.orders.show` |
| GET | `/my-account/orders/{order}/invoice` | `account.orders.invoice` |
| POST | `/my-account/orders/{order}/cancel` | `account.orders.cancel` |
| POST | `/my-account/addresses` | `account.addresses.store` |
| PATCH | `/my-account/addresses/{address}` | `account.addresses.update` |
| DELETE | `/my-account/addresses/{address}` | `account.addresses.delete` |

**Forms and validation**

| Form | Fields and rules |
|---|---|
| Profile | `name` required string max:255; `email` nullable email max:255 unique ignoring self; `phone` **required** string max:20 unique ignoring self |
| Password | `password` required, confirmed, `Password::defaults()` (min 10 + letters + mixed case + numbers + symbols); `current_password` required **only if the user already has a password** (OTP-created users have `password = null`) |
| Address | `type` required in `home,office,shipping`; `full_name` required max:255; `phone` required max:20; `email` nullable email; `address_line_1` required max:500; `address_line_2` nullable max:500; `city` required max:255; `area` nullable max:255; `postal_code` nullable max:20; `is_default` boolean |
| Cancel order | `reason` required string max:1000 |

**Ownership enforcement.** `showOrder`, `updateAddress`, `deleteAddress`, `downloadInvoice`, `cancelOrder` all `abort(403)` when `user_id !== Auth::id()`.

**Business rules**
* Setting `is_default = true` on an address first clears `is_default` on all of the user's addresses.
* Cancellation is allowed **only when `order->status === 'pending'`**; otherwise `Only pending orders can be cancelled.`
* Cancelling writes `status = cancelled`, `cancel_reason`, `cancelled_by`; the `Order::updated` model hook then calls `StockService::returnStock()`.
* Invoice download renders `invoices.order-invoice` through DomPDF as `invoice-{order_number}.pdf`.

**Pagination.** None — `index` loads **all** of the user's orders and addresses with `->get()`.

---

### 4.4 Cart & Checkout

**Purpose.** Dual-mode cart (guest session vs. authenticated DB) and order placement.

**Routes**

| Method | URI | Name | Notes |
|---|---|---|---|
| GET | `/cart` | `cart.index` | renders `Shop/Cart`, data comes from shared prop |
| POST | `/cart` | `cart.store` | add item |
| PATCH | `/cart/{id}` | `cart.update` | set quantity |
| DELETE | `/cart/{id}` | `cart.destroy` | remove |
| POST | `/cart/clear` | `cart.clear` | empty cart |
| GET | `/checkout` | `checkout.index` | renders `Shop/Checkout` |
| POST | `/checkout` | `checkout.process` | create order |

> **Note.** All cart routes sit inside the `auth` middleware group, yet every cart method contains a full guest branch keyed on `session('cart')`. The guest branch is therefore unreachable through these routes; only the `HandleInertiaRequests` share and `CheckoutController` guest branch can observe a session cart.

**Validation**

| Endpoint | Rules |
|---|---|
| `cart.store` | `product_id` required exists:products,id; `variant_id` nullable exists:product_variants,id; `quantity` required integer min:1 |
| `cart.update` | `quantity` required integer min:1 |
| `checkout.process` | `first_name`, `last_name`, `phone`, `address`, `city`, `payment_method` — all required string |

**Stock rules.** Both `store` and `update` compare requested quantity against `variant->stock` (when a variant is chosen) or `product->stock`, and reject with `Only {n} items available in stock.`

**Checkout processing (`CheckoutController::store`)**
1. Builds `$cartItems` from the `carts` table (authenticated) or `session('cart')` (guest).
2. Empty cart → `Your cart is empty.`
3. Opens a DB transaction.
4. `subtotal = Σ (price × quantity)`; `total = subtotal` (no discount, tax, or shipping is applied at checkout).
5. Creates the order: `payment_status = pending`, `order_status = pending`, `status = pending`, `source = online`, `type = sales`, `shipping_address = "{address}, {city}[ - {postal_code}]"`.
6. Creates order items.
7. `StockService::recordSale($order)` decrements stock and writes `stock_transactions` rows.
8. Clears the cart.
9. Commits, then `Notification::send(User::role(['super-admin','admin'])->get(), new OrderCreatedNotification($order))`.
10. Redirects to `shop.index` with `Order placed successfully! Order #{order_number}`.

**Checkout page behaviour (`Shop/Checkout.tsx`).** Saved addresses are listed; selecting one pre-fills the form (splitting `full_name` into first/last name). Default `payment_method` is `cod`.

---

### 4.5 Wishlist

**Routes:** `GET /wishlist` (`wishlist.index`), `POST /wishlist/toggle` (`wishlist.toggle`), `DELETE /wishlist/{id}` (`wishlist.destroy`). All under `auth`.

**Validation:** toggle requires `product_id` exists:products,id.

**Logic (`WishlistRepository`).** `toggleWishlist` deletes an existing `(user_id, product_id)` row and returns `removed`, otherwise creates it and returns `added`. `removeFromWishlist` scopes by `user_id` and `firstOrFail()`. `getWishlistCount` returns 0 for guests.

**Table:** `wishlists(id, user_id, product_id, timestamps)` — **no unique composite index**, so duplicates are prevented only by the toggle logic.

---

### 4.6 Product Management System

**Purpose.** Full catalog CRUD with simple/variant product types, images, attributes, and barcode lookup.

**Pages**

| Route | Name | Page |
|---|---|---|
| `GET /products` | `products.index` | `Products` |
| `GET /products/create` | `products.create` | `CreateProduct` |
| `POST /products` | `products.store` | — |
| `GET /products/{product}` | `products.show` | `ShowProduct` |
| `GET /products/{product}/edit` | `products.edit` | `EditProduct` |
| `PUT/PATCH /products/{product}` | `products.update` | — |
| `DELETE /products/{product}` | `products.destroy` | — |
| `GET /products/barcode/{barcode}` | `products.barcode.search` | JSON |

**Filters / search (`ProductRepository::paginate`).** `search` matches `products.name`, `products.sku`, `products.barcode`, and (via `whereHas`) `product_variants.sku` / `product_variants.barcode`; plus `category_id`, `brand_id`, `product_type`. Sorted `latest()`. Pagination `per_page` (default 15), `withQueryString()`.

**Validation (`StoreProductRequest` / `UpdateProductRequest`)**

| Field | Store rule | Update rule |
|---|---|---|
| `category_id` | required integer exists | same |
| `brand_id`, `unit_id` | nullable integer exists | same |
| `name` | required string max:255 | same |
| `description` | nullable string | same |
| `product_type` | required in `simple,variant` | same |
| `base_price`, `cost_price` | nullable numeric min:0 | same |
| `sku` | nullable max:100 unique:products,sku | unique ignoring `{id}` |
| `barcode` | nullable max:100 unique:products,barcode | unique ignoring `{id}` |
| `low_stock_alert` | nullable integer min:0 | same |
| `is_active` | boolean | same |
| `images.*` | image, mimes jpg/jpeg/png/webp, max 2048 KB | same |
| `variants.*.sku` / `.barcode` | nullable, unique on `product_variants` | **nullable string only — uniqueness is not validated** (the file carries the comment "In a real app we need a custom rule to ignore self for variant sku/barcode") |
| `variants.*.price` | required_with:variants, numeric min:0 | same |
| `variants.*.stock` | required_with:variants, integer min:0 | same |
| `variants.*.cost_price`, `.low_stock_alert` | nullable | same |
| `variants.*.attribute_values.*` | integer exists:attribute_values,id | array only (element rule omitted) |
| `variants.*.images.*` | image, mimes, max 2048 KB | same |

**Repository behaviour (`ProductRepository`)**
* `create` and `update` run inside `DB::transaction`.
* Slug: if empty, `Str::slug(name)` with a numeric suffix loop (`{base}-{i}`) until unique.
* Variants are created only when `product_type === 'variant'`.
* On update, variants present in the payload are updated or created; variant IDs missing from the payload are deleted along with their images (`array_diff`).
* Images are stored on the `public` disk under `products/` or `variants/`; the stored value is `/storage/{path}`. The first uploaded image becomes `is_primary` only when no primary image already exists.
* `syncProductImages(..., append: false)` contains an **empty `if (!$append) { }` block** — non-append mode performs no deletion, so images are always appended.

**Barcode lookup (`findByBarcodeOrSku`).** Looks for a product by `barcode` OR `sku`; if found and `product_type === 'simple'` it is returned, otherwise a `ProductVariant` matching `barcode` OR `sku` (with `product` and `attributeValues.attribute`) is returned. Controller returns `{"message":"Product not found"}` with HTTP 404 when nothing matches.

**Deletion rules.** `destroy` refuses when `orderItems()` exist (`Cannot delete product with existing sales history. Please deactivate it instead.`) or `restockOrderItems()` exist (`Cannot delete product with existing restock history.`).

**Permissions.** Route-level `permission:product.view` for the whole resource, **plus** controller-level `product.view` (index/show/barcodeSearch), `product.create` (create/store), `product.edit` (edit/update), `product.delete` (destroy). Both gates must pass.

#### 4.6.1 Attributes

Routes: `attributes` resource except `create`, `show`, `edit` (route-level `permission:product.view`), controller-level `product.view|create|edit|delete`. Page `Attributes/Index`.

Validation: `StoreAttributeRequest` — `name` required max:255 unique:attributes,name; `values` nullable array; `values.*.value` required max:255. `UpdateAttributeRequest` adds `values.*.id` nullable exists.

Update logic: inside a transaction, values whose IDs are absent from the payload are deleted, existing IDs updated, new values created. If `values` is not present at all, **all** values of the attribute are deleted.

Delete rule: blocked when any of the attribute's values is linked to a variant — `Cannot delete attribute whose values are assigned to product variants.`

#### 4.6.2 Units

Routes: `units` resource except `create`, `show`, `edit` (route-level `permission:product.view`), controller-level `unit.view|create|edit|delete`. Page `Units`.

Validation: `name` required max:255 unique:units,name (update ignores self via `Rule::unique(...)->ignore($this->route('unit'))`); `abbreviation` nullable max:50.

Delete rule: blocked when products reference the unit — `Cannot delete unit that is assigned to products.`

No pagination — `UnitRepository::all()` returns every unit ordered by name.

---

### 4.7 Brand Management

Routes: `brands` resource (route-level `permission:brand.view`; controller `brand.view|create|edit|delete`). Page `Brands`.

**Fields:** `name` (unique), `slug` (unique, auto-generated), `logo` (image ≤ 2 MB, stored under `brands/`), `description`, `is_active`, `order`.

**Filters:** `search` (name OR slug LIKE), `is_active`. Sort: `order` then `name`. Pagination `per_page` default 10 with `withQueryString()`.

**Custom messages** are defined in `StoreBrandRequest` / `UpdateBrandRequest` (e.g. `A brand with this name already exists.`, `The logo may not be larger than 2 MB.`).

**Delete rule:** blocked when the brand has products — `Cannot delete brand with assigned products.` The logo file is deleted from the `public` disk when the brand is deleted or replaced.

**Model hook:** `Brand::saving` fills `slug` from `name` when empty (the repository also resolves collisions).

---

### 4.8 Category Management

Routes: `categories` resource (route-level `permission:category.view`; controller `category.view|create|edit|delete`). Page `Categories`.

**Fields:** `name` (unique), `slug` (unique, auto), `parent_id` (self-referencing, `onDelete('cascade')`), `image` (≤ 2 MB, `categories/` folder), `icon` (string ≤ 100), `is_active`, `order`.

> The `Category` model's `$fillable` includes `description`, but the `categories` table has **no `description` column**.

**Hierarchy.** `parent()` / `children()` relations. The shared Inertia `categories` prop and the storefront home page load 2 levels of children; `ProductController` builds a breadcrumb-style label up to 3 levels (`grandparent > parent > child`) for the product filter dropdown, while `create`/`edit` build only 2 levels.

**Filters:** `search` (name OR slug), `is_active`, `parent_id`. Sort `order` then `name`. Pagination default 15.

**Delete rules:** blocked when the category has products (`Cannot delete category containing products.`) or children (`Cannot delete category containing sub-categories.`).

---

### 4.9 Point of Sale (POS)

**Purpose.** Counter sales with barcode scanning and instant completion.

**Routes:** `GET /pos` (`pos.index`, `permission:pos.view`) → page `Pos/Index`; `POST /pos/checkout` (`pos.store`, `permission:pos.checkout`).

**Data loaded into the page:** all customers (`User::role('customer')` with `id, name, phone`), all categories (`id, name`), and **all active products** with `category`, `brand`, `unit`, `images`, `variants.images`, `variants.attributeValues.attribute` (no pagination).

**UI features (`Pos/Index.tsx`).** Product search box auto-focused for a barcode scanner; matching on product name, product `barcode`, and variant `barcode`; category filter; cart panel; customer selection (existing customer dropdown or new-customer name+phone); discount, tax percentage, note fields; `less_fixed` and `paid_amount` inputs.

**Validation (`PosController::store`)**

| Field | Rule |
|---|---|
| `customer_id` | `required_without:customer_phone`, nullable, exists:users,id |
| `customer_name` | nullable string max:255 |
| `customer_phone` | `required_without:customer_id`, nullable string max:20 |
| `payment_method` | required in `cash,credit,bank_transfer,card,mobile_banking` |
| `discount` | nullable numeric min:0 |
| `discount_type` | in `percentage,fixed` |
| `tax_percentage` | nullable numeric min:0 |
| `note` | nullable string |
| `items` | required array min:1 |
| `items.*.product_id` | required exists:products,id |
| `items.*.variant_id` | nullable exists:product_variants,id |
| `items.*.quantity` | required integer min:1 |
| `items.*.unit_price` | required numeric min:0 |

**Server-side pricing (authoritative).** The submitted `items.*.unit_price` is validated but **not used**. The server recomputes `actualPrice` as `variant->price` when a variant is present, otherwise `product->base_price`.

**Total calculation**
```
subtotal        = Σ (quantity × actualPrice)
discountAmount  = discount_type === 'percentage' ? subtotal × discount / 100 : discount
totalBeforeTax  = subtotal − discountAmount
taxAmount       = totalBeforeTax × tax_percentage / 100
totalAmount     = totalBeforeTax + taxAmount
```

**Order number.** `'POS-' . str_pad((last Order id) + 1, 6, '0', STR_PAD_LEFT)` — derived from `Order::latest()->first()->id`.

**Customer resolution.** If `customer_id` given → `User::findOrFail`. Otherwise look up by `phone`; if absent, create a user with `name = customer_name ?? customer_phone`, `email = null`, `password = null`, and assign the `customer` role.

**Order fields written.** `type = sales`, `source = pos`, `status = delivered`, `shipping_address = 'POS Transaction'`, `created_by = Auth::id()`, `approved_by = Auth::id()`, `service_charge = 0`. `payment_status` is not set (falls back to the column default `pending`).

**Stock.** `StockService::recordSale($order)` is called inside the transaction; failures roll back and return `Failed to complete transaction: {message}`.

---

### 4.10 Service Invoice Module

**Purpose.** Bill a labour/service charge plus optional parts, assigned to a technician.

**Routes**

| Method | URI | Name | Permission |
|---|---|---|---|
| GET | `/services` | `services.index` | `order.view` |
| GET | `/services/create` | `services.create` | `order.manage` |
| POST | `/services` | `services.store` | `order.manage` |
| GET | `/services/{order}/invoice` | `services.invoice` | `order.view` |
| GET | `/service-types` | `service-types.index` | `order.manage` |
| POST | `/service-types` | `service-types.store` | `order.manage` |
| PUT | `/service-types/{serviceType}` | `service-types.update` | `order.manage` |
| DELETE | `/service-types/{serviceType}` | `service-types.destroy` | `order.manage` |

**Listing.** `Order::where('type','service')` with `user`, `technician`, `creator`, `latest()`, paginate 10. No search or filter inputs are wired on the server side.

**Create page data.** Customers (`role('customer')`), technicians (`User::role(['admin','super-admin','sales'])` — the comment in code notes "Or specific technician role if exists"), all active products with images and variant attribute values, categories, and all `ServiceType` rows ordered by name.

**Validation (`store`)**

| Field | Rule |
|---|---|
| `customer_id` | required_without:customer_phone, nullable, exists:users,id |
| `customer_name` | nullable string max:255 |
| `customer_phone` | required_without:customer_id, nullable string max:20 |
| `technician_id` | **required** exists:users,id |
| `service_type` | **required** string max:255 (free text, not an FK) |
| `service_charge` | **required** numeric min:0 |
| `payment_method` | required in `cash,credit,bank_transfer,card,mobile_banking` |
| `tax_percentage` | nullable numeric min:0 |
| `discount` | nullable numeric min:0 |
| `note` | nullable string |
| `parts` | nullable array |
| `parts.*.product_id` | required exists:products,id |
| `parts.*.variant_id` | nullable exists:product_variants,id |
| `parts.*.quantity` | required integer min:1 |
| `parts.*.unit_price` | required numeric min:0 (validated but not used — server re-prices) |

**Total calculation**
```
subtotalParts  = Σ (quantity × actualPrice)
subtotal       = subtotalParts + service_charge
discountAmount = discount            (always treated as FIXED; discount_type is hard-coded 'fixed')
totalBeforeTax = subtotal − discountAmount
taxAmount      = totalBeforeTax × tax_percentage / 100
totalAmount    = totalBeforeTax + taxAmount
```

**Order fields.** `order_number = 'SRV-' . str_pad(lastOrderId + 1, 6, '0', STR_PAD_LEFT)`, `type = service`, `service_type`, `technician_id`, `shipping_address = 'Service Center'`, `status = delivered`, `source = pos`, `created_by` and `approved_by` = current user. Items are written with `item_type = 'service_part'`.

**Stock.** `StockService::recordSale($order)` is invoked **only when at least one part is present**.

**Invoice.** `downloadInvoice` aborts 404 when `order->type !== 'service'` and returns the **Blade view** `invoices.service-invoice` (HTML in the browser, not a PDF download). `OrderController::downloadInvoice` redirects service-type orders to this route.

**Service Types CRUD.** `name` required max:255 unique (ignoring self on update), `charge` required numeric min:0. Delete has **no dependency guard** (service type names are copied into `orders.service_type` as free text, so removing a type does not affect existing invoices). Selecting a type in the UI auto-fills `service_charge` from `serviceTypes.find(st => st.name === v)?.charge`.

---

### 4.11 Order Management

**Routes**

| Method | URI | Name | Permission |
|---|---|---|---|
| GET | `/orders` | `orders.index` | `order.view` |
| GET | `/orders/{order}` | `orders.show` | `order.view` |
| GET | `/orders/{order}/invoice` | `orders.invoice` | `order.view` |
| PATCH | `/orders/{order}/status` | `orders.update-status` | `order.manage` |

**Filters (`index`).** `search` (order_number OR customer_name OR customer_phone LIKE), `status`, `payment_status`, `source`. Sort `latest()`. Pagination `per_page` default 15, `withQueryString()`. The frontend debounces filter changes and pushes them via `router.get('/orders', params, { preserveState: true })`.

**Status update validation.** `order_status` nullable in `pending,processing,shipped,delivered,cancelled`; `payment_status` nullable in `pending,paid,failed,partially_paid`. Both fields are optional; only the filled ones are applied.

**Important:** `updateStatus` performs **no transition validation** — any status may be set from any other status, including re-opening a cancelled order or cancelling a delivered one. There is no reason/`cancelled_by` capture on this path (unlike the customer cancel path).

**Invoice.** DomPDF render of `invoices.order-invoice`, downloaded as `invoice-{order_number}.pdf`. Service orders are redirected to `services.invoice`.

---

### 4.12 Inventory

**Routes**

| Method | URI | Name | Permission |
|---|---|---|---|
| GET | `/inventory/history` | `inventory.history` | `inventory.view_history` |
| GET | `/inventory/adjust` | `inventory.adjust` | `inventory.adjust` |
| POST | `/inventory/adjust` | `inventory.update-stock` | `inventory.adjust` |

**History.** `StockTransaction` with `product`, `variant`, `user`, `latest()`. Filters: `search` (product name via `whereHas`), `type`. Pagination `per_page` default 15; the controller hand-builds the `data / links / meta` payload.

**Adjust.** Loads every product with variants and their attribute-value labels plus current stock.

**Validation (`updateStock`).** `product_id` required exists; `variant_id` nullable exists; `quantity` required integer min:1; `type` required in `in,out,adjustment`; `reason` required string max:255.

**`StockService::adjustStock($model, $quantity, $type, $reason, $reference)`**
1. Runs inside `DB::transaction`.
2. Locks the row (`lockForUpdate`) for the model, and additionally locks the parent `Product` when the model is a `ProductVariant`.
3. `type === 'out'` is the only decrementing type. It throws `Insufficient stock. Available: {stock}, Requested: {quantity}` when `stock < quantity`.
4. For a variant, both the variant's stock **and** the parent product's stock are moved.
5. Any other type (`in`, `adjustment`, `return`) **increments** stock.
6. Writes a `stock_transactions` row with `balance_after`, `user_id`, `reference_type`, `reference_id`, `reason`.

> Consequence: choosing `adjustment` in the Adjust form always **adds** stock; there is no decrementing adjustment path other than `out`.

**Low-stock helpers.** `getLowStockItems()` → `products` where `stock <= low_stock_alert AND stock > 0`. `getOutOfStockItems()` → `products` where `stock <= 0`. Both are product-level only (variants are not evaluated) and are consumed by the dashboard.

---

### 4.13 Supplier Management

**Routes:** `GET /suppliers` (`supplier.view`), `POST /suppliers` (`supplier.create`), `PUT /suppliers/{supplier}` (`supplier.update`), `DELETE /suppliers/{supplier}` (`supplier.delete`). Page `Suppliers/Index`.

**Fields / validation:** `name` required max:255 (`sometimes|required` on update); `email` nullable email max:255; `phone` nullable max:20; `address` nullable; `contact_person` nullable max:255; `is_active` boolean.

**Filters:** `search`, `is_active`. Pagination `per_page` default 10.

> The search filter is built as `where('name', 'like', …)->orWhere('email', …)->orWhere('phone', …)` **without a nested closure**, so when combined with the `is_active` filter the boolean grouping is `name LIKE ? OR email LIKE ? OR phone LIKE ? AND is_active = ?`.

**Delete rule:** blocked when restock orders exist — `Cannot delete supplier with existing restock orders. Please deactivate them instead.`

---

### 4.14 Restock Orders (Purchase Orders)

**Routes**

| Method | URI | Name | Permission |
|---|---|---|---|
| GET | `/restock-orders` | `restock-orders.index` | `restock.view` |
| GET | `/restock-orders/create` | `restock-orders.create` | `restock.create` |
| POST | `/restock-orders` | `restock-orders.store` | `restock.create` |
| GET | `/restock-orders/{restock_order}` | `restock-orders.show` | `restock.view` |
| DELETE | `/restock-orders/{restock_order}` | `restock-orders.destroy` | `restock.delete` |
| POST | `/restock-orders/{restock_order}/receive` | `restock-orders.receive` | `restock.receive` |

**Validation (`store`).** `supplier_id` required exists; `notes` nullable; `items` required array min:1; `items.*.product_id` required exists; `items.*.variant_id` nullable exists; `items.*.quantity` required integer min:1; `items.*.cost_price` required numeric min:0.

**Creation.** `order_number = 'PO-' . strtoupper(uniqid())`, `status = pending`, `created_by = Auth::id()`, `total_amount = Σ (quantity × cost_price)`. Items are created with `total_price = quantity × cost_price`. Wrapped in a transaction.

**Receiving.** Row is re-fetched with `lockForUpdate()`; if `status !== 'pending'` → `Only pending orders can be received.` Otherwise `status = received`, `received_at = now()`, then `StockService::recordRestock()` adds stock (type `in`) for each line with reason `Restock: Order #{number} (Supplier: {name})` and reference `App\Models\RestockOrder`.

**Deletion.** Blocked when `status === 'received'` — `Received orders cannot be deleted.` Otherwise the row is hard-deleted (items cascade).

> The `cancelled` value exists in the `restock_orders.status` enum but **no code path ever sets it**; cancellation is implemented as deletion.

**Filters:** `search` (order_number), `status`. Pagination `per_page` default 15.

---

### 4.15 Accounting Module

All accounting routes live under `prefix('accounting')->name('accounting.')->middleware('permission:accounting.view')`. **The single `accounting.view` permission gates read *and* write for the whole module.**

#### 4.15.1 Expense Categories
Resource `accounting/expense-categories` → page `Accounting/Expenses/Categories` (index lists categories with `withCount('expenses')`).
Validation: `name` required string unique on `expense_categories` (ignoring self on update); `description` nullable.
Delete rule: blocked when expenses exist — `Cannot delete category with associated expenses`.

#### 4.15.2 Expenses
Resource `accounting/expenses` → page `Accounting/Expenses/Index`, `latest()`, paginate 15.
Validation: `expense_category_id` required exists; `amount` required numeric min:0; `date` required date; `reference_no` nullable string; `note` nullable string. `created_by` is set from `auth()->id()` on create (not on update).
**Audit rule on delete:** an expense older than 24 hours can only be deleted by a `super-admin` — `Financial records older than 24 hours cannot be deleted for auditing purposes. Please contact a super-admin.`

#### 4.15.3 Payments
Routes: `GET accounting/payments` (index), `POST accounting/payments` (store), `GET accounting/payments/customer-dues`, `GET accounting/payments/supplier-dues`.
Pages: `Accounting/Payments/Index`, `.../CustomerDues`, `.../SupplierDues`.

Dues listings: orders / restock orders whose `payment_status` is `pending` or `partially_paid`, ordered by `id desc`, paginate 20.

Validation (`store`): `payable_type` required in `App\Models\Order,App\Models\RestockOrder`; `payable_id` required integer; `amount` required numeric **min:1**; `payment_date` required date; `payment_method` required in `cash,bank_transfer,mobile_banking,card`; `type` required in `in,out`; `note` nullable.

Logic: inside a transaction the payable is locked (`lockForUpdate`); `dueAmount = total_amount − paid_amount`; over-payment is rejected with `Payment amount cannot exceed the due amount ({formatted}).`; the `Payment` row is created with `created_by`; `paid_amount` is incremented and `payment_status` is recomputed to `paid` (when `paid_amount >= total_amount`) or `partially_paid`.

> Note: `payment_status` is only ever moved forward to `partially_paid`/`paid` — it is never returned to `pending`, and there is no payment reversal/refund path. Also, `payable_id` is validated as an integer but not checked for existence before `findOrFail` inside the try block (a missing ID produces the generic `Error recording payment.`).
> The `type` (`in`/`out`) is not cross-checked against `payable_type`, so an `out` payment can be recorded against a customer `Order`.

#### 4.15.4 Accounting Reports

| Route | Page | Content |
|---|---|---|
| `accounting/reports/daily-sales` | `Accounting/Reports/DailySales` | `orders` grouped by `DATE(created_at)`, `SUM(total_amount)`, `COUNT(id)`, last 30 groups, desc |
| `accounting/reports/profit-loss` | `Accounting/Reports/ProfitLoss` | `totalRevenue` = Σ payments where `payable_type = Order AND type = in`; `totalExpenses` = Σ expenses; `totalPurchases` = Σ payments where `payable_type = RestockOrder AND type = out`; `netProfit = totalRevenue − (totalExpenses + totalPurchases)` |
| `accounting/reports/cashbook` | `Accounting/Reports/Cashbook` | `UNION ALL` of `payments` and `expenses`, ordered by date asc, running `balance` accumulated (`in` adds, everything else subtracts), then array-reversed for display |

> The accounting profit & loss is **cash-basis** (driven by recorded `payments`) whereas the Reports module and Dashboard profit figures are **accrual/margin-basis** (driven by `order_items` vs. cost price). The two will not agree.
> `daily-sales` groups on `created_at` while every other sales report groups on `order_date`.
> Neither report accepts a date-range filter.

---

### 4.16 HRM Module

All HRM routes live under `prefix('hrm')->name('hrm.')`.

#### 4.16.1 Employees
Routes: `GET /hrm/employees` (`hrm.employee.view`), `POST /hrm/employees`, `PUT /hrm/employees/{id}`, `PATCH /hrm/employees/{id}/toggle-status` (all three writes: `hrm.employee.manage`). Page `HRM/Employees/Index`.

An "employee" is a `User` that has an `employee_profiles` row (`User::whereHas('employeeProfile')`).

Validation (store): `name` required max:255; `email` required email unique:users; `phone` nullable; `password` required min:6; `role` required string exists:roles,name; `base_salary` nullable numeric min:0; `join_date` nullable date.
Validation (update): same, with `email` unique ignoring self, `password` nullable min:6, `role` `sometimes|required`.

Role-escalation guards:
* Assigning `super-admin` requires the actor to be `super-admin` — `Unauthorized: Only super-admins can assign the super-admin role.`
* Editing a user who holds `super-admin` or `admin` requires the actor to be `super-admin` if the request contains `password` or `role` — `Unauthorized: You cannot modify credentials or roles for administrative accounts.`

Both create and update run in a transaction; update uses `employeeProfile()->updateOrCreate()` and `syncRoles([$role])` (single role per employee).

`toggleStatus` flips `employee_profiles.is_active`; a deactivated employee is blocked at login (see 4.2).

> `update` writes `is_active` from `(bool) $request->is_active`; the field is not in the validation rules, so an absent field silently deactivates the employee.

Filters: `search` across name / email / phone. Pagination `per_page` default 15, `withQueryString()`.

#### 4.16.2 Attendance
Routes: `GET /hrm/attendance` (`hrm.attendance.view`), `POST /hrm/attendance` (`hrm.attendance.manage`). Page `HRM/Attendance/Index`.

The index builds a **month grid**: for each active employee (optionally filtered by `role_id`), an `attendance_grid` keyed 1..`daysInMonth` with `status`, `check_in`, `check_out`, plus `total_present` where `present`/`late` count 1 and `half-day` counts 0.5. Filters: `month`, `year`, `role_id` (defaults to the current month/year).

Validation (store): `date` required date; `attendances` required array; `attendances.*.user_id` required exists:users,id; `attendances.*.status` required string (**free string — not constrained to an enum**); `attendances.*.check_in` / `check_out` nullable string.

Business rule: `Cannot mark attendance for future dates.` Records are written with `Attendance::updateOrCreate(['user_id','date'], [...])` inside a transaction, matching the `unique(user_id, date)` index.

> The `attendances.status` column was originally an enum `present|absent|half-day|on-leave` and was later widened to `string(50)` by migration `2026_04_11_055046`. The grid counts a `late` status that the original enum never contained.

#### 4.16.3 Leave Requests
Routes: `GET /hrm/leaves` (`hrm.leave.view`), `POST /hrm/leaves` (`hrm.leave.view` — the route comment states "Basic users can create"), `PATCH /hrm/leaves/{id}/status` (`hrm.leave.manage`). Page `HRM/Leaves/Index`.

Scoping: users without `hrm.leave.manage` (and not `super-admin`) see only their own requests. The page receives `canManage` and hides the Actions column accordingly.

Validation (store): `type` required in `casual,sick,annual`; `start_date` required date; `end_date` required date `after_or_equal:start_date`; `reason` nullable string.

**Overlap rule.** A new request is rejected when the requesting user already has a `pending` or `approved` request overlapping the range — `You already have a pending or approved leave request during this period.` The overlap check covers: start inside range, end inside range, or range fully enclosing the new one.

Validation (updateStatus): `status` required in `approved,rejected,pending`. No further guard — a status may be moved back and forth freely, and there is no actor/timestamp record of who approved.

Filter: `status`. Pagination `per_page` default 15.

#### 4.16.4 Payroll
Routes: `GET /hrm/payroll` (`hrm.payroll.view`), `POST /hrm/payroll/generate` (`hrm.payroll.manage`), `PATCH /hrm/payroll/{id}/status` (`hrm.payroll.manage`). Page `HRM/Payroll/Index`.

Index: salaries for `month_year` (default current `Y-m`), with user name/email, base salary, bonus, deduction, net salary, status. **No pagination.**

Generate: validates `month_year` required `date_format:Y-m`. For every user with an **active** employee profile:
```
absences        = attendances in month with status 'absent'
halfDays        = attendances in month with status 'half-day'
deductionDays   = absences + halfDays × 0.5
deduction       = base_salary > 0 ? (base_salary / daysInMonth) × deductionDays : 0
bonus           = 0                       (hard-coded, comment: "Configurable later")
netSalary       = max(base_salary + bonus − deduction, 0)
```
Rows are written with `Salary::updateOrCreate(['user_id','month_year'], [...])` inside a transaction, always resetting `status` to `pending`.

> Re-generating a month **overwrites an already `paid` salary row and resets its status to `pending`**.

`updateStatus` validates `status` required in `pending,paid` — a paid salary can be reverted to pending.

---

### 4.17 Reports Module

Routes under `prefix('reports')->middleware('permission:report.view')`: `GET /reports` (`reports.index`), `GET /reports/export/pdf` and `GET /reports/export/csv` (both additionally `permission:report.export`). Page `Reports/Index`.

**Date range.** `start_date` (default `now()-30 days`) and `end_date` (default today), parsed to `startOfDay` / `endOfDay`. All queries filter on `orders.order_date`.

**Sections**

| Section | Query |
|---|---|
| `summary` | `total_revenue` = Σ `orders.total_amount`; `total_orders` = COUNT; `daily_sales` grouped by `DATE(order_date)` |
| `source_report` | grouped by `orders.source` with COUNT and SUM |
| `top_products` | join `order_items`→`orders`→`products`, `SUM(quantity)` and `SUM(total_price)`, ordered desc, limit 10 (20 in the PDF) |
| `profit_report` | `SUM(order_items.total_price − order_items.quantity × IF(order_items.cost_price > 0, order_items.cost_price, products.cost_price))` |

**PDF export.** DomPDF render of `pdf.report` → `sales_report_{start}_to_{end}.pdf`.
**CSV export.** Streamed response with header row `Order Number, Date, Customer, Source, Amount, Status, Payment`.

> No report query excludes cancelled orders, so cancelled revenue is included in every total.

---

### 4.18 Roles, Permissions & Users (RBAC administration)

| Route | Name | Permission |
|---|---|---|
| `roles` resource | `roles.*` | route `role.view`; controller `role.view` (index), `role.manage` (all others) |
| `POST /roles/{id}/sync-permissions` | — | `role.manage` |
| `permissions` resource | `permissions.*` | route `permission.view`; controller `permission.view` (index), `permission.manage` (all others) |
| `POST /users/{id}/sync-permissions` | — | `user.manage` |
| `GET /users` | `users.index` | `user.view` |

**RoleController.** `index` returns all roles with `users_count` and their permissions plus the full permission list; filter `search` on name; **no pagination** (`->get()`).
Protected roles `['super-admin','admin','customer']` cannot be renamed, deleted, or have their permissions synced — `Cannot modify system roles.` / `Cannot delete system roles.` / `Cannot modify permissions for system roles.`
Validation: `name` required unique on `roles` (ignoring self on update); `permissions` required array on sync.

**PermissionController.** CRUD on permissions, `search` filter, no pagination. Delete blocked when the permission is attached to any role — `Cannot delete permission that is currently assigned to roles.`

**UserController.** Read-only listing of **all** users with roles and direct permissions; filters `search` (name/email) and `role`; pagination `per_page` default 10. The mapped payload hard-codes `employeeStatus: 'Active'` for every row and derives `designation` from the first role name.

**UserPermissionController::syncPermissions.** Validates `permissions` required array, `permissions.*` string exists on `permissions`. Guards: cannot modify your own permissions (`You cannot modify your own permissions.`), cannot modify a `super-admin` (`Cannot modify permissions for super-admin.`), cannot modify a `customer` (`Cannot modify permissions for a customer.`). Wrapped in a transaction.

> There are **no routes to create, edit, or delete users** and no route to assign a *role* to an existing user outside HRM → Employees. `RoleAssignment.tsx` exists in `resources/js/Pages/` but no controller renders it.

---

### 4.19 Notifications

Routes (all `auth`): `GET /notifications`, `POST /notifications/{id}/read`, `POST /notifications/read-all`, `DELETE /notifications/{id}`, `DELETE /notifications`. Page `Notifications`, paginate 20.

Notifications are Laravel database notifications on the `notifications` table (`uuid` PK, `type`, morph `notifiable`, `data`, `read_at`).

Defined notifications:
* `OrderCreatedNotification` — channel `database`; payload `order_id`, `order_number`, `customer_name`, `total_amount`, `message` (`New order created: {number} for BDT {amount}`), `action_url = /orders/{id}`. Dispatched only from `CheckoutController` to all `super-admin` and `admin` users.
* `OrderApprovedNotification` — channel `database`; payload `order_id`, `order_number`, `status: approved`, message, `action_url`. **Never dispatched anywhere in the codebase.**

The unread count and the latest 10 notifications are shared globally through `HandleInertiaRequests` and rendered by `components/layout/NotificationsMenu.tsx`.

---

### 4.20 Dashboard

Route `GET /dashboard` (`dashboard`), inside the staff role group, with **no permission middleware**. Page `Dashboard`.

**Props**

| Prop | Content |
|---|---|
| `stats.revenue` | This-month vs. last-month `SUM(orders.total_amount)` by `order_date`, with `change_percentage` and `trend` |
| `stats.orders` | Same comparison on order count |
| `stats.active_customers` | Total `role('customer')` count + month-over-month change |
| `stats.profit` | Margin formula (see Reports) per month |
| `stats.pending_orders_count` | `orders.order_status = pending` |
| `stats.today_stats` | today's orders, sales, new customers, out-of-stock count, low-stock count |
| `charts.revenue_trend` | last 6 months of sales and profit |
| `charts.category_distribution` | top 5 categories by `SUM(order_items.quantity)` |
| `charts.customer_growth` | last 6 months, `new` customers vs. `returning` (distinct `user_id` with an earlier order) |
| `top_products` | top 5 by quantity; `trend` and `change` are **hard-coded** to `'up'` / `'+0%'` |
| `recent_orders` | latest 5 orders |
| `low_stock_products` / `out_of_stock_products` | from `StockService`, limit 5 |

The profit SQL uses the MySQL-specific `IF(...)` function and `DB::raw`, so the dashboard and reports are **MySQL-bound**.

---

## 5. User Roles & Permissions

### 5.1 Roles defined in code

Seeded by `database/seeders/RoleSeeder.php`:

| Role | Created by | Notes |
|---|---|---|
| `super-admin` | `RoleSeeder`, `AdminSeeder` | Receives all permissions; additionally **bypasses every permission check** via the `User::hasPermissionTo()` override |
| `admin` | `RoleSeeder` | Broad back-office permissions |
| `sales` | `RoleSeeder` | Product view + order view/create/update |
| `accountant` | `RoleSeeder` | `order.view` only (plus `accounting.view` if `SecurityPermissionSeeder` runs) |
| `customer` | `RoleSeeder` | No permissions; assigned automatically on OTP registration and POS/Service quick-customer creation |

`AdminSeeder` creates `superadmin@example.com` with password `admin123` and the `super-admin` role.
`CustomerSeeder` seeds customer users (see `database/seeders/CustomerSeeder.php`).

**Roles are also used as an implicit "technician" pool:** `ServiceInvoiceController::create()` lists `User::role(['admin','super-admin','sales'])` as technicians. There is no dedicated technician role.

### 5.2 Super-admin bypass

`app/Models/User.php` aliases the Spatie trait method and overrides it:

```php
public function hasPermissionTo($permission, $guardName = null): bool
{
    if ($this->isSuperAdmin()) { return true; }
    return $this->hasPermissionToFromTrait($permission, $guardName);
}
```

Because `config('permission.register_permission_check_method') === true`, Spatie registers a Gate check that routes through `hasPermissionTo`, and `PermissionMiddleware` calls `$user->canAny(...)`. The override therefore makes `super-admin` pass every `permission:` middleware regardless of the pivot tables.

### 5.3 Permission catalogue

Three seeders create permissions. **Only `RoleSeeder` is registered in `DatabaseSeeder`**; `SecurityPermissionSeeder` and `InventoryPermissionSeeder` must be run manually.

**`RoleSeeder`** creates: `user.view/create/update/delete`, `role.view/create/update/delete`, `permission.view/create/update/delete`, `product.view/create/update/delete`, `unit.view/create/update/delete`, `category.view/create/update/delete`, `brand.view/create/update/delete`, `attribute.view/create/update/delete`, `order.view/create/update/delete`, `supplier.view/create/update/delete`, `inventory.view_history`, `inventory.adjust`, `restock.view/create/receive/delete`, `hrm.employee.view/manage`, `hrm.attendance.view/manage`, `hrm.payroll.view/manage`, `hrm.leave.view/manage`, `report.view`, `report.export`.

**`SecurityPermissionSeeder`** creates: `role.view`, `role.manage`, `permission.view`, `permission.manage`, `user.manage`, `user.view`, `accounting.view`, `product.view/create/edit/delete`, `brand.view/create/edit/delete`, `category.view/create/edit/delete`, `pos.view`, `pos.checkout`, `order.view`, `order.manage`.

**`InventoryPermissionSeeder`** creates the supplier / inventory / restock permissions and grants them to `super-admin` and `admin`.

### 5.4 Role → permission matrix (as seeded by `RoleSeeder`)

| Permission group | super-admin | admin | sales | accountant | customer |
|---|:--:|:--:|:--:|:--:|:--:|
| All permissions (`syncPermissions(Permission::all())`) | ✅ | — | — | — | — |
| `user.view / create / update` | ✅ | ✅ | — | — | — |
| `user.delete` | ✅ | — | — | — | — |
| `role.*`, `permission.*` | ✅ | — | — | — | — |
| `product.*`, `unit.*`, `category.*`, `brand.*`, `attribute.*` | ✅ | ✅ | `product.view` only | — | — |
| `order.view / create / update / delete` | ✅ | ✅ | view, create, update | `order.view` | — |
| `supplier.*`, `inventory.*`, `restock.*` | ✅ | ✅ | — | — | — |
| `hrm.*` (employee, attendance, payroll, leave — view + manage) | ✅ | ✅ | — | — | — |
| `report.view`, `report.export` | ✅ | ✅ | — | — | — |

Adding `SecurityPermissionSeeder` on top grants `admin`: `role.view`, `permission.view`, `accounting.view`, `user.view`, `role.manage`; and `accountant`: `accounting.view`.

### 5.5 Route → permission map (authoritative — what the code actually requires)

| Area | Required permission(s) |
|---|---|
| Any dashboard route | role `super-admin` **or** `admin` **or** `sales` **or** `accountant` |
| `/dashboard`, `/register` (GET) | (role only, no permission) |
| Products (all actions) | `product.view` + one of `product.view / product.create / product.edit / product.delete` |
| Units | `product.view` (route) + `unit.view / unit.create / unit.edit / unit.delete` |
| Attributes | `product.view` (route) + `product.view / product.create / product.edit / product.delete` |
| Brands | `brand.view` (route) + `brand.view / brand.create / brand.edit / brand.delete` |
| Categories | `category.view` (route) + `category.view / category.create / category.edit / category.delete` |
| POS page | `pos.view` |
| POS checkout | `pos.checkout` |
| Service invoice list / invoice | `order.view` |
| Service invoice create / store | `order.manage` |
| Service Types (all) | `order.manage` |
| Orders list / show / invoice | `order.view` |
| Order status update | `order.manage` |
| Suppliers | `supplier.view / create / update / delete` |
| Inventory history | `inventory.view_history` |
| Inventory adjust | `inventory.adjust` |
| Restock orders | `restock.view / create / receive / delete` |
| Roles | `role.view` (index) + `role.manage` (write) |
| Permissions | `permission.view` (index) + `permission.manage` (write) |
| User permission sync | `user.manage` |
| Users list | `user.view` |
| Accounting (entire prefix, read **and** write) | `accounting.view` |
| HRM employees | `hrm.employee.view` / `hrm.employee.manage` |
| HRM attendance | `hrm.attendance.view` / `hrm.attendance.manage` |
| HRM leaves | `hrm.leave.view` (index **and** create) / `hrm.leave.manage` (status) |
| HRM payroll | `hrm.payroll.view` / `hrm.payroll.manage` |
| Reports | `report.view`; exports also `report.export` |

### 5.6 Permission naming mismatch (critical)

The code requires several permissions that `RoleSeeder` never creates, while `RoleSeeder` creates several that nothing checks:

| Required by code | Seeded by `RoleSeeder`? | Seeded by `SecurityPermissionSeeder`? |
|---|:--:|:--:|
| `product.edit`, `brand.edit`, `category.edit` | ❌ (creates `*.update`) | ✅ |
| `unit.edit` | ❌ (creates `unit.update`) | ❌ (not created anywhere) |
| `pos.view`, `pos.checkout` | ❌ | ✅ |
| `order.manage` | ❌ (creates `order.create/update/delete`) | ✅ |
| `role.manage`, `permission.manage`, `user.manage` | ❌ | ✅ (`user.manage` created, granted only to super-admin) |
| `accounting.view` | ❌ | ✅ |

| Seeded but never checked anywhere | Note |
|---|---|
| `attribute.view/create/update/delete` | Attributes are gated on `product.*` |
| `user.create`, `user.update`, `user.delete` | No user CRUD routes exist |
| `role.create/update/delete`, `permission.create/update/delete` | Code uses `*.manage` |
| `order.create`, `order.delete` | Code uses `order.manage` |
| `product.update`, `brand.update`, `category.update`, `unit.update` | Code uses `*.edit` |

Because `RoleSeeder` uses `syncPermissions()` (replace, not merge), **running `RoleSeeder` after `SecurityPermissionSeeder` wipes the security permissions from `admin` and `accountant`**. Seeder order is therefore significant.

### 5.7 Role-specific restrictions enforced in code

| Restriction | Location | Message |
|---|---|---|
| Non-staff cannot use admin login | `AuthController::adminLogin` | `Access denied. Only administrators can access the dashboard.` |
| Deactivated employee cannot log in | `AuthController::login` / `adminLogin` | `Your account has been deactivated. Please contact the administrator.` |
| Only super-admin may assign `super-admin` | `EmployeeController::store` / `update` | `Unauthorized: Only super-admins can assign the super-admin role.` |
| Only super-admin may change credentials/role of an admin account | `EmployeeController::update` | `Unauthorized: You cannot modify credentials or roles for administrative accounts.` |
| Cannot edit your own permissions | `UserPermissionController` | `You cannot modify your own permissions.` |
| Cannot edit super-admin / customer permissions | `UserPermissionController` | `Cannot modify permissions for super-admin.` / `... for a customer.` |
| System roles are immutable | `RoleController` | `Cannot modify system roles.` |
| Only super-admin deletes expenses older than 24 h | `ExpenseController::destroy` | `Financial records older than 24 hours cannot be deleted...` |
| Non-managers see only their own leave requests | `LeaveController::index` | (filtered silently) |
| Order/address ownership | `AccountController` | HTTP 403 |

---

## 6. Business Workflows

### 6.1 Online order (storefront checkout)

```
Initial State
    Product active, stock available; cart populated (DB for logged-in user, session for guest)
        ↓
User Action
    POST /checkout  (first_name, last_name, phone, address, city, payment_method)
        ↓
Validation
    All six fields required; cart must not be empty
        ↓
Approval / Processing
    DB transaction:
      subtotal = Σ(price × qty), total = subtotal
      Order created  → order_number = ORD-{Ymd}-{6 hex}
      OrderItems created
      StockService::recordSale()  → type 'out', stock_transactions rows
      Cart cleared
    Commit → OrderCreatedNotification to all super-admin + admin
        ↓
Status Change
    order_status = pending ; status = pending ; payment_status = pending ; source = online ; type = sales
        ↓
Final State
    Order visible in /orders and in the customer's /my-account; stock already deducted
```

### 6.2 Order fulfilment (staff)

```
Initial State
    Order with order_status = pending
        ↓
User Action
    PATCH /orders/{order}/status   (order_status and/or payment_status)   [permission: order.manage]
        ↓
Validation
    order_status ∈ {pending, processing, shipped, delivered, cancelled}
    payment_status ∈ {pending, paid, failed, partially_paid}
    (no transition matrix — any value from any state)
        ↓
Approval / Processing
    Order::saving hook mirrors order_status ⇄ status
    Order::updated hook: if status became 'cancelled' → StockService::returnStock()
        ↓
Status Change
    order_status / status / payment_status updated
        ↓
Final State
    Order at the new status; on cancellation, stock restored via 'in' transactions
```

### 6.3 Customer order cancellation

```
Initial State
    Order owned by the customer with status = 'pending'
        ↓
User Action
    POST /my-account/orders/{order}/cancel  { reason }
        ↓
Validation
    Ownership (403 otherwise); status must be exactly 'pending'; reason required, max 1000
        ↓
Processing
    status = 'cancelled'; cancel_reason = reason; cancelled_by = Auth::id(); save()
    Order::updated hook → StockService::returnStock()
        ↓
Status Change
    pending → cancelled   (order_status mirrored by the saving hook)
        ↓
Final State
    Cancelled order with reason + canceller recorded; stock restored
```

### 6.4 POS sale

```
Initial State
    Operator on /pos with cart lines built from active products
        ↓
User Action
    POST /pos/checkout  (items[], customer_id OR customer_phone, payment_method, discount, tax_percentage, note)
        ↓
Validation
    items ≥ 1; customer_id required_without customer_phone (and vice versa);
    payment_method ∈ {cash, credit, bank_transfer, card, mobile_banking}
        ↓
Approval / Processing
    DB transaction:
      Server re-prices every line (variant->price or product->base_price)
      Totals: subtotal → discount → tax
      Customer resolved or auto-created (+ 'customer' role)
      Order created: order_number = POS-{6-digit}, source = pos, created_by = approved_by = operator
      OrderItems created; StockService::recordSale()
    Commit
        ↓
Status Change
    status / order_status = delivered  (immediately, no intermediate state)
    payment_status = pending (column default — never set by this flow)
        ↓
Final State
    Completed POS order; stock deducted; order appears in Accounting → Customer Dues
    because paid_amount = 0 and payment_status = pending
```

### 6.5 Service invoice

```
Initial State
    Operator on /services/create; service types seeded; technician users exist
        ↓
User Action
    POST /services  (customer, technician_id, service_type, service_charge, parts[], tax_percentage, discount, payment_method)
        ↓
Validation
    technician_id, service_type, service_charge, payment_method required;
    customer_id required_without customer_phone; each part needs product_id, quantity, unit_price
        ↓
Approval / Processing
    DB transaction:
      Parts re-priced server-side; subtotal = parts + service_charge
      Fixed discount, then tax
      Order created: order_number = SRV-{6-digit}, type = service, item_type = service_part
      StockService::recordSale() runs ONLY if at least one part exists
    Commit → redirect to services.index
        ↓
Status Change
    status = delivered   (immediate)
        ↓
Final State
    Service invoice listed at /services; HTML invoice at /services/{order}/invoice
```

### 6.6 Restock (purchase order) receiving

```
Initial State
    Supplier active; restock order created with status = 'pending'
        ↓
User Action
    POST /restock-orders/{id}/receive     [permission: restock.receive]
        ↓
Validation
    Row locked (lockForUpdate); status must be 'pending'
    → otherwise "Only pending orders can be received."
        ↓
Processing
    status = 'received'; received_at = now()
    StockService::recordRestock() → 'in' transaction per line, product + variant stock incremented
        ↓
Status Change
    pending → received     (irreversible; received orders cannot be deleted)
        ↓
Final State
    Stock increased, ledger written, order eligible for supplier-due payments
```

### 6.7 Payment recording (customer or supplier due)

```
Initial State
    Order or RestockOrder with payment_status ∈ {pending, partially_paid}
        ↓
User Action
    POST /accounting/payments   (payable_type, payable_id, amount, payment_date, payment_method, type)
        ↓
Validation
    payable_type ∈ {App\Models\Order, App\Models\RestockOrder}; amount ≥ 1;
    payment_method ∈ {cash, bank_transfer, mobile_banking, card}; type ∈ {in, out}
        ↓
Processing
    DB transaction; payable locked
    due = total_amount − paid_amount
    amount > due → "Payment amount cannot exceed the due amount (x)."
    Payment row created; paid_amount += amount
        ↓
Status Change
    paid_amount ≥ total_amount → payment_status = 'paid'
    otherwise                  → payment_status = 'partially_paid'
        ↓
Final State
    Payment appears in /accounting/payments, the cashbook, and profit & loss
```

### 6.8 Leave request

```
Initial State
    Employee logged in with hrm.leave.view
        ↓
User Action
    POST /hrm/leaves  (type, start_date, end_date, reason)
        ↓
Validation
    type ∈ {casual, sick, annual}; end_date ≥ start_date;
    no overlapping pending/approved request for the same user
        ↓
Approval / Processing
    Manager (hrm.leave.manage) → PATCH /hrm/leaves/{id}/status
        ↓
Status Change
    pending → approved   |   pending → rejected   |   back to pending (allowed)
        ↓
Final State
    Leave request recorded; no linkage to the attendance grid or payroll deduction
```

### 6.9 Payroll generation

```
Initial State
    Active employee profiles with base_salary; attendance recorded for the month
        ↓
User Action
    POST /hrm/payroll/generate  { month_year: 'YYYY-MM' }   [hrm.payroll.manage]
        ↓
Validation
    month_year must match date_format:Y-m
        ↓
Processing
    Per active employee:
      deductionDays = absent + 0.5 × half-day
      deduction     = base_salary / daysInMonth × deductionDays
      netSalary     = max(base_salary + 0 − deduction, 0)
      Salary::updateOrCreate(user_id + month_year)
        ↓
Status Change
    Salary row status = 'pending'  (reset on every regeneration)
    PATCH /hrm/payroll/{id}/status → 'paid'  (and reversible to 'pending')
        ↓
Final State
    Salary rows for the month; no journal entry is written to Accounting
```

### 6.10 OTP login and cart merge

```
Initial State
    Guest browsing with a session cart
        ↓
User Action
    POST /api/auth/send-otp { phone }
        ↓
Validation
    phone required, min 11 chars; ≤ 3 requests per phone per 10 minutes (else HTTP 429)
        ↓
Processing
    User found or created (role 'customer'); 6-digit OTP; 5-minute expiry; SendSmsJob queued
        ↓
User Action
    POST /api/auth/verify-otp { phone, otp }
        ↓
Validation
    Matching phone + otp + otp_expires_at > now, else HTTP 422 "Invalid or expired OTP."
        ↓
Processing
    OTP cleared; Auth::login(remember = true)
    session('cart') merged into carts table; session cart forgotten; session regenerated
        ↓
Final State
    Authenticated customer with a persisted cart; JSON redirect to shop.index
```

---

## 7. Status & Status Transitions

### 7.1 `orders.order_status` / `orders.status`

Two columns hold the same value. `orders.order_status` is `ENUM('pending','processing','shipped','delivered','cancelled')` (default `pending`); `orders.status` is a plain `string` (default `pending`). The `Order` model keeps them in sync:

* `creating` — copies whichever of the two is set into the other.
* `saving` — if `order_status` is dirty, `status = order_status`; else if `status` is dirty, `order_status = status`.
* `updated` — if `status` is dirty **and** equals `cancelled`, calls `StockService::returnStock($order)`.

| From \ To | pending | processing | shipped | delivered | cancelled |
|---|:--:|:--:|:--:|:--:|:--:|
| pending | ✅ | ✅ | ✅ | ✅ | ✅ |
| processing | ✅ | ✅ | ✅ | ✅ | ✅ |
| shipped | ✅ | ✅ | ✅ | ✅ | ✅ |
| delivered | ✅ | ✅ | ✅ | ✅ | ✅ |
| cancelled | ✅ | ✅ | ✅ | ✅ | ✅ |

All transitions are permitted by `OrderController::updateStatus`. The **only** guarded transition in the system is the customer-facing cancel, which requires `status === 'pending'`.

Entry points by source:
* `online` (checkout) → starts at `pending`.
* `pos` → created directly at `delivered`.
* `service` (`type = service`, `source = pos`) → created directly at `delivered`.

### 7.2 `orders.payment_status`

`ENUM('pending','paid','failed','partially_paid')`, default `pending`.

| Set by | Values |
|---|---|
| `CheckoutController` | `pending` (explicit) |
| POS / Service Invoice | not set → column default `pending` |
| `OrderController::updateStatus` | any of the four, freely |
| `Accounting\PaymentController::store` | `partially_paid` or `paid` (never back to `pending`, never `failed`) |

`failed` is never set automatically by any flow.

### 7.3 `restock_orders.status`

`ENUM('pending','received','cancelled')`, default `pending`.

```
pending ──receive──▶ received      (terminal; cannot be deleted)
   │
   └──destroy──▶ (row deleted)
```

`cancelled` is defined in the enum but **never written by any code path**.

### 7.4 `restock_orders.payment_status`

`ENUM('pending','partially_paid','paid','failed')`, default `pending`. Only `PaymentController` moves it, to `partially_paid` or `paid`.

### 7.5 `leave_requests.status`

`ENUM('pending','approved','rejected')`, default `pending`. `LeaveController::updateStatus` allows any of the three at any time (including reverting an approved leave to pending).

### 7.6 `salaries.status`

`ENUM('pending','paid')`, default `pending`. `PayrollController::updateStatus` allows both directions. Payroll regeneration resets the row to `pending`.

### 7.7 `attendances.status`

Originally `ENUM('present','absent','half-day','on-leave')`, widened to `string(50)` by migration `2026_04_11_055046_update_status_enum_on_attendances_table`. Server-side validation accepts **any** string. The attendance grid additionally recognises `late` when computing `total_present`.

### 7.8 Other status-like fields

| Field | Type | Values |
|---|---|---|
| `orders.type` | string, default `sales` | `sales`, `service` |
| `orders.source` | ENUM, default `online` | `online`, `pos` |
| `orders.discount_type` | string, default `fixed` | `percentage`, `fixed` |
| `order_items.item_type` | ENUM, default `product` | `product`, `service_part` |
| `order_items.price_type` | string, default `flat` | `flat` (only value written) |
| `products.product_type` | ENUM, default `simple` | `simple`, `variant` |
| `stock_transactions.type` | ENUM | `in`, `out`, `adjustment`, `return` (`return` is never written) |
| `payments.type` | ENUM | `in`, `out` |
| `payments.payment_method` | ENUM | `cash`, `bank_transfer`, `mobile_banking`, `card` |
| `user_addresses.type` | string, default `shipping` | validated as `home`, `office`, `shipping` |
| `designations.status` | ENUM, default `active` | `active`, `inactive` — table has no model and no code reference |

---

## 8. Database Structure

**Engine:** MySQL. **Soft deletes:** none — no model uses `SoftDeletes` and no migration declares `softDeletes()`. All deletions are permanent.

### 8.1 Table inventory

| Table | Purpose | Notable constraints |
|---|---|---|
| `users` | All accounts (customers and staff) | `email` unique **nullable**, `phone` unique nullable, `password` nullable (OTP accounts) |
| `password_reset_tokens` | Laravel default | PK `email` |
| `sessions` | Session driver = database | PK `id` |
| `cache`, `cache_locks` | Cache driver = database | PK `key` |
| `jobs`, `job_batches`, `failed_jobs` | Queue driver = database | — |
| `personal_access_tokens` | Sanctum | `token` unique |
| `permissions`, `roles`, `model_has_permissions`, `model_has_roles`, `role_has_permissions` | Spatie RBAC | unique `(name, guard_name)`; composite PKs on pivots |
| `designations` | **Orphan** — no model, no controller, no reference | — |
| `brands` | Brand master | `name` unique, `slug` unique |
| `categories` | Self-referencing category tree | `name` unique, `slug` unique, `parent_id` → categories cascade |
| `notifications` | Laravel database notifications | UUID PK, morph `notifiable` |
| `units` | Unit of measure | — |
| `products` | Product master | `slug` unique, `sku` unique nullable, `barcode` unique nullable |
| `product_variants` | Variant rows | `sku` unique nullable, `barcode` unique nullable |
| `attributes` | Attribute names | **no unique index on `name`** (enforced only by validation) |
| `attribute_values` | Attribute values | FK → attributes cascade |
| `product_variant_attribute_values` | Variant ⇄ attribute-value pivot | unique `(product_variant_id, attribute_value_id)` as `variant_attr_val_unique` |
| `product_images`, `variant_images` | Image rows | `created_at` only (`const UPDATED_AT = null` on the models) |
| `wishlists` | User ⇄ product | **no unique composite index** |
| `carts` | Persistent cart | **no unique composite index** |
| `orders` | Sales + service orders | `order_number` unique |
| `order_items` | Order lines | — |
| `user_addresses` | Address book | — |
| `suppliers` | Supplier master | — |
| `restock_orders` | Purchase orders | `order_number` unique |
| `restock_order_items` | PO lines | — |
| `stock_transactions` | Immutable stock ledger | — |
| `employee_profiles` | Employee extension of `users` | **no unique index on `user_id`** despite a `hasOne` relation |
| `attendances` | Daily attendance | unique `(user_id, date)` |
| `leave_requests` | Leave applications | — |
| `salaries` | Monthly payroll | unique `(user_id, month_year)` |
| `expense_categories` | Expense taxonomy | `name` unique |
| `expenses` | Expense entries | FK `expense_category_id` **restrict** |
| `payments` | Polymorphic money movements | morph `payable` |
| `service_types` | Service catalogue | **no unique index on `name`** (enforced only by validation) |

### 8.2 Key column detail

**`orders`**

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK | |
| `order_number` | string unique | `ORD-{Ymd}-{hex}` (online), `POS-{000001}`, `SRV-{000001}` |
| `type` | string default `sales` | `sales` \| `service` |
| `service_type` | string nullable | free text copied from `service_types.name` |
| `technician_id` | FK → users, `set null` | |
| `order_date` | datetime, `useCurrent` | used by Dashboard and Reports |
| `user_id` | FK → users, `set null` nullable | |
| `customer_name`, `customer_phone` | string | denormalised snapshot |
| `customer_email` | string nullable | |
| `shipping_address` | text | `POS Transaction` / `Service Center` for counter sales |
| `billing_address` | text nullable | never written by any controller |
| `subtotal` | decimal(12,2) | |
| `discount`, `discount_amount` | decimal(12,2) default 0 | `discount` = raw input, `discount_amount` = computed |
| `discount_type` | string default `fixed` | |
| `shipping_amount` | decimal(12,2) default 0 | never written |
| `tax_percentage` | decimal(5,2) default 0 | |
| `tax_amount` | decimal(12,2) default 0 | |
| `service_charge` | decimal(12,2) default 0 | |
| `total_amount` | decimal(12,2) | |
| `paid_amount` | decimal(12,2) default 0 | maintained by `PaymentController` |
| `payment_method` | string | |
| `payment_status` | ENUM | `pending`\|`paid`\|`failed`\|`partially_paid` |
| `order_status` | ENUM | `pending`\|`processing`\|`shipped`\|`delivered`\|`cancelled` |
| `status` | string default `pending` | mirror of `order_status` |
| `cancel_reason` | text nullable | |
| `cancelled_by` | FK → users, `set null` | |
| `source` | ENUM default `online` | `online`\|`pos` |
| `created_by`, `approved_by` | FK → users, `set null` | |
| `notes` | text nullable | |

**`order_items`:** `order_id` (cascade), `product_id` (cascade), `variant_id` (`set null`), `product_variant_id` (`set null`), `product_name`, `variant_name`, `quantity`, `bonus_quantity` (default 0), `unit_price`, `cost_price` (default 0), `price_type` (default `flat`), `total_price`, `item_type` (ENUM `product`\|`service_part`).

**`products`:** `category_id` (cascade), `brand_id` (`null on delete`), `unit_id` (`null on delete`), `name`, `slug` unique, `description`, `product_type`, `base_price`, `cost_price`, `sku` unique, `barcode` unique, `stock` (int default 0), `low_stock_alert` (int nullable default 5), `is_active`.

**`stock_transactions`:** `product_id` (cascade), `product_variant_id` (cascade, nullable), `user_id` (`set null`), `type` ENUM (`in`,`out`,`adjustment`,`return`), `quantity`, `balance_after`, `reference_type` + `reference_id` (manual polymorphic pair — `Order` or `RestockOrder`), `reason`.

**`payments`:** `morphs('payable')` → `payable_type` + `payable_id` (+ index), `amount`, `payment_date`, `payment_method` ENUM, `type` ENUM (`in`,`out`), `note`, `created_by` (`set null`).

### 8.3 Relationship map

**One-to-many**

| Parent | Child | Relation |
|---|---|---|
| Category | Category (self) | `parent` / `children` |
| Category | Product | `products` |
| Brand | Product | `products` |
| Unit | Product | `products` |
| Product | ProductVariant | `variants` |
| Product | ProductImage | `images` (ordered by `sort_order`) |
| Product | Wishlist, OrderItem, RestockOrderItem, StockTransaction | `wishlists`, `orderItems`, `restockOrderItems`, `transactions` |
| ProductVariant | VariantImage | `images` |
| Attribute | AttributeValue | `values` |
| Order | OrderItem | `items` |
| Supplier | RestockOrder | `restockOrders` |
| RestockOrder | RestockOrderItem | `items` |
| ExpenseCategory | Expense | `expenses` |
| User | UserAddress, Attendance, LeaveRequest, Salary | `addresses`, `attendances`, `leaveRequests`, `salaries` |

**One-to-one**

| Owner | Related | Relation |
|---|---|---|
| Product | ProductImage where `is_primary` | `primaryImage` |
| ProductVariant | VariantImage where `is_primary` | `primaryImage` |
| User | EmployeeProfile | `employeeProfile` |

**Many-to-many**

| Left | Right | Pivot |
|---|---|---|
| ProductVariant | AttributeValue | `product_variant_attribute_values` |
| User | Role | `model_has_roles` (Spatie) |
| User | Permission (direct) | `model_has_permissions` (Spatie) |
| Role | Permission | `role_has_permissions` (Spatie) |

**Polymorphic**

| Model | Relation | Targets |
|---|---|---|
| `Payment` | `payable` (`morphTo`) | `Order`, `RestockOrder` (both declare `morphMany payments`) |
| `StockTransaction` | `reference` (`morphTo`) | written manually as `App\Models\Order` / `App\Models\RestockOrder`; `RestockOrder::transactions` is a `morphMany` on `reference` |
| `User` | `notifications` | Laravel `notifications` table |

**Multiple FKs to `users` on `orders`:** `user_id` (customer), `created_by`, `approved_by`, `cancelled_by`, `technician_id` — each with its own belongsTo (`user`, `creator`, `canceller`, `technician`; `approved_by` has **no relation method**).

### 8.4 Computed accessors

| Model | Accessor | Formula |
|---|---|---|
| `Product` | `price` | `base_price` if `> 0`, else min variant price, else `0` |
| `Product` | `old_price` | `round(price × 1.15, 2)` or `null` |
| `Product` / `ProductVariant` | `is_low_stock` | `low_stock_alert !== null && stock <= low_stock_alert` |
| `ProductVariant` | `profit` | `price − cost_price` |
| `Order` / `RestockOrder` | `due_amount` | `total_amount − paid_amount` |

### 8.5 Module → table dependency

| Module | Owns | Reads / writes |
|---|---|---|
| Catalog | products, product_variants, product_images, variant_images, attributes, attribute_values, pivot, units, brands, categories | — |
| Storefront | — | products, categories, brands, wishlists |
| Cart | carts | products, product_variants |
| Orders / Checkout / POS / Service | orders, order_items | products, product_variants, users, service_types, stock_transactions |
| Inventory | stock_transactions | products, product_variants |
| Restock | restock_orders, restock_order_items | suppliers, products, product_variants, stock_transactions |
| Accounting | expenses, expense_categories, payments | orders, restock_orders, users |
| HRM | employee_profiles, attendances, leave_requests, salaries | users, roles |
| RBAC | roles, permissions, pivots | users |
| Reports / Dashboard | — | orders, order_items, products, categories, users |

---

## 9. API & Backend

### 9.1 `routes/api.php`

All routes are behind `auth:sanctum`.

| Method | URI | Handler | Notes |
|---|---|---|---|
| GET | `/api/user` | closure | returns `$request->user()` |
| GET | `/api/attributes` | `AttributeController@index` | Returns an **Inertia response**, not JSON |
| POST | `/api/attributes` | `AttributeController@store` | Redirect response |
| PUT/PATCH | `/api/attributes/{attribute}` | `AttributeController@update` | Redirect response |
| DELETE | `/api/attributes/{attribute}` | `AttributeController@destroy` | Redirect response |
| POST | `/api/attributes/{attribute}/values` | `AttributeController@addValue` | **Method does not exist on the controller** |

`apiResource` also registers `GET /api/attributes/{attribute}` (`show`), which the controller does not implement.

### 9.2 JSON endpoints declared in `web.php`

| Method | URI | Auth | Response |
|---|---|---|---|
| POST | `/api/auth/send-otp` | none | `{ success, message, otp_preview? }`; 429 when rate-limited; 422 on validation error |
| POST | `/api/auth/verify-otp` | none | `{ success, redirect }` or 422 `{ success:false, message:'Invalid or expired OTP.' }` |
| GET | `/products/barcode/{barcode}` | `auth` + staff role + `permission:product.view` | Product or ProductVariant JSON; 404 `{ "message": "Product not found" }` |

### 9.3 Authentication and authorisation

* **Web:** session-based (`SESSION_DRIVER=database`), CSRF via the standard `web` group, Inertia XHR.
* **API:** `auth:sanctum`. `User` uses `HasApiTokens`, but **no route issues a token** — there is no token-creation endpoint. Sanctum stateful domains fall back to `localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1` plus the current app URL.
* **CORS** (`config/cors.php`): `paths => ['*']`, `allowed_methods => ['*']`, `allowed_origins => [env('APP_URL', '*')]`, `allowed_headers => ['*']`, `supports_credentials => true`.
* **Rate limiting:** `throttle:5,1` on both login POST routes; a custom cache-based limit of 3 OTP requests per phone per 10 minutes.

### 9.4 Response conventions

* Nearly every write returns `redirect()->back()` / `redirect()->route(...)` with a `success` or `error` flash. The frontend surfaces these through `FlashHandler` → toast.
* Validation failures return the standard Laravel 422 / redirect-with-errors, consumed by Inertia `useForm().errors`.
* Two exceptions to the flash convention: `RoleController` and `PermissionController` use the `message` flash key for successes and `error` for failures.

### 9.5 Backend logic worth noting

| Concern | Implementation |
|---|---|
| Concurrency | `lockForUpdate()` in `StockService::adjustStock`, `RestockOrderController::receive`, and `PaymentController::store` |
| Transactions | POS, Service Invoice, Checkout, Restock create/receive, Payment, Attendance, Employee create/update, Payroll generate, Attribute create/update, Product create/update/delete, User permission sync |
| Idempotency | None — no request-level idempotency key on POS/checkout submissions |
| Order number generation | `ORD-{Ymd}-{random hex}` (collision-safe-ish), `POS-`/`SRV-` derived from `Order::latest()->first()->id` (**not** collision-safe under concurrency) |
| Audit trail | `created_by`, `approved_by`, `cancelled_by` on orders; `created_by` on expenses, payments, restock orders; `user_id` on stock transactions |

---

## 10. Frontend Structure

### 10.1 Bootstrap

`resources/js/app.tsx` creates the Inertia app, resolves pages from `./Pages/**/*.tsx`, and wraps the tree in `QueryClientProvider` → `TooltipProvider` → `Toaster` (Radix) + `Sonner` + `App`. Progress bar colour `#4B5563`. Page title template: `` `${title} - ${appName}` ``.

`resources/views/app.blade.php` emits `@routes` (Ziggy — this is why `route()` works in TSX), `@viteReactRefresh`, and `@vite([...css, app.tsx, "resources/js/Pages/{$page['component']}.tsx"])`.

### 10.2 Layouts

| Layout | Composition |
|---|---|
| `DashboardLayout` | `FlashHandler` + `Sidebar` (fixed, `w-64`, `lg:translate-x-0`) + `Topbar` + `<main class="flex-1 p-4 md:p-6">`; mobile drawer state held locally |
| `ShopLayout` | `FlashHandler` + `ShopNavbar` + content + `ShopFooter` + `BottomNav` (`md:hidden`) |

### 10.3 Navigation (`components/layout/Sidebar.tsx`)

Flat items: Dashboard, Orders, POS, Service Invoices, Brands, Categories, Products, Attributes, Units.
Collapsible groups: **Inventory** (Stock History, Stock Adjust, Restock Orders, Suppliers), **HRM** (Employees, Attendance, Leaves, Payroll), **Accounting** (Expenses, Expense Categories, Payments, Customer Dues, Supplier Dues, Daily Sales, Profit & Loss, Cashbook), **Reports**, **Roles & Permissions** (Users, Manage Roles, Manage Permissions).

Visibility is driven by a local `hasPermission(p)` helper reading `auth.user.permissions`. Mapping used by the sidebar:

| Item | Gate |
|---|---|
| Orders | `order.view` |
| POS | `order.view` (code comment: "Simplified permission logic for now" — **the route requires `pos.view`**) |
| Brands / Categories / Products | `brand.view` / `category.view` / `product.view` |
| Attributes | `product.view` (comment: "Share permission for now") |
| Units | `unit.view` |
| Inventory group | any of `inventory.view_history`, `inventory.adjust`, `restock.view`, `supplier.view` |
| HRM group | `hrm.employee.view`, `hrm.attendance.view`, `hrm.leave.view`, `hrm.payroll.view` |
| Reports | `report.view` |
| Roles & Permissions | `user.view`, `role.view`, `permission.view` |
| Dashboard, Service Invoices | always visible (no gate) |

The brand label rendered in the sidebar header is **`SalesHub`**.

### 10.4 Pages

62 page components under `resources/js/Pages/`. Every page name produced by `Inertia::render()` has a matching `.tsx` file. Three pages exist without any controller reference:

| Orphan page | Note |
|---|---|
| `RoleAssignment.tsx` | No route or controller renders it |
| `NotFound.tsx` | No error-page wiring in `withExceptions` |
| `Profile.tsx`, `Settings.tsx` | Rendered by inline closures in `web.php` (`Inertia::render('Profile')` / `('Settings')`) with **no props** |

### 10.5 Reusable components

| Group | Components |
|---|---|
| Layout | `Sidebar`, `Topbar`, `ShopNavbar`, `ShopFooter`, `BottomNav`, `NotificationsMenu` |
| Shop | `ShopHero`, `CategoryGrid`, `FlashSale`, `NewArrivals`, `PopularBrands`, `PromotionalBanners`, `Service`, `YouMayLike`, `ProductCard` |
| Product admin | `ProductCard`, `ProductImageUploader`, `VariantBuilder` |
| Dashboard | `StatCard`, `TodayOrderCard` |
| Domain cards | `BrandCard`, `CategoryCard`, `RoleCard`, `PermissionCard` |
| Dialogs | `UserPermissionDialog` |
| Cross-cutting | `FlashHandler` (flash → toast) |
| UI kit | ~48 shadcn/Radix wrappers in `components/ui/` (accordion, alert-dialog, calendar, carousel, chart, command, dialog, drawer, dropdown-menu, form, input-otp, pagination, popover, select, sheet, sidebar, sonner, table, tabs, toast, tooltip, `RichTextEditor`, `scroll-wrapper`, …) |
| Hooks | `useAuth` (user, login, logout, sendOTP, verifyOTP), `useNotifications`, `use-mobile` |

### 10.6 Forms, tables, filters, modals

* **Forms** use Inertia `useForm()` (`data`, `setData`, `post/put/patch`, `processing`, `errors`, `reset`, `transform`). Field-level errors are rendered directly from `errors.{field}` with red border styling (e.g. `Pos/Index.tsx`).
* **Tables** are `components/ui/table` wrappers, with server-side pagination consuming Laravel's `links` / `meta` payload.
* **Filters** are debounced client-side and pushed with `router.get(url, params, { preserveState: true, replace: true })` (see `Orders/Index.tsx`).
* **Modals** use Radix `Dialog` for create/edit (Brands, Categories, Units, Attributes, Suppliers, Service Types, Employees, Users → permissions) and `AlertDialog` for delete confirmation.
* **Toasts** — both the Radix `Toaster` and `sonner` are mounted; `FlashHandler` writes into the Radix one.

### 10.7 Responsive behaviour

* Sidebar: off-canvas below `lg` with a backdrop overlay; fixed at `lg` and above (`lg:pl-64` on the content wrapper).
* Storefront: `BottomNav` shown only below `md` (`md:hidden`).
* `useIsMobile()` hook (`hooks/use-mobile.tsx`) drives the mobile overlay logic.
* Main content padding steps `p-4` → `md:p-6`.

### 10.8 Client-side dead links

`ShopNavbar.tsx` links to `/help`, for which no route exists.

---

## 11. Integrations

### 11.1 SMS gateway (OTP delivery)

| Aspect | Detail |
|---|---|
| Name | Greenweb SMS API (default) or Twilio (fallback branch) |
| Purpose | Deliver the 6-digit OTP for phone login |
| Trigger | `AuthController::sendOTP` → `SendSmsJob::dispatch($phone, $otp)` (queued, `QUEUE_CONNECTION=database`) |
| Data flow | Job → `SmsService::sendOTP()` → `SmsService::send()` → HTTP POST |
| Configuration | Read with `env()` directly inside `SmsService::__construct`: `SMS_API_URL` (default `http://api.greenweb.com.bd/api.php`), `SMS_API_TOKEN` (default `YOUR_API_TOKEN`), `SMS_SENDER_ID` (default `YOUR_SENDER_ID`); Twilio branch reads `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` |
| Provider selection | If `TWILIO_SID` is set → Twilio Messages API with basic auth and E.164 normalisation (`+88` prefix when the number does not start with `+`). Otherwise a plain POST of `token`, `to`, `message` to `SMS_API_URL` |
| Dummy mode | When `SMS_API_TOKEN` is still `YOUR_API_TOKEN` **and** `TWILIO_SID` is unset, the message is written to the log as `[DUMMY SMS GATEWAY] To: … | Message: …` and `true` is returned |
| Error handling | Non-2xx → `Log::error("SMS sending failed for {phone}. API Response: …")` and `false`; exceptions → `Log::error("Failed to connect to SMS API: …")` and `false`. **The failure is never surfaced to the user** — `sendOTP` has already returned success before the queued job runs |
| Related modules | Authentication, Customer account |
| Note | `SMS_API_URL`, `SMS_API_TOKEN`, `SMS_SENDER_ID` are **absent from `.env.example`**; the live `.env` in the repository defines `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`. `SMS_SENDER_ID` is read but never used in a request payload |

### 11.2 PDF generation (DomPDF)

| Aspect | Detail |
|---|---|
| Package | `barryvdh/laravel-dompdf` ^3.1 |
| Templates | `resources/views/invoices/order-invoice.blade.php`, `resources/views/invoices/service-invoice.blade.php`, `resources/views/pdf/report.blade.php` |
| Triggers | `OrderController::downloadInvoice`, `AccountController::downloadInvoice`, `ReportController::exportPdf` |
| Data flow | Eager-loaded Eloquent models → Blade → DomPDF → `download()` |
| Failure handling | None — no try/catch around PDF rendering |
| Note | `ServiceInvoiceController::downloadInvoice` returns the Blade **view**, not a PDF |

### 11.3 CSV export

`ReportController::exportCsv` streams `php://output` with `fputcsv` and explicit no-cache headers. No external dependency.

### 11.4 Internal integration points

| Integration | Trigger | Effect |
|---|---|---|
| `StockService` ⇄ Orders | POS store, Service Invoice store, Checkout store, `Order::updated` (cancel) | stock mutation + `stock_transactions` ledger row |
| `StockService` ⇄ Restock | `RestockOrderController::receive` | stock increment + ledger row |
| Database notifications | `CheckoutController::store` | `OrderCreatedNotification` to all `super-admin` + `admin` |
| Session cart ⇄ DB cart | `AuthController::verifyOTP` | merge and clear |
| Payments ⇄ Orders/RestockOrders | `PaymentController::store` | `paid_amount` and `payment_status` recomputation |
| Ziggy | `@routes` in `app.blade.php` | `route()` helper available in every `.tsx` |

### 11.5 Integrations not present

Payment gateway (bKash/Nagad/SSLCommerz/Stripe), email delivery (`MAIL_MAILER=log`), broadcasting/websockets (`BROADCAST_CONNECTION=log`), object storage (`FILESYSTEM_DISK=local`), search engine, and analytics are all **Not Found / Requires Verification**.

---

## 12. Module Dependencies

```
                            ┌───────────────┐
                            │  RBAC (Spatie)│
                            └──────┬────────┘
                                   │ gates every dashboard module
     ┌─────────────┬───────────────┼───────────────┬──────────────┐
     ▼             ▼               ▼               ▼              ▼
 ┌────────┐   ┌─────────┐    ┌──────────┐   ┌───────────┐  ┌───────────┐
 │ Catalog│   │ Orders  │    │Inventory │   │ Accounting│  │    HRM    │
 │(Brand, │──▶│ (Online,│───▶│(Stock    │◀──│(Expense,  │  │(Employee, │
 │Category│   │  POS,   │    │ ledger)  │   │ Payment)  │  │Attendance,│
 │Product,│   │ Service)│    └────▲─────┘   └─────▲─────┘  │Leave,     │
 │Unit,   │   └────┬────┘         │               │        │Payroll)   │
 │Attribute)       │              │               │        └─────┬─────┘
 └───┬────┘        │         ┌────┴─────┐         │              │
     │             │         │ Restock  │─────────┘              │
     │             │         │(Supplier)│  supplier dues         │
     │             │         └──────────┘                        │
     │             │                                             │
     │             └────────────▶ Reports / Dashboard ◀──────────┘
     │                                   ▲
     └───▶ Storefront ─▶ Cart ─▶ Checkout┘
                 │
                 └─▶ Wishlist        Notifications ◀── Checkout
```

| Module | Hard dependencies |
|---|---|
| Storefront | Product, Category, Brand, Wishlist |
| Cart | Product, ProductVariant |
| Checkout | Cart, Product, StockService, Notification, User |
| POS | Product, ProductVariant, Category, User (customer role), StockService |
| Service Invoice | ServiceType, Product, User (customer + technician), StockService |
| Order Management | Order, OrderItem, DomPDF, ServiceInvoice (invoice redirect) |
| Inventory | Product, ProductVariant, StockService |
| Restock | Supplier, Product, ProductVariant, StockService |
| Accounting → Payments | Order, RestockOrder |
| Accounting → Reports | Payment, Expense |
| HRM → Payroll | EmployeeProfile, Attendance |
| HRM → Attendance | User, EmployeeProfile, Role |
| Reports / Dashboard | Order, OrderItem, Product, Category, User, StockService |
| RBAC | User, Spatie tables |
| All dashboard modules | `HandleInertiaRequests` shared props (permissions drive the sidebar) |

---

## 13. Validation & Business Rules

### 13.1 Consolidated validation reference

| Module | Endpoint | Key rules |
|---|---|---|
| Auth | `login`, `adminLogin` | `login` required string, `password` required |
| Auth | `sendOTP` | `phone` required string min:11 |
| Auth | `verifyOTP` | `phone`, `otp` required string |
| Account | profile | `name` required max:255; `email` nullable email unique-ignore-self; `phone` required max:20 unique-ignore-self |
| Account | password | `password` required confirmed min:10 + letters + mixedCase + numbers + symbols; `current_password` conditional |
| Account | address | see 4.3 |
| Account | cancel | `reason` required max:1000 |
| Cart | store | `product_id` exists; `variant_id` nullable exists; `quantity` integer min:1 |
| Checkout | process | `first_name`, `last_name`, `phone`, `address`, `city`, `payment_method` all required string |
| Product | store/update | see 4.6 |
| Brand | store/update | `name` required max:255 unique; `slug` nullable unique; `logo` image ≤2 MB; `order` integer min:0 |
| Category | store/update | as Brand + `parent_id` nullable exists; `icon` nullable max:100 |
| Unit | store/update | `name` required max:255 unique; `abbreviation` nullable max:50 |
| Attribute | store/update | `name` required max:255 unique; `values.*.value` required max:255 |
| Supplier | store/update | `name` required max:255; `email` nullable email; `phone` nullable max:20 |
| POS | checkout | see 4.9 |
| Service | store | see 4.10 |
| Order | updateStatus | `order_status` in 5 values; `payment_status` in 4 values (both nullable) |
| Inventory | updateStock | `quantity` integer min:1; `type` in `in,out,adjustment`; `reason` required max:255 |
| Restock | store | `supplier_id` exists; `items` array min:1; `items.*.quantity` min:1; `items.*.cost_price` numeric min:0 |
| Expense Category | store/update | `name` required unique |
| Expense | store/update | `expense_category_id` exists; `amount` numeric min:0; `date` date |
| Payment | store | `payable_type` in 2 classes; `amount` numeric **min:1**; `payment_method` in 4; `type` in `in,out` |
| Service Type | store/update | `name` required max:255 unique; `charge` numeric min:0 |
| HRM Employee | store | `email` unique; `password` min:6; `role` exists:roles,name |
| HRM Attendance | store | `date` required date; `attendances.*.user_id` exists; `attendances.*.status` required string |
| HRM Leave | store | `type` in `casual,sick,annual`; `end_date` after_or_equal `start_date` |
| HRM Payroll | generate | `month_year` `date_format:Y-m` |
| Role | store/update | `name` required unique |
| Permission | store/update | `name` required unique |
| User permissions | sync | `permissions` required array; `permissions.*` exists:permissions,name |

### 13.2 Business rules index

| # | Rule | Enforced in |
|---|---|---|
| 1 | Deleting a product with sales or restock history is blocked | `ProductController::destroy` |
| 2 | Deleting a brand/category/unit in use is blocked | respective `destroy` |
| 3 | Deleting a category with sub-categories is blocked | `CategoryController::destroy` |
| 4 | Deleting an attribute whose values are used by variants is blocked | `AttributeController::destroy` |
| 5 | Deleting a supplier with restock orders is blocked | `SupplierController::destroy` |
| 6 | Deleting an expense category with expenses is blocked | `ExpenseCategoryController::destroy` |
| 7 | Deleting a permission attached to a role is blocked | `PermissionController::destroy` |
| 8 | System roles (`super-admin`, `admin`, `customer`) are immutable | `RoleController` |
| 9 | Expenses older than 24 h are super-admin-only deletions | `ExpenseController::destroy` |
| 10 | Cart quantity may not exceed available stock | `CartController::store` / `update` |
| 11 | `out` stock movement below zero throws `Insufficient stock…` | `StockService::adjustStock` |
| 12 | Only `pending` restock orders can be received | `RestockOrderController::receive` |
| 13 | `received` restock orders cannot be deleted | `RestockOrderController::destroy` |
| 14 | Payment may not exceed the outstanding due | `PaymentController::store` |
| 15 | Only `pending` orders can be cancelled by the customer | `AccountController::cancelOrder` |
| 16 | Cancelling an order restores stock | `Order::updated` hook |
| 17 | Attendance cannot be recorded for a future date | `AttendanceController::store` |
| 18 | One attendance record per user per day | unique index + `updateOrCreate` |
| 19 | Overlapping pending/approved leave is rejected | `LeaveController::store` |
| 20 | One salary row per user per month | unique index + `updateOrCreate` |
| 21 | Payroll deducts `base_salary / daysInMonth` per absent day (half-day = 0.5) | `PayrollController::generate` |
| 22 | Net salary is floored at 0 | `PayrollController::generate` |
| 23 | Deactivated employees cannot log in | `AuthController` |
| 24 | Only staff roles may use `/admin/login` | `AuthController::adminLogin` |
| 25 | Max 3 OTP requests per phone per 10 minutes; OTP valid 5 minutes | `AuthController::sendOTP` |
| 26 | Only one default address per user | `AccountController::storeAddress` / `updateAddress` |
| 27 | POS/Service prices are always recomputed server-side | `PosController`, `ServiceInvoiceController` |
| 28 | Super-admin bypasses every permission check | `User::hasPermissionTo` |
| 29 | Slugs are auto-generated and de-duplicated with a numeric suffix | Brand/Category/Product repositories |
| 30 | Order numbers are prefixed per source: `ORD-`, `POS-`, `SRV-`, `PO-` | Order model + controllers |

---

## 14. QA Testing Reference

### 14.1 Critical functionalities (highest risk first)

1. Stock deduction and restoration across all four write paths (checkout, POS, service invoice with parts, restock receive) — including the variant vs. simple-product distinction.
2. Payment recording and `payment_status` recomputation for both `Order` and `RestockOrder`.
3. Permission enforcement on every route (route-level **and** controller-level gates).
4. OTP send/verify, rate limiting, and session-cart merge.
5. Order status transitions and the cancellation → stock-return chain.
6. Product create/update with variants, attribute values, and image upload/removal.
7. Payroll generation arithmetic and re-generation behaviour.
8. Report and dashboard figures against raw data.

### 14.2 Positive scenarios

| # | Scenario | Expected |
|---|---|---|
| P1 | Guest browses `/`, opens a product, adds to cart, logs in via OTP | Session cart merges into the DB cart with correct quantities |
| P2 | Customer checks out with a valid address | Order `ORD-…` at `pending`, stock reduced, admin notification created |
| P3 | Customer cancels a `pending` order with a reason | Status `cancelled`, `cancel_reason` + `cancelled_by` stored, stock restored |
| P4 | Operator with `pos.view` + `pos.checkout` completes a POS sale | Order `POS-000xxx` at `delivered`, stock reduced, ledger row per line |
| P5 | Operator creates a service invoice with a service type | `service_charge` auto-filled, order `SRV-000xxx`, `item_type = service_part` for parts |
| P6 | Staff receives a `pending` restock order | Status `received`, `received_at` set, stock incremented, `in` ledger rows |
| P7 | Accountant records a partial payment | `paid_amount` increased, `payment_status = partially_paid`, row shows in cashbook |
| P8 | Accountant records the exact remaining due | `payment_status = paid`, order leaves the Customer Dues list |
| P9 | HR marks attendance for today and regenerates payroll | Deduction reflects absences and half-days |
| P10 | HR approves a leave request | Status `approved`, employee sees the change |
| P11 | Admin creates a variant product with 2 attributes and images | Variants + pivot rows + images created; primary image set |
| P12 | Admin scans a barcode in POS | Correct product or variant is added to the cart |
| P13 | Report export PDF and CSV over a date range | Files download with matching totals |

### 14.3 Negative scenarios

| # | Scenario | Expected |
|---|---|---|
| N1 | Add to cart above available stock | `Only {n} items available in stock.` |
| N2 | POS sale exceeding stock | Transaction rolls back; `Failed to complete transaction: Insufficient stock. Available: x, Requested: y` |
| N3 | Checkout with an empty cart | `Your cart is empty.` |
| N4 | Cancel an order that is `processing` | `Only pending orders can be cancelled.` |
| N5 | Cancel another customer's order | HTTP 403 |
| N6 | Receive an already-received restock order | `Only pending orders can be received.` |
| N7 | Delete a received restock order | `Received orders cannot be deleted.` |
| N8 | Pay more than the due amount | `Payment amount cannot exceed the due amount (x).` |
| N9 | Delete a product that has sales history | `Cannot delete product with existing sales history…` |
| N10 | Delete a category containing sub-categories | `Cannot delete category containing sub-categories.` |
| N11 | Delete a supplier with restock orders | `Cannot delete supplier with existing restock orders…` |
| N12 | Rename or delete the `admin` role | `Cannot modify system roles.` / `Cannot delete system roles.` |
| N13 | Edit your own permissions | `You cannot modify your own permissions.` |
| N14 | Non-super-admin assigns `super-admin` | `Unauthorized: Only super-admins can assign the super-admin role.` |
| N15 | Deactivated employee logs in | `Your account has been deactivated…` |
| N16 | Customer uses `/admin/login` | `Access denied. Only administrators can access the dashboard.` |
| N17 | 4th OTP request within 10 minutes | HTTP 429 with the wait message |
| N18 | Verify an OTP after 5 minutes | HTTP 422 `Invalid or expired OTP.` |
| N19 | Mark attendance for tomorrow | `Cannot mark attendance for future dates.` |
| N20 | Overlapping leave request | `You already have a pending or approved leave request during this period.` |
| N21 | Non-super-admin deletes a 25-hour-old expense | Audit message returned |
| N22 | Download a service invoice through `/orders/{id}/invoice` | Redirect to `services.invoice` |

### 14.4 Validation scenarios

* Every required field omitted, one at a time, for POS, Service Invoice, Checkout, Employee, Payment, Restock.
* `quantity = 0` and `quantity = -1` (must fail `min:1`).
* `amount = 0` on a payment (must fail `min:1`).
* Non-numeric `discount` / `tax_percentage`.
* `end_date` before `start_date` on a leave request.
* `month_year = '2026-13'` and `'2026-1'` for payroll (must fail `date_format:Y-m`).
* Image upload > 2 MB and a non-image mime for brand/category/product.
* Password shorter than 10 characters, or missing symbol / uppercase / digit on `PUT /my-account/password`.
* Phone shorter than 11 characters on OTP send.
* `payable_type` set to any class other than `Order` / `RestockOrder`.
* `attendances.*.status` with an arbitrary string (**currently accepted** — confirm the intended behaviour).

### 14.5 Permission testing

Build one user per role (`super-admin`, `admin`, `sales`, `accountant`, `customer`) and one user with only direct permissions, then assert per row of the table in §5.5. Specifically verify:

* `sales` can open `/orders` but is blocked from `PATCH /orders/{id}/status` (needs `order.manage`).
* `accountant` can reach `/accounting/*` only when `accounting.view` is granted, and can then also **write** (expenses, payments) — confirm this is intended.
* `admin` seeded by `RoleSeeder` alone **cannot** reach POS, service invoice create, order status update, product edit, or accounting (missing `pos.*`, `order.manage`, `product.edit`, `accounting.view`).
* `super-admin` reaches everything even with an empty permission pivot (bypass override).
* A user with `hrm.leave.view` but not `hrm.leave.manage` sees only their own leave rows and no Actions column.
* Sidebar visibility vs. actual route access — the POS entry is shown on `order.view` but the route requires `pos.view`.
* Direct-permission users: sync a single permission via `POST /users/{id}/sync-permissions` and confirm `syncPermissions` **replaces** rather than adds.

### 14.6 Workflow testing

* Online order end-to-end: place → processing → shipped → delivered, with stock checked after each step (stock is deducted at creation only).
* Cancel at each status through `/orders/{id}/status` and verify whether stock is restored more than once.
* POS order → record a payment → verify it disappears from Customer Dues.
* Restock: create → receive → attempt delete → record supplier payment.
* Service invoice with parts vs. without parts (stock path differs).
* Payroll: generate → mark paid → regenerate the same month → confirm status reset.
* Leave: submit → approve → submit an overlapping request → revert to pending.

### 14.7 Status transition testing

Exercise the full 5×5 order status matrix (§7.1) and record which transitions the system accepts, plus the stock effect of each. Repeat for `payment_status` (4 values), restock status, leave status, and salary status. Confirm the cancel hook fires exactly once per transition into `cancelled` and never on a re-save of an already-cancelled order.

### 14.8 Duplicate-data scenarios

| Target | Test |
|---|---|
| `brands.name` / `slug` | Duplicate create → validation error |
| `categories.name` / `slug` | Duplicate create → validation error |
| `products.sku` / `barcode` | Duplicate create/update → validation error |
| `product_variants.sku` / `barcode` | Duplicate on **create** → validation error; duplicate on **update** → validation is absent, so expect a DB unique-constraint error |
| `attributes.name` | Duplicate → validation error (no DB index backing it) |
| `service_types.name` | Duplicate → validation error (no DB index backing it) |
| `units.name` | Duplicate → validation error |
| `users.email` / `phone` | Duplicate → validation error; POS/Service quick-create with an existing phone must reuse the existing user |
| `wishlists` | Rapid double toggle → confirm no duplicate rows (no DB index) |
| `carts` | Same product+variant added twice → quantity increments, one row |
| `attendances` | Same user+date submitted twice → `updateOrCreate`, one row |
| `salaries` | Regenerate same month → one row, values overwritten |
| Order numbers | Two concurrent POS checkouts → `POS-` numbers derived from `max(id)+1` may collide (unique index will reject one) |

### 14.9 Boundary conditions

* Stock exactly equal to the requested quantity (must succeed); one more (must fail).
* `low_stock_alert = 0` and `null` (`is_low_stock` returns `false` when `null`).
* `base_price = 0` with variants (accessor falls through to min variant price).
* Discount equal to subtotal (total 0) and discount greater than subtotal (**negative total is not blocked**).
* `tax_percentage` above 100.
* `decimal(5,2)` limit on `tax_percentage` — values ≥ 1000 will overflow.
* `decimal(12,2)` and `decimal(15,2)` upper limits on amounts.
* Payroll in February (28/29 days) and in a month with zero attendance rows.
* Report range where `start_date > end_date`.
* Payment of exactly the due amount, and of `due + 0.01`.
* OTP requested at exactly the 3rd attempt, and verified at exactly 5 minutes.
* Pagination: `per_page` set to 0, 1, and a very large value (no upper bound is validated anywhere).

### 14.10 Integration testing

* SMS: dummy mode (log line present), Greenweb mode, Twilio mode, and gateway timeout — confirm the user-facing response is unchanged and the failure appears only in the log.
* Queue worker stopped: OTP request returns success but no SMS is sent (`SendSmsJob` stays in `jobs`).
* PDF: order invoice, service invoice (HTML, not PDF), report PDF — with 0 items, 1 item, and 100+ items.
* CSV export with a large date range (streamed response).
* Notification delivery to every `super-admin`/`admin` on checkout, and the unread badge count.
* Ziggy `route()` availability on every page after a production build.

### 14.11 Data-consistency checks

| Check | Expectation |
|---|---|
| `products.stock` vs. `SUM(product_variants.stock)` | Should match for variant products (both are moved by `StockService`) |
| `products.stock` vs. the `stock_transactions` running `balance_after` | Should match |
| `orders.total_amount` vs. `subtotal − discount_amount + tax_amount (+ service_charge)` | Should match |
| `orders.paid_amount` vs. `SUM(payments.amount WHERE payable = order)` | Should match |
| `orders.payment_status` vs. `paid_amount` / `total_amount` | Consistent |
| `order_items.total_price` vs. `quantity × unit_price` | Should match |
| `order_items.product_variant_id` | Populated whenever `variant_id` is populated |
| `orders.status` vs. `orders.order_status` | Always identical |
| `salaries.net_salary` vs. `base_salary + bonus − deduction` | Should match |
| Accounting profit & loss vs. Reports profit | Will differ (cash basis vs. margin basis) — confirm which is authoritative |
| Report totals with cancelled orders excluded vs. included | Currently included |

---

## 15. Issues / Risks

Every item below is backed by a specific location in the codebase.

### 15.1 High severity

| # | Issue | Evidence | Impact |
|---|---|---|---|
| I-1 | **Variant stock is never decremented on sale.** `StockService::recordSale()` and `returnStock()` branch on `$item->product_variant_id`, but `OrderItem::$fillable` contains `variant_id` and **not** `product_variant_id`. POS and Service Invoice write only `variant_id`; `CheckoutController` passes `product_variant_id` but mass assignment drops it. | `app/Models/OrderItem.php` (`$fillable`), `app/Services/StockService.php:recordSale`, `app/Http/Controllers/Web/PosController.php`, `ServiceInvoiceController.php`, `CheckoutController.php` | For every variant sale the parent product's `stock` is reduced while the variant's `stock` stays unchanged; `stock_transactions.product_variant_id` is always `NULL`. Variant stock levels are permanently wrong. |
| I-2 | **`order_items.cost_price` is never stored.** `cost_price` is passed by POS, Service Invoice, and Checkout but is missing from `OrderItem::$fillable`, so it always saves as `0`. | `app/Models/OrderItem.php`, `2026_04_13_065911_add_cost_price_to_order_items_table.php` | Profit reporting always falls back to the **current** `products.cost_price` (via `IF(order_items.cost_price > 0, …)`), so historical margin changes whenever a cost price is edited. |
| I-3 | **POS discount is computed as a percentage on the client but sent as `fixed`.** `Pos/Index.tsx` computes `discountAmount = subtotal × discount / 100` while `useForm` initialises `discount_type: "fixed"`; the server applies the raw value as a fixed amount. | `resources/js/Pages/Pos/Index.tsx:122-123, 282-283`, `PosController::store` | Displayed total and charged total disagree for every discounted POS sale. |
| I-4 | **POS client total ignores tax and includes an unsupported `less_fixed`.** The page computes `total = subtotal − discountAmount − less_fixed`; the server computes `total = (subtotal − discount) × (1 + tax%)`. `less_fixed` and `paid_amount` are submitted but are neither validated nor persisted. | `resources/js/Pages/Pos/Index.tsx:283`, `PosController::store` validation list | On-screen total ≠ stored `total_amount` whenever tax or `less_fixed` is used. |
| I-5 | **`RoleSeeder` does not create the permissions the code actually checks.** Code requires `product.edit`, `brand.edit`, `category.edit`, `unit.edit`, `pos.view`, `pos.checkout`, `order.manage`, `role.manage`, `permission.manage`, `user.manage`, `accounting.view`; `RoleSeeder` creates `*.update` variants instead, and `unit.edit` is created by no seeder at all. `DatabaseSeeder` runs only `RoleSeeder`. | `database/seeders/RoleSeeder.php`, `SecurityPermissionSeeder.php`, `DatabaseSeeder.php`, all controller `middleware()` methods | On a fresh install, the `admin` role cannot use POS, edit products/brands/categories/units, update order status, or open Accounting. Only `super-admin` works (via the bypass). |
| I-6 | **`RoleSeeder` uses `syncPermissions`, wiping earlier grants.** Running `RoleSeeder` after `SecurityPermissionSeeder`/`InventoryPermissionSeeder` removes their grants from `admin` and `accountant`. | `RoleSeeder::run` | Permission state depends on seeder execution order. |
| I-7 | **`POST /api/attributes/{attribute}/values` targets a method that does not exist.** | `routes/api.php`, `app/Http/Controllers/Web/AttributeController.php` | HTTP 500 on call. `apiResource` also exposes `show`, which is unimplemented. |
| I-8 | **`Register.tsx` calls a non-existent hook function and a non-existent endpoint.** The page destructures `register` from `useAuth()`, but `useAuth` returns only `{ user, login, logout, sendOTP, verifyOTP }`. There is also no `POST /register` route — only `GET /register` inside the staff-only group. | `resources/js/Pages/Register.tsx:21,48`, `resources/js/hooks/useAuth.tsx`, `routes/web.php` | Submitting the registration form throws `register is not a function`. There is no self-service customer registration by email/password. |
| I-9 | **`useAuth().login` posts the wrong field name.** It sends `{ email, password }` while `AuthController::login` validates a field named `login`. | `resources/js/hooks/useAuth.tsx`, `AuthController::login` | Any caller of `useAuth().login` receives a validation error. (`Login.tsx` and `AdminLogin.tsx` use their own `useForm` with the correct `login` field, so the live pages are unaffected.) |
| I-10 | **Accounting write operations are gated only by `accounting.view`.** The whole `accounting` prefix carries one permission; `expense-categories` and `expenses` are full `Route::resource` registrations. | `routes/web.php` accounting group | Anyone who can *view* accounting can create, edit, and delete expense categories and expenses. |

### 15.2 Medium severity

| # | Issue | Evidence | Impact |
|---|---|---|---|
| I-11 | **`POS-`/`SRV-` order numbers are derived from `Order::latest()->first()->id`.** | `PosController::store`, `ServiceInvoiceController::store` | Two concurrent checkouts compute the same number; the `order_number` unique index rejects one, rolling back an otherwise valid sale. The numbers also interleave across POS and Service (both read the same global max id). |
| I-12 | **POS and Service orders are created with `payment_status = pending` and `paid_amount = 0` even for cash sales.** | `PosController::store`, `ServiceInvoiceController::store` (neither sets `payment_status`) | Every completed counter sale immediately appears in Accounting → Customer Dues. |
| I-13 | **No order status transition matrix.** `OrderController::updateStatus` accepts any value from any state, with no reason capture and no `cancelled_by`. | `OrderController::updateStatus` | A delivered order can be cancelled (restoring stock that was already handed over); a cancelled order can be re-opened without re-deducting stock. |
| I-14 | **`Order::updated` restores stock on cancel but nothing re-deducts it on un-cancel.** | `app/Models/Order.php` boot hooks | Cancel → re-open cycles inflate stock. |
| I-15 | **`categoryProducts` and `search` do not filter `is_active`.** Every other storefront query does. | `ShopController::categoryProducts`, `ShopController::search` | Deactivated products are publicly visible through category browsing and search. |
| I-16 | **Storefront price filters read `products.base_price` only.** | `ShopController` (all three filter blocks) | Variant products with `base_price = null` are excluded from any price-filtered result. |
| I-17 | **Payroll regeneration overwrites `paid` salaries.** `updateOrCreate` always writes `status => 'pending'`. | `PayrollController::generate` | A month that has already been paid silently reverts to pending. |
| I-18 | **`EmployeeController::update` writes `is_active` from an unvalidated field.** `'is_active' => (bool)$request->is_active` with no rule; an absent field evaluates to `false`. | `EmployeeController::update` | Editing an employee without sending `is_active` deactivates them, which then blocks their login. |
| I-19 | **`AttributeController::update` deletes all values when `values` is absent.** | `AttributeController::update` `else` branch | A partial update payload wipes the attribute's value list; any variant pivot rows cascade away. |
| I-20 | **`ProductRepository::syncProductImages` has an empty `if (!$append) { }` block.** | `app/Repositories/ProductRepository.php` | The non-append path is a no-op, so image replacement is impossible — images only ever accumulate. |
| I-21 | **Variant `sku`/`barcode` uniqueness is not validated on update.** The rule is `['nullable','string']` with a code comment acknowledging the gap. | `UpdateProductRequest` | A duplicate variant SKU produces a raw DB unique-constraint exception instead of a field error. |
| I-22 | **Discount is not capped at the subtotal.** No validation or check in POS, Service Invoice, or the order totals. | `PosController`, `ServiceInvoiceController` | A negative `total_amount` can be stored. |
| I-23 | **`SupplierRepository::paginate` builds an ungrouped OR chain.** `where(name)->orWhere(email)->orWhere(phone)` combined with `where('is_active', …)`. | `app/Repositories/SupplierRepository.php` | Search plus the active filter returns inactive suppliers matching name or email. |
| I-24 | **Cart routes are `auth`-only but contain full guest branches.** | `routes/web.php` (cart block inside the `auth` group), `CartController` | Guests cannot add to cart at all; a large block of session-cart code in `CartController` is dead. `HandleInertiaRequests` and `CheckoutController` still read `session('cart')`. |
| I-25 | **`OrderApprovedNotification` is never dispatched.** | grep across `app/` | The "order approved" notification is dead code; there is no approval event at all (`approved_by` is only set by POS/Service at creation time and is not in `Order::$fillable`, so it is never persisted). |
| I-26 | **`Order::$fillable` omits `order_date` and `approved_by`,** yet both are passed to `Order::create()` by POS, Service Invoice, and Checkout. | `app/Models/Order.php`, the three controllers | `order_date` silently falls back to the column default `useCurrent` (currently equivalent); `approved_by` is never stored, so the approver is unknown. |
| I-27 | **Accounting `daily-sales` groups on `created_at` while every other sales report groups on `order_date`.** | `Accounting\ReportController::daily` vs. `Web\ReportController` and `DashboardController` | Two "daily sales" figures that can disagree for back-dated orders. |
| I-28 | **Cancelled orders are included in every revenue/profit figure.** No report or dashboard query filters by status. | `Web\ReportController`, `DashboardController`, `Accounting\ReportController::daily` | Overstated revenue. |
| I-29 | **Attendance `status` accepts any string.** Validation is `required|string`; the column was widened to `string(50)`. | `AttendanceController::store`, migration `2026_04_11_055046` | Typos become new statuses; payroll counts only the exact strings `absent` and `half-day`, so a mistyped status silently avoids deduction. |
| I-30 | **Leave approval has no effect on attendance or payroll.** | `LeaveController`, `PayrollController::generate` | Approved leave days are not written as `on-leave` attendance, so they are neither excluded from nor deducted in payroll. |

### 15.3 Low severity / hygiene

| # | Issue | Evidence |
|---|---|---|
| I-31 | Unpaginated full-table loads: POS loads **all** active products with variants and images; Inventory Adjust and Restock Create load **all** products; `/my-account` loads **all** of a customer's orders; Roles, Permissions, Units, Payroll, and Service Types load everything with `->get()`. | `PosController::index`, `InventoryController::adjust`, `RestockOrderController::create`, `AccountController::index`, `RoleController`, `PermissionController`, `UnitRepository::all`, `PayrollController::index`, `ServiceTypeController::index` |
| I-32 | N+1 queries in storefront listings: `is_wishlisted` runs one `EXISTS` query per product in every rail and paginated list. | `ShopController` (`each(...)` blocks) |
| I-33 | `HandleInertiaRequests::share` runs a category tree query with three `withCount` levels **and** a full cart query on every single request, including JSON/OTP endpoints. | `app/Http/Middleware/HandleInertiaRequests.php` |
| I-34 | `designations` table has no model, controller, or reference anywhere. | `2025_12_14_125300_create_designations_table.php` |
| I-35 | `Category::$fillable` lists `description`, a column the table does not have. | `app/Models/Category.php`, `2025_12_15_101149_create_categories_table.php` |
| I-36 | `orders.billing_address` and `orders.shipping_amount` are never written. `stock_transactions.type = 'return'` is never used. `restock_orders.status = 'cancelled'` is never used. `order_items.bonus_quantity` and `price_type` are always `0` / `'flat'`. | migrations vs. controllers |
| I-37 | `Product::getOldPriceAttribute()` fabricates a "was" price as `price × 1.15`. | `app/Models/Product.php` |
| I-38 | Missing DB uniqueness backing validation-only rules: `attributes.name`, `service_types.name`, `wishlists(user_id, product_id)`, `carts(user_id, product_id, variant_id)`, `employee_profiles.user_id`. | migrations |
| I-39 | `SmsService` reads configuration with `env()` at runtime instead of `config()`, which breaks under `php artisan config:cache`. | `app/Services/SmsService.php` |
| I-40 | `SMS_API_URL`, `SMS_API_TOKEN`, `SMS_SENDER_ID` are absent from `.env.example`; `SMS_SENDER_ID` is read but never sent to the gateway. | `.env.example`, `SmsService` |
| I-41 | A committed `.env` is present in the repository root alongside `.env.example`. | repository root |
| I-42 | `AdminSeeder` hard-codes `superadmin@example.com` / `admin123`, well below the application's own 10-character password policy. | `database/seeders/AdminSeeder.php` |
| I-43 | Case-inconsistent imports: `@/Components/FlashHandler` vs. the actual folder `resources/js/components/`. Works on Windows, breaks on a case-sensitive filesystem. | `DashboardLayout.tsx`, `ShopLayout.tsx` |
| I-44 | `resources/js/Pages/RoleAssignment.tsx` is never rendered by any controller. | grep across `app/` and `routes/` |
| I-45 | `NotFound.tsx` exists but `withExceptions()` in `bootstrap/app.php` is empty, so no custom error page is wired. | `bootstrap/app.php` |
| I-46 | `/profile` and `/settings` render `Inertia::render('Profile')` / `('Settings')` with no props from inline closures. | `routes/web.php` |
| I-47 | `ShopNavbar.tsx` links to `/help`, which has no route. | `resources/js/components/layout/ShopNavbar.tsx` |
| I-48 | Both the Radix `Toaster` and `sonner` are mounted; only the Radix one receives flash messages. | `resources/js/app.tsx`, `FlashHandler.tsx` |
| I-49 | `UserController::index` hard-codes `employeeStatus: 'Active'` for every row and derives `designation` from the first role name. | `app/Http/Controllers/Web/UserController.php` |
| I-50 | Sidebar gates POS on `order.view` while the route requires `pos.view` (in-code comment: "Simplified permission logic for now"). | `Sidebar.tsx` |
| I-51 | Test suite contains only the two Laravel skeleton tests (`tests/Feature/ExampleTest.php`, `tests/Unit/ExampleTest.php`). No coverage of any business rule. | `tests/` |
| I-52 | Repository root contains large stray artifacts: `app.zip` (~94 MB), `public.zip` (~93 MB), `gldqpoea_radian_agrovet.sql` (~3 MB, unrelated database dump), `debug_variants.json`, `update_colors.cjs`, and `build_output.log` (a stale failed build referencing a different path, `D:\Test\salesManagement2`). | repository root |
| I-53 | `Web\ReportController` and `DashboardController` use MySQL-specific `IF(...)` in raw SQL. | both controllers |
| I-54 | `AttributeController` returns Inertia responses but is also registered as an `apiResource`. | `routes/api.php` |
| I-55 | `PaymentController::store` validates `payable_id` as an integer only; a missing ID surfaces as the generic message `Error recording payment.` and the exception detail is discarded. | `Accounting\PaymentController::store` |
| I-56 | `payments.type` is not cross-checked against `payable_type`, so an `out` payment can be attached to a customer `Order` (and would then be excluded from the profit & loss revenue figure). | `Accounting\PaymentController::store`, `Accounting\ReportController::profitLoss` |
| I-57 | `config/cors.php` applies to `paths => ['*']` (every route, not just `api/*`) with `supports_credentials => true`; `allowed_origins` falls back to `'*'` if `APP_URL` is unset. | `config/cors.php` |
| I-58 | `sendOTP` returns `otp_preview` whenever `APP_DEBUG` is true — the live `.env` in this repository must be verified before any deployment. | `AuthController::sendOTP`, `.env` |
| I-59 | `ServiceInvoiceController::downloadInvoice` returns an HTML view where the equivalent order route returns a PDF download. | `ServiceInvoiceController::downloadInvoice` vs. `OrderController::downloadInvoice` |
| I-60 | Duplicate/near-duplicate logic: `PosController::store` and `ServiceInvoiceController::store` repeat item pricing, customer resolution, and order assembly almost verbatim; `AuthController::login` and `adminLogin` are near-identical; the same hand-built `data/links/meta` pagination block is repeated in `SupplierController`, `InventoryController`, `EmployeeController`, `UserController`, `BrandController`, and `CategoryController`. | the named files |

---

## 16. Improvement Opportunities

Grouped by theme; each maps to one or more issues in §15.

**Correctness first**
1. Add `product_variant_id` and `cost_price` to `OrderItem::$fillable` (or set them explicitly) so variant stock and historical cost are recorded (I-1, I-2).
2. Align the POS totals engine: compute the same formula on client and server, honour `discount_type`, apply tax on the client preview, and either validate + persist `less_fixed` / `paid_amount` or remove them (I-3, I-4).
3. Replace `Order::latest()->first()->id` numbering with a transactional sequence or a UUID/date-based scheme, as already used for online orders (I-11).
4. Set `payment_status` and `paid_amount` explicitly for POS/Service cash sales (I-12).

**RBAC**
5. Consolidate the permission catalogue into one seeder with one naming convention (choose `*.edit` or `*.update`, `*.manage` or granular CRUD) and register it in `DatabaseSeeder`; switch role grants from `syncPermissions` to `givePermissionTo` where merge semantics are wanted (I-5, I-6).
6. Split `accounting.view` into `accounting.view` / `accounting.manage` (or per-entity permissions) (I-10).
7. Make the sidebar's gate for each item identical to the route's gate, ideally by generating both from one map (I-50).

**Workflow integrity**
8. Introduce an explicit order status state machine (allowed transitions, guarded cancel, reason capture on every cancel path) and re-deduct stock if an order leaves `cancelled` (I-13, I-14).
9. Guard payroll regeneration against months that contain `paid` rows (I-17).
10. Constrain `attendances.status` to a defined set and write `on-leave` rows when a leave request is approved, so payroll reflects approved leave (I-29, I-30).
11. Validate `is_active` in `EmployeeController::update` and default it to the current value when absent (I-18).

**Data quality**
12. Add the missing unique indexes: `attributes.name`, `service_types.name`, `wishlists(user_id, product_id)`, `carts(user_id, product_id, variant_id)`, `employee_profiles.user_id` (I-38).
13. Introduce soft deletes (or an archive flag) on financial and catalog entities so history survives deletion.
14. Drop or implement the `designations` table, the unused `orders` columns, and the unused enum values (I-34, I-36).
15. Remove `description` from `Category::$fillable` or add the column (I-35).

**Performance**
16. Paginate or lazy-load the POS, Inventory Adjust, Restock Create, and My Account datasets; add a server-side product search endpoint for POS instead of shipping the full catalog (I-31).
17. Replace the per-product `is_wishlisted` query with a single `whereIn` lookup or a `withExists` sub-select (I-32).
18. Trim `HandleInertiaRequests::share` — cache the category tree and skip cart/category computation for non-Inertia requests (I-33).

**Consistency and reuse**
19. Extract the shared POS/Service order-assembly logic into an `OrderService` (pricing, totals, customer resolution, item creation) (I-60).
20. Extract the repeated pagination payload builder into a shared resource or trait (I-60).
21. Decide on one profit definition (cash basis vs. margin basis) and reconcile Accounting, Reports, and Dashboard; exclude cancelled orders everywhere (I-27, I-28).
22. Move `env()` reads in `SmsService` into `config/services.php` so `config:cache` is safe, and add the SMS keys to `.env.example` (I-39, I-40).

**Frontend**
23. Fix or remove `Register.tsx` and `useAuth().login`/`register`; if email/password self-registration is intended, add the route, controller, and validation (I-8, I-9).
24. Normalise import casing to `@/components/...` before deploying to Linux (I-43).
25. Wire `NotFound.tsx` through `withExceptions()`, remove or implement `RoleAssignment.tsx`, and fill in `/profile` and `/settings` (I-44, I-45, I-46).
26. Pick one toast library (I-48).
27. Remove the `/help` link or add the page (I-47).

**Security and operations**
28. Remove the committed `.env`, the two `.zip` archives, the unrelated `.sql` dump, and `build_output.log` from version control (I-41, I-52).
29. Restrict `config/cors.php` `paths` to `api/*` and require an explicit `allowed_origins` (I-57).
30. Rotate the seeded super-admin credentials and bring the seeder in line with the application's own password policy (I-42).
31. Confirm `APP_DEBUG=false` in every non-local environment so `otp_preview` is never returned (I-58).
32. Add feature tests for the 30 business rules in §13.2 — currently there are none (I-51).

---

## 17. Important Configuration

### 17.1 Environment variables in use

| Variable | Source | Value / default | Used by |
|---|---|---|---|
| `APP_NAME` | `.env` | — | `app.blade.php` page title |
| `APP_DEBUG` | `.env` | — | `AuthController::sendOTP` exposes `otp_preview` when true |
| `APP_URL` | `.env` | — | `config/cors.php` `allowed_origins` |
| `DB_CONNECTION` | `.env.example` | `mysql` | all queries (raw SQL uses MySQL `IF()`) |
| `DB_DATABASE` | `.env.example` | `salesmanagement` | — |
| `SESSION_DRIVER` | `.env.example` | `database` | `sessions` table |
| `CACHE_STORE` | `.env.example` | `database` | OTP rate limit, Spatie permission cache |
| `QUEUE_CONNECTION` | `.env.example` | `database` | `SendSmsJob` |
| `FILESYSTEM_DISK` | `.env.example` | `local` | product/brand/category images are written to the **`public`** disk explicitly |
| `MAIL_MAILER` | `.env.example` | `log` | no mail is actually sent |
| `BROADCAST_CONNECTION` | `.env.example` | `log` | no realtime channel |
| `SMS_API_URL` | code default | `http://api.greenweb.com.bd/api.php` | `SmsService` — **not in `.env.example`** |
| `SMS_API_TOKEN` | code default | `YOUR_API_TOKEN` | `SmsService` — **not in `.env.example`**; the default triggers dummy mode |
| `SMS_SENDER_ID` | code default | `YOUR_SENDER_ID` | read but never used |
| `TWILIO_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM` | `.env` (present) | — | `SmsService` Twilio branch |
| `SANCTUM_STATEFUL_DOMAINS` | `config/sanctum.php` default | `localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1` + app URL | Sanctum |

### 17.2 Framework configuration

| Setting | Location | Value |
|---|---|---|
| Password policy | `AppServiceProvider::boot` | `min(10)`, letters, mixed case, numbers, symbols |
| Middleware aliases | `bootstrap/app.php` | `role`, `permission`, `role_or_permission` |
| Post-login redirect | `bootstrap/app.php` | dashboard for staff roles, storefront otherwise |
| Inertia root view | `HandleInertiaRequests::$rootView` | `app` |
| Permission cache | `config/permission.php` | key `spatie.permission.cache`, 24-hour expiry, default store |
| `register_permission_check_method` | `config/permission.php` | `true` (enables the super-admin bypass through the Gate) |
| Wildcard permissions | `config/permission.php` | `false` |
| Teams feature | `config/permission.php` | disabled |
| CORS | `config/cors.php` | `paths ['*']`, `methods ['*']`, `origins [APP_URL or '*']`, `headers ['*']`, credentials `true` |
| Login throttling | `routes/web.php` | `throttle:5,1` on both login POSTs |
| Vite input | `vite.config.js` | `resources/css/app.css`, `resources/js/app.tsx`, `refresh: true` |
| Blade `@vite` | `app.blade.php` | also injects `resources/js/Pages/{$page['component']}.tsx` per request |
| Path alias `@/` | `tsconfig.json` / `tailwind.config.js` | `resources/js/*` |
| Composer `dev` script | `composer.json` | runs `serve`, `queue:listen`, and `npm run dev` concurrently |

### 17.3 Seeding order

`DatabaseSeeder` → `RoleSeeder`, `AdminSeeder`, `CategorySeeder`, `BrandSeeder`, `UnitSeeder`, `AttributeSeeder`, `ProductSeeder`, `CustomerSeeder`.

**Not registered** (must be run manually): `SecurityPermissionSeeder`, `InventoryPermissionSeeder`, `ExpenseCategorySeeder`, `ServiceTypeSeeder`.

Recommended manual order given §15.1 I-6: run `RoleSeeder` **first**, then `SecurityPermissionSeeder` and `InventoryPermissionSeeder`.

### 17.4 Operational requirements

* A queue worker must be running (`php artisan queue:work`) or OTP SMS is never delivered.
* `php artisan storage:link` is required — uploaded images are saved to the `public` disk and referenced as `/storage/...`.
* MySQL is required (raw SQL uses `IF()`).
* `php artisan config:cache` will break `SmsService` (it uses `env()` at runtime).

---

## 18. Overall System Flow

```
                       ┌──────────────────────────────────────────┐
                       │              PUBLIC VISITOR              │
                       └──────────────────┬───────────────────────┘
                                          │
             browse / search / filter     ▼
                  ┌───────────────────────────────────────────┐
                  │  Storefront  (Index, Category, Brand,     │
                  │  Search, ProductDetails, FlashSale)       │
                  └───────────┬───────────────────┬───────────┘
                              │ add to cart       │ wishlist toggle
                              ▼                   ▼
                        ┌──────────┐        ┌───────────┐
                        │   Cart   │        │  Wishlist │
                        └────┬─────┘        └───────────┘
                             │ checkout (auth required)
                             ▼
                  ┌────────────────────────┐
                  │  OTP login / password  │──▶ session cart merged into carts
                  └───────────┬────────────┘
                              ▼
                  ┌────────────────────────────────────────┐
                  │  CheckoutController                    │
                  │  Order (ORD-…, pending, source=online) │
                  │  StockService::recordSale  → stock out │
                  │  Notification → super-admin + admin    │
                  └───────────┬────────────────────────────┘
                              │
  ════════════════════════════╪═══════════════════════════════════════════════
                              ▼                     STAFF BACK OFFICE
                  ┌────────────────────────────────────────────────────────┐
                  │  /dashboard  (role: super-admin|admin|sales|accountant)│
                  └───┬──────────┬──────────┬───────────┬──────────┬───────┘
                      │          │          │           │          │
       ┌──────────────┘   ┌──────┘    ┌─────┘     ┌─────┘   ┌──────┘
       ▼                  ▼           ▼           ▼         ▼
 ┌───────────┐    ┌──────────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
 │  Catalog  │    │Orders / POS /│ │Inventory│ │  HRM   │ │Accounting│
 │Brand,Cat, │───▶│Service       │ │Ledger + │ │Employee│ │Expense,  │
 │Product,   │    │              │ │Adjust + │ │Attend, │ │Payment,  │
 │Unit,Attr  │    │              │ │Restock  │ │Leave,  │ │Dues,     │
 └───────────┘    └──────┬───────┘ └────┬────┘ │Payroll │ │Cashbook  │
                         │              │      └────────┘ └────┬─────┘
                         │  stock out   │ stock in             │
                         └──────┬───────┴──────────────────────┘
                                ▼
                    ┌──────────────────────────┐
                    │   stock_transactions     │  (immutable ledger:
                    │   type, quantity,        │   in / out / adjustment)
                    │   balance_after, ref     │
                    └──────────────────────────┘
                                │
                                ▼
                    ┌──────────────────────────┐
                    │  Reports & Dashboard     │
                    │  revenue, profit, top    │
                    │  products, PDF / CSV     │
                    └──────────────────────────┘
```

**Money flow**

```
Order (total_amount, paid_amount=0, payment_status=pending)
        │
        ├── Accounting → Customer Dues
        │        │
        │        └── Payment (type=in) ──▶ paid_amount += amount
        │                                  payment_status = partially_paid | paid
        ▼
RestockOrder (total_amount, paid_amount=0, payment_status=pending)
        │
        ├── Accounting → Supplier Dues
        │        │
        │        └── Payment (type=out) ─▶ paid_amount += amount
        ▼
Expense (amount, category, date)
        │
        ▼
Cashbook  =  payments ∪ expenses,  running balance (in adds, out subtracts)
Profit & Loss = Σ(payments in on Orders) − [Σ(expenses) + Σ(payments out on RestockOrders)]
```

**Stock flow**

```
Restock received ──('in')──▶ product.stock ↑ (and variant.stock ↑ when a variant line)
Manual adjust    ──('in' | 'adjustment')──▶ stock ↑
Manual adjust    ──('out')──▶ stock ↓ (blocked below zero)
Sale (online / POS / service part) ──('out')──▶ stock ↓
Order cancelled  ──('in')──▶ stock ↑ (via Order::updated hook)
Every movement writes one stock_transactions row with balance_after.
```

---

## 19. Not Found / Requires Verification

The following were searched for and are **not present in the codebase**. They are listed so that no reader assumes them:

| Area | Status |
|---|---|
| Online payment gateway (bKash, Nagad, SSLCommerz, Stripe, PayPal) | **Not Found** — `payment_method` is free text on checkout; no gateway client exists |
| Email sending (order confirmation, password reset, invoices) | **Not Found** — `MAIL_MAILER=log`; no `Mailable` classes; `password_reset_tokens` table exists but no forgot-password route or controller |
| Self-service customer registration (email + password) | **Not Found** — `GET /register` renders a page inside the staff-only group; there is no `POST /register` and `useAuth().register` does not exist. Registration happens implicitly through OTP or POS/Service quick-create |
| Shipping cost / delivery charge calculation | **Not Found** — `orders.shipping_amount` exists but is never written |
| Tax configuration | **Not Found** — `tax_percentage` is entered manually per POS/Service transaction; no tax master |
| Coupon / promo code | **Not Found** |
| Actual flash-sale or discount campaign logic | **Not Found** — `/flash-sales` returns random active products; `old_price` is a computed 15 % markup |
| Product reviews / ratings | **Not Found** |
| Order approval step | **Not Found** — `orders.approved_by` exists and is passed by POS/Service but is not in `$fillable`, so it is never persisted; `OrderApprovedNotification` is never dispatched |
| Order return / refund / exchange | **Not Found** — `stock_transactions.type = 'return'` exists but is never used |
| Payment reversal / refund | **Not Found** |
| Restock order cancellation | **Not Found** as a status — `restock_orders.status = 'cancelled'` exists but only deletion is implemented |
| Purchase-order approval workflow | **Not Found** |
| Multi-warehouse / multi-branch stock | **Not Found** |
| Barcode label printing / generation | **Not Found** — only barcode **lookup** exists |
| POS receipt printing | **Not Found** in the code inspected; `Pos/Index.tsx` has no print handler. *Requires verification against the intended UX.* |
| POS held/parked sales | **Not Found** |
| Designation management | **Not Found** — the `designations` table exists with no model, controller, route, or UI |
| Technician role | **Not Found** — technicians are `admin`/`super-admin`/`sales` users; the code comment reads "Or specific technician role if exists" |
| Service job status tracking (received → in progress → completed) | **Not Found** — service invoices are created directly at `delivered` |
| Attendance check-in/out enforcement or geolocation | **Not Found** — `check_in`/`check_out` are free-form nullable strings |
| Leave balance / entitlement tracking | **Not Found** — only overlap is checked |
| Payroll bonus configuration | **Not Found** — `bonus` is hard-coded to `0` (code comment: "Configurable later") |
| Payslip PDF | **Not Found** |
| Accounting journal / chart of accounts / double-entry ledger | **Not Found** — accounting is a cash log, not a GL |
| Bank account management | **Not Found** — `payment_method` includes `bank_transfer` but no bank entity exists |
| Date-range filters on accounting reports | **Not Found** — only the Reports module accepts a range |
| Audit log / activity log | **Not Found** — only `created_by` / `cancelled_by` columns |
| Two-factor authentication for staff | **Not Found** — OTP is a customer login method, not a second factor |
| Forgot-password flow | **Not Found** |
| Soft deletes / archiving | **Not Found** anywhere |
| API token issuing endpoint | **Not Found** — Sanctum is installed and `HasApiTokens` is on `User`, but nothing creates a token |
| Automated tests for business logic | **Not Found** — only the two Laravel skeleton tests |
| CI/CD pipeline configuration | **Not Found** |
| Localisation / multi-language (`lang/` directory) | **Not Found** — `APP_LOCALE=en`; UI strings are hard-coded in English (project documentation in `docs/` and `system_features.md` is in Bengali) |
| Currency configuration | **Not Found** — `BDT` appears hard-coded in `OrderCreatedNotification`; other views use `TK` or plain numbers. *Requires verification of the intended single-currency assumption.* |
| Sitemap / SEO metadata / structured data | **Not Found** |
| `Detailed_Implementation_Plan.md` and `Software Requirements Specification (SRS).pdf` | Present in the repository root but **not analysed here** — this report is derived from code only. Cross-checking the code against the SRS **requires verification** |
| Intended behaviour of `bonus_quantity`, `price_type`, `orders.billing_address` | **Requires verification** — columns exist, defaults are always written |
| Whether `admin` is meant to reach Accounting and POS out of the box | **Requires verification** — see §15.1 I-5 |
| Whether accounting write access should be separated from read access | **Requires verification** — see §15.1 I-10 |

---

*End of report.*

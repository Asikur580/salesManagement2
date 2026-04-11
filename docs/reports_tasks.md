# Task List: Reports & Analytics Dashboard (3.9)

## Phase 1: Permissions & Setup
- `[x]` **Spatie Permissions**:
  - Add `report.view` and `report.export` permissions to `RoleSeeder.php`.
  - Re-run `php artisan db:seed --class=RoleSeeder`.
- `[x]` **Navigation**:
  - Add "Reports" menu item to `resources/js/components/layout/Sidebar.tsx`.

## Phase 2: Dashboard Widgets Upgrade
- `[x]` **Backend Updates**:
  - Modify `DashboardController@getStatsData` to include:
    - `total_profit`: (Monthly sum of `order_items.total_price` - `products.cost_price`).
    - `pending_orders`: Count of orders with `order_status = 'pending'`.
- `[x]` **Frontend Updates**:
  - Update `resources/js/Pages/Dashboard.tsx` to display the new Profit and Pending Orders cards.

## Phase 3: Reports Backend Development
- `[x]` **ReportController**:
  - Create `app/Http/Controllers/Web/ReportController.php`.
  - Implement `index()` method with support for `start_date` and `end_date` filters.
- `[x]` **Data Logic**:
  - `getSalesSummary`: Daily/Monthly sales aggregation.
  - `getSourceReport`: Online (Shop) vs Offline (POS) breakdown.
  - `getProfitReport`: Detailed profit data per product/category.
  - `getTopSellingProducts`: Expanded list with pagination.

## Phase 4: Reports Frontend Development
- `[x]` **Reports Page**:
  - Create `resources/js/Pages/Reports/Index.tsx`.
  - Implement Date Range picker using a calendar component.
- `[x]` **Report Sections**:
  - Sales Overview (Table/Chart).
  - Online vs Offline Sales cards.
  - Top Products data table.
  - Profit/Margin analysis section.

## Phase 5: Export Functionality
- `[x]` **PDF Export**:
  - Implement `exportPdf()` in `ReportController`.
  - Create a Blade view for the PDF layout (`resources/views/pdf/report.blade.php`).
- `[x]` **Excel/CSV Export**:
  - Implement `exportCsv()` to allow downloading spreadsheet-compatible reports.

## Phase 6: Testing & Final Polish
- `[x]` Verify all currency formatting (e.g., use ৳ symbol).
- `[x]` Test filters with specific date ranges.
- `[x]` Verify report accuracy matches database records.
- `[x]` Ensure responsive design for mobile views.

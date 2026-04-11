# HRM Module Implementation Tasks (Basic)

## Phase 1: Database & Core Setup
- `[x]` **Migration 1**: Create `employee_profiles` table
  - `user_id` (foreign key)
  - `is_active` (boolean, default: true)
  - `base_salary` (decimal(10,2), default: 0)
  - `join_date` (date, nullable)
- `[x]` **Migration 2**: Create `attendances` table
  - `user_id`, `date`, `status`, `check_in`, `check_out`
- `[x]` **Migration 3**: Create `leave_requests` table
  - `user_id`, `type`, `start_date`, `end_date`, `reason`, `status`
- `[x]` **Migration 4**: Create `salaries` table
  - `user_id`, `month_year`, `base_salary`, `bonus`, `deduction`, `net_salary`, `status`
- `[x]` **Models**:
  - Update `User.php` (add relationships: `employeeProfile`, `attendances`, `salaries`, `leaveRequests`)
  - Create `EmployeeProfile.php`
  - Create `Attendance.php`
  - Create `LeaveRequest.php`
  - Create `Salary.php`
- `[x]` **Permissions**:
  - Update `RoleSeeder` to include permissions: `hrm.*`
  - Run seeder to assign to Admin/Super-Admin

## Phase 2: Employee Management
- `[x]` **Backend**:
  - Create `HRM\EmployeeController` (Index, Create, Store, Edit, Update)
  - Define routes in `web.php` with `permission:hrm.employee.*`
- `[x]` **Frontend**:
  - Create `resources/js/Pages/HRM/Employees/Index.tsx` (DataTable)
  - Create `resources/js/Pages/HRM/Employees/Form.tsx` (Add/Edit employee form including Role and Salary options)
- `[x]` **Auth Protection**:
  - Add middleware logic to prevent login if `!is_active`

## Phase 3: Attendance System
- `[x]` **Backend**:
  - Create `HRM\AttendanceController` (Index, Store, Update)
  - Create toggle endpoint for Self Check-in / Check-out
- `[x]` **Frontend**:
  - Create `resources/js/Pages/HRM/Attendance/Index.tsx` (Admin view of logs)
  - Implement Dashboard Widget for Employee clock-in/out (if requested by user)
  - Or, build manual Attendance marking UI for Admin

## Phase 4: Leave Management
- `[x]` **Backend**:
  - Create `HRM\LeaveController` (Index, Store, Update Status)
- `[x]` **Frontend**:
  - Create `resources/js/Pages/HRM/Leaves/Index.tsx`
  - Tab 1: "My Leaves" (For standard employees to submit requests)
  - Tab 2: "Leave Approvals" (For Admin to Approve/Reject)

## Phase 5: Payroll & Salaries
- `[x]` **Backend**:
  - Create `HRM\PayrollController`
  - Implement Generate Salary Logic (Calculate deductions based on attendance)
  - Update Salary Status (Pending -> Paid)
- `[x]` **Frontend**:
  - Create `resources/js/Pages/HRM/Payroll/Index.tsx`
  - View salary statements & history
  - Print/Download basic Salary Slip UI

## Phase 6: Final Integration & Testing
- `[x]` Inject the "HRM" menu into `Sidebar.tsx` with proper permission checks
- `[x]` Test Role-based restrictions (Sales role vs Admin role)
- `[x]` Verify Salary deductions calculation accuracy

## Phase 7: Monthly Attendance Grid Upgrade (UI Overhaul)
- `[x]` **Database**:
  - Update `status` enum in `attendances` table to include `['late', 'holiday', 'day-off']`.
- `[x]` **Backend (`AttendanceController`)**:
  - Refactor `index` to accept `month` and `year`.
  - Fetch all dates and transform data into a `day 1...31` mapped array structure for each employee.
  - Calculate `total_present` out of `total_days` for the month.
- `[x]` **Frontend (`Index.tsx`)**:
  - Refactor top bar to include `Month`, `Year`, and `Employee/Designation` filters.
  - Create a CSS-styled Grid (or wide Table with `overflow-x-auto`).
  - Render dynamic SVG icons (`Star`, `Calendar`, `Check`, `X`, `Plane`) within grid cells.
  - Make Left column (Employee Name/Avatar) sticky for easy scrolling.

# Human Resource Management (HRM) System - User Manual

Welcome to the HRM Module User Manual. This module helps you efficiently manage your workforce, track attendance, handle leave applications, and automate salary preparation.

---

## 1. Employee Management
The Employee section provides a centralized directory of all staff members and their necessary credentials.

**Navigate to:** Sidebar > HRM > `Employees`

### Adding a New Employee
1. Click the **"+ Add Employee"** button on the top right.
2. Fill in the essential details: Name, Email, Phone, Role (Designation), Base Salary, and Joining Date.
3. Provide an initial password. The employee will use this password and their email/phone to log into the system.
4. Click **Save Employee**.

### Editing & Deactivating Employees
- **Edit**: Click the **Pencil icon** next to an employee to update their role, salary, or contact details.
- **Deactivate**: Click the **Power icon**. Setting an employee to "Inactive" will immediately revoke their ability to log into the dashboard.

---

## 2. Daily & Monthly Attendance
The Attendance dashboard features a comprehensive Monthly Grid (Timeline) view, allowing you to see the attendance patterns of all employees simultaneously.

**Navigate to:** Sidebar > HRM > `Attendance`

### Understanding the Grid Icons
- ✔️ **Present** (Green Check)
- ❌ **Absent** (Red Cross)
- ⚠️ **Late** (Yellow Alert)
- ⭐️ **Holiday** (Yellow Star)
- ⭐️ **Half Day** (Red Star)
- ✈️ **On Leave** (Orange Plane)
- 📅 **Day Off** (Grey Calendar)

### Marking Attendance
1. Click the **"+ Mark Attendance"** button.
2. Select the specific **Date** from the top of the modal window.
3. The list of all active employees will appear. Update their specific Status (Present, Absent, Late, etc.).
4. Optional: Adjust their Check-in and Check-out times if necessary.
5. Click **Save Attendance**. The monthly grid will instantly update to reflect the changes.

---

## 3. Leave Management
Manage employee absence requests in an organized manner. 

**Navigate to:** Sidebar > HRM > `Leave Requests`

### For Employees (Applying)
1. Click **"+ Apply for Leave"**.
2. Select Leave Type (Casual, Sick, Annual).
3. Specify the Start Date and End Date.
4. Provide a brief reason for the absence and click **Submit**.

### For Administrators (Approving/Rejecting)
System administrators or HR Managers will see all pending leave requests from staff members in the list.
- Click the Green **Check (Approve)** button to grant the leave.
- Click the Red **Cross (Reject)** button to deny the leave.
_Employees will see their request status switch from "Pending" to "Approved" or "Rejected" in real-time._

---

## 4. Payroll & Salaries
The system automatically tracks employee absences and adjusts their monthly basic salary correspondingly.

**Navigate to:** Sidebar > HRM > `Payroll & Salaries`

### Generating the Payroll
1. Click the **"Generate Payroll"** button.
2. Select the **Month** and **Year** you wish to calculate.
3. Automatically, the system will:
   - Identify the Employee's `Base Salary`.
   - Scan the Attendance module for their exact number of `Absent` days in that specific month.
   - Mathematically deduct the proportional daily wage for those absences.
   - Calculate the final `Net Salary`.

### Paying & Printing Slips
- **Mark as Paid**: Once the physical/bank transfer is complete, click the **"Pay"** button to permanently mark the transaction as settled.
- **Print Salary Slip**: Click the **"Printer icon"** next to any record to view a neatly formatted digital Salary Slip detailing the exact deductions and base salary. You can print this directly to PDF or paper.

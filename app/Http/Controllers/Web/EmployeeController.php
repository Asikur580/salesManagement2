<?php

namespace App\Http\Controllers\Web;

use Throwable;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Designation;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\EmployeeDetail;

use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        /** @var User|null $user */
        $user = auth()->user();
        $query = EmployeeDetail::with(['user', 'designation', 'role', 'parent.user'])->latest();

        // Apply hierarchical filtering for non-admin users
        if ($user && !$user->hasAnyRole(['admin', 'super-admin'])) {
            $employeeDetail = $user->employeeDetail;
            if ($employeeDetail) {
                $subordinateIds = $employeeDetail->getAllSubordinateIds();
                $query->whereIn('id', $subordinateIds);
            } else {
                // If user doesn't have employeeDetail, they shouldn't see any employees
                $query->whereRaw('1 = 0');
            }
        }

        $employeesRaw = $query->get();
        $employees = $employeesRaw->map(function ($item) {
            return [
                'id' => $item->id,
                'designationId' => (string)$item->designation_id,
                'designation' => $item->designation->name ?? '',
                'name' => $item->user->name ?? '',
                'email' => $item->user->email ?? '',
                'phone' => $item->phone,
                'nationalId' => $item->national_id,
                'bloodGroup' => $item->blood_group,
                'territory' => $item->territory,
                'district' => $item->district,
                'image' => $item->image,
                'userRole' => $item->role->name ?? '',
                'loginAllowed' => (bool)$item->login_allowed,
                'status' => $item->status === 'active' ? 'Active' : 'Inactive',
                'supervisorId' => $item->parent_id,
                'employeeId' => $item->employee_id,
                'creditLimit' => $item->credit_limit,
            ];
        });

        $designations = Designation::all();
        $roles = Role::where('guard_name', 'web')->get();
        $users = User::all();

        return Inertia::render('Employees', [
            'initialEmployees' => $employees,
            'initialDesignations' => $designations,
            'initialRoles' => $roles,
            'initialUsers' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'designationId' => 'required|exists:designations,id',
            'roleId' => 'required|integer|exists:roles,id',
            'employeeId' => 'required|string|unique:employee_details,employee_id',
            'creditLimit' => 'nullable|numeric',
            'phone' => 'nullable|string',
            'nationalId' => 'nullable|string',
            'bloodGroup' => 'nullable|string',
            'territory' => 'nullable|string',
            'district' => 'nullable|string',
            'status' => 'in:active,inactive',
            'loginAllowed' => 'boolean',
            'image' => 'nullable|string', // Base64 string
            'parentId' => 'nullable|exists:employee_details,id'
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $role = Role::findById($request->roleId, 'web');
            $user->assignRole($role);

            $imagePath = $this->handleImageUpload($request->image);

            $data = [
                'user_id' => $user->id,
                'role_id' => $role->id,
                'designation_id' => $request->designationId,
                'parent_id' => $request->parentId,
                'employee_id' => $request->employeeId,
                'credit_limit' => $request->creditLimit ?? 0,
                'phone' => $request->phone,
                'national_id' => $request->nationalId,
                'blood_group' => $request->bloodGroup,
                'territory' => $request->territory,
                'district' => $request->district,
                'status' => $request->status ?? 'active',
                'login_allowed' => $request->loginAllowed ?? true,
                'image' => $imagePath
            ];

            // Handle ghost columns if they exist
            if (Schema::hasColumn('employee_details', 'company_id')) {
                $data['company_id'] = 1; // Default fallback
            }
            if (Schema::hasColumn('employee_details', 'department_id')) {
                $data['department_id'] = 1; // Default fallback
            }

            EmployeeDetail::create($data);

            DB::commit();

            return redirect()->back()->with('success', 'Employee created successfully');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create employee: ' . $th->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $employee = EmployeeDetail::findOrFail($id);
        $user = $employee->user;

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'designationId' => 'required|exists:designations,id',
            'roleId' => 'required|integer|exists:roles,id',
            'employeeId' => 'required|string|unique:employee_details,employee_id,' . $id,
            'creditLimit' => 'nullable|numeric',
            'phone' => 'nullable|string',
            'nationalId' => 'nullable|string',
            'bloodGroup' => 'nullable|string',
            'territory' => 'nullable|string',
            'district' => 'nullable|string',
            'status' => 'in:active,inactive',
            'loginAllowed' => 'boolean',
            'image' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            $user->update($userData);

            $role = Role::findById($request->roleId, 'web');
            $user->syncRoles($role);

            $imagePath = $this->handleImageUpload($request->image, $employee->image);

            $data = [
                'role_id' => $role->id,
                'designation_id' => $request->designationId,
                'employee_id' => $request->employeeId,
                'credit_limit' => $request->creditLimit ?? 0,
                'phone' => $request->phone,
                'national_id' => $request->nationalId,
                'blood_group' => $request->bloodGroup,
                'territory' => $request->territory,
                'district' => $request->district,
                'status' => $request->status ?? 'active',
                'login_allowed' => $request->loginAllowed ?? true,
                'image' => $imagePath
            ];

            // Handle ghost columns if they exist
            if (Schema::hasColumn('employee_details', 'company_id')) {
                $data['company_id'] = 1; // Default fallback
            }
            if (Schema::hasColumn('employee_details', 'department_id')) {
                $data['department_id'] = 1; // Default fallback
            }

            $employee->update($data);

            DB::commit();

            return redirect()->back()->with('success', 'Employee updated successfully');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update employee: ' . $th->getMessage());
        }
    }

    public function destroy($id)
    {
        $employee = EmployeeDetail::findOrFail($id);

        try {
            DB::beginTransaction();

            if ($employee->image && Storage::disk('public')->exists($employee->image)) {
                Storage::disk('public')->delete($employee->image);
            }

            $user = $employee->user;
            $user->delete(); // Cascades to EmployeeDetail

            DB::commit();

            return redirect()->back()->with('message', 'Employee deleted successfully');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to delete employee');
        }
    }

    public function assignSupervisor(Request $request, $id)
    {
        $employee = EmployeeDetail::findOrFail($id);

        $request->validate([
            'supervisorId' => 'nullable|exists:employee_details,id'
        ]);

        if ($request->supervisorId && $request->supervisorId == $id) {
            return redirect()->back()->with('error', 'An employee cannot be their own supervisor.');
        }

        if ($request->supervisorId) {
            $supervisor = EmployeeDetail::findOrFail($request->supervisorId);

            // Validate role hierarchy
            $hierarchyRules = [
                'officer' => ['manager', 'rsm', 'admin', 'super-admin'],
                'manager' => ['rsm', 'admin', 'super-admin'],
                'rsm' => ['admin', 'super-admin'],
                'admin' => ['super-admin'],
                'super-admin' => []
            ];

            $employeeRole = $employee->role->name;
            $supervisorRole = $supervisor->role->name;

            if (isset($hierarchyRules[$employeeRole]) && !in_array($supervisorRole, $hierarchyRules[$employeeRole])) {
                return redirect()->back()->with('error', "$employeeRole can only have " . implode(', ', $hierarchyRules[$employeeRole]) . " as supervisor.");
            }

            // Circular Check
            if ($this->hasCircularHierarchy($supervisor, $id)) {
                return redirect()->back()->with('error', 'This assignment would create a circular hierarchy.');
            }
        }

        $employee->update(['parent_id' => $request->supervisorId]);

        return redirect()->back()->with('message', 'Supervisor assigned successfully');
    }

    public function show($id)
    {
        $employee = EmployeeDetail::with(['user', 'role', 'designation', 'parent.user'])->findOrFail($id);

        // Get Potential Supervisors based on Role Hierarchy (matching assignSupervisor logic)
        $potentialSupervisors = [];
        if ($employee->role) {
            $roleName = $employee->role->name;
            $hierarchyRules = [
                'officer' => ['manager', 'rsm', 'admin', 'super-admin'],
                'manager' => ['rsm', 'admin', 'super-admin'],
                'rsm' => ['admin', 'super-admin'],
                'admin' => ['super-admin'],
                'super-admin' => []
            ];

            if (isset($hierarchyRules[$roleName])) {
                $allowedRoles = $hierarchyRules[$roleName];
                $potentialSupervisors = EmployeeDetail::whereHas('role', function ($q) use ($allowedRoles) {
                    $q->whereIn('name', $allowedRoles);
                })
                    ->with(['user', 'role', 'designation'])
                    ->where('id', '!=', $employee->id)
                    ->where('status', 'active')
                    ->get()
                    ->map(function ($emp) {
                        return [
                            'id' => $emp->id,
                            'name' => $emp->user->name ?? 'Unknown',
                            'role' => $emp->role->name ?? 'N/A',
                            'designation' => $emp->designation->name ?? 'N/A'
                        ];
                    });
            }
        }

        $subordinates = EmployeeDetail::with(['user', 'role', 'designation'])
            ->where('parent_id', $employee->id)
            ->get()
            ->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'name' => $emp->user->name ?? 'Unknown',
                    'role' => $emp->role->name ?? 'N/A',
                    'designation' => $emp->designation->name ?? 'N/A',
                    'phone' => $emp->phone,
                    'status' => $emp->status
                ];
            });

        $allPermissions = Permission::all()->map(function ($perm) {
            $parts = explode('.', $perm->name);
            return [
                'id' => $perm->id,
                'name' => $perm->name,
                'guard_name' => $perm->guard_name,
                'group' => count($parts) > 1 ? ucfirst($parts[0]) : 'Other'
            ];
        });

        $userPermissions = $employee->user->getAllPermissions()->pluck('name');

        return Inertia::render('EmployeeView', [
            'id' => (string)$id,
            'initialEmployee' => $employee,
            'initialPotentialSupervisors' => $potentialSupervisors,
            'initialSubordinates' => $subordinates,
            'allPermissions' => $allPermissions,
            'userPermissions' => $userPermissions
        ]);
    }

    private function hasCircularHierarchy($supervisor, $targetId, $depth = 0)
    {
        if ($depth > 10) return true;
        if (!$supervisor || !$supervisor->parent_id) return false;
        if ($supervisor->parent_id == $targetId) return true;

        $nextSupervisor = EmployeeDetail::find($supervisor->parent_id);
        return $this->hasCircularHierarchy($nextSupervisor, $targetId, $depth + 1);
    }

    private function handleImageUpload($base64Image, $oldImage = null)
    {
        if (!$base64Image || !preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
            return $oldImage;
        }

        $image = substr($base64Image, strpos($base64Image, ',') + 1);
        $type = strtolower($type[1]);

        if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
            return $oldImage;
        }

        $image = str_replace(' ', '+', $image);
        $image = base64_decode($image);

        if ($oldImage && Storage::disk('public')->exists($oldImage)) {
            Storage::disk('public')->delete($oldImage);
        }

        $imageName = 'employee_' . time() . '_' . Str::random(10) . '.' . $type;
        Storage::disk('public')->put('employees/' . $imageName, $image);

        return 'employees/' . $imageName;
    }
}

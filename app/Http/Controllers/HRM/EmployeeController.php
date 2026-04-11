<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmployeeProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = User::whereHas('employeeProfile')->with(['employeeProfile', 'roles']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        $paginated = $query->latest()->paginate($perPage)->withQueryString();

        $employees = [
            'data' => collect($paginated->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'email' => $item->email,
                    'phone' => $item->phone ?? 'N/A',
                    'role' => $item->roles->first()->name ?? 'N/A',
                    'base_salary' => $item->employeeProfile->base_salary ?? 0,
                    'join_date' => $item->employeeProfile->join_date,
                    'is_active' => (bool) $item->employeeProfile->is_active,
                ];
            }),
            'links' => $paginated->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'from' => $paginated->firstItem(),
                'last_page' => $paginated->lastPage(),
                'path' => $paginated->path(),
                'per_page' => $paginated->perPage(),
                'to' => $paginated->lastItem(),
                'total' => $paginated->total(),
            ]
        ];

        $roles = Role::where('guard_name', 'web')->select('id', 'name')->get();

        return Inertia::render('HRM/Employees/Index', [
            'initialEmployees' => $employees,
            'roles' => $roles,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        // $request->validate([
        //    'name' => 'required|string|max:255',
        //    'email' => 'required|email|unique:users,email',
        //    'phone' => 'nullable|string',
        //    'password' => 'required|string|min:6',
        //    'role' => 'required|string',
        //    'base_salary' => 'nullable|numeric|min:0',
        //    'join_date' => 'nullable|date',
        // ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
            ]);

            $user->employeeProfile()->create([
                'is_active' => true,
                'base_salary' => $request->base_salary ?? 0,
                'join_date' => $request->join_date,
            ]);

            $user->assignRole($request->role);

            DB::commit();
            return redirect()->back()->with('success', 'Employee created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error creating employee: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        DB::beginTransaction();
        try {
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
            ];

            if ($request->password) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            $user->employeeProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'base_salary' => $request->base_salary ?? 0,
                    'join_date' => $request->join_date,
                    'is_active' => (bool)$request->is_active,
                ]
            );

            // Sync Role
            if ($request->role) {
                $user->syncRoles([$request->role]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Employee updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error updating employee: ' . $e->getMessage());
        }
    }

    public function toggleStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        if ($user->employeeProfile) {
            $user->employeeProfile->is_active = !$user->employeeProfile->is_active;
            $user->employeeProfile->save();
        }
        return redirect()->back()->with('success', 'Employee status updated.');
    }
}

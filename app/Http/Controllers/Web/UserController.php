<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct()
    {
        // For Laravel 11+, routing middleware is usually deferred to routes, or we can use \Illuminate\Routing\Controllers\HasMiddleware interface.
        // If the base Controller doesn't have middleware(), we just let route handle it, or use the interface.
        // But since we didn't add the interface, let's remove it and add middleware to routes/web.php instead.
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'permissions', 'employeeDetail.designation', 'employeeDetail.role']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->role) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        $perPage = $request->input('per_page', 10);
        $paginated = $query->latest()->paginate($perPage)->withQueryString();

        $users = [
            'data' => collect($paginated->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'email' => $item->email,
                    'roles' => $item->roles->pluck('name'),
                    'permissions' => $item->permissions->pluck('name'),
                    'employeeStatus' => $item->employeeDetail ? $item->employeeDetail->status : 'Unassigned',
                    'designation' => $item->employeeDetail->designation->name ?? 'N/A',
                    'phone' => $item->employeeDetail->phone ?? 'N/A',
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

        $roles = Role::where('guard_name', 'web')->select('name', 'id')->get();
        $allPermissions = \Spatie\Permission\Models\Permission::select('id', 'name')->get();

        return Inertia::render('Users', [
            'initialUsers' => $users,
            'roles' => $roles,
            'allPermissions' => $allPermissions,
            'filters' => $request->only(['search', 'per_page', 'role']),
        ]);
    }
}

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
      
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'permissions']);

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
                    'employeeStatus' => 'Active',
                    'designation' => $item->roles->first()->name ?? 'N/A',
                    'phone' => $item->phone ?? 'N/A',
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

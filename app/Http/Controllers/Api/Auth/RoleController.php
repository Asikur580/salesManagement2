<?php

namespace App\Http\Controllers\Api\Auth;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Throwable;

class RoleController extends Controller
{
    // List all roles
    public function index()
    {
        return response()->json(Role::all());
    }

    // Create new role
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name'
        ]);

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web', 
        ]);

        return response()->json(['message' => 'Role created', 'role' => $role]);
    }

    // Show single role
    public function show($id)
    {
        $role = Role::findOrFail($id);
        return response()->json($role);
    }

    // Update role
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name,' . $id,
            'permissions' => 'array'
        ]);

        $role = Role::findOrFail($id);
        $role->name = $request->name;
        $role->save();

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json(['message' => 'Role updated', 'role' => $role]);
    }

    // Delete role
    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return response()->json(['message' => 'Role deleted']);
    }
}

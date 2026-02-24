<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::withCount('users')->with('permissions:id,name');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $roles = $query->latest()->get();
        $allPermissions = Permission::select('id', 'name')->get();

        return Inertia::render('Roles', [
            'initialRoles' => $roles,
            'initialPermissions' => $allPermissions,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

        Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        return redirect()->back()->with('message', 'Role created successfully');
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $protectedRoles = ['super-admin', 'admin'];
        if (in_array($role->name, $protectedRoles)) {
            return redirect()->back()->with('error', 'Cannot modify system roles.');
        }

        $request->validate([
            'name' => 'required|string|unique:roles,name,' . $id,
        ]);

        $role->update([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('message', 'Role updated successfully');
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        $protectedRoles = ['super-admin', 'admin'];
        if (in_array($role->name, $protectedRoles)) {
            return redirect()->back()->with('error', 'Cannot delete system roles.');
        }

        $role->delete();

        return redirect()->back()->with('message', 'Role deleted successfully');
    }

    public function syncPermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'permissions' => 'required|array',
        ]);

        $role->syncPermissions($request->permissions);

        return redirect()->back()->with('message', 'Permissions synced successfully');
    }
}

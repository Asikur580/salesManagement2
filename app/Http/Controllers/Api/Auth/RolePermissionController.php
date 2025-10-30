<?php


namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    // ✅ Assign Permission to Role
    public function givePermission(Request $request, $roleId)
    {
        $request->validate([
            'permission' => 'required|string|exists:permissions,name'
        ]);

        $role = Role::findOrFail($roleId);
        $role->givePermissionTo($request->permission);

        return response()->json([
            'status' => true,
            'message' => "Permission '{$request->permission}' assigned to role '{$role->name}'.",
            'data' => $role->permissions
        ]);
    }

    // ✅ Revoke Permission from Role
    public function revokePermission(Request $request, $roleId)
    {
        $request->validate([
            'permission' => 'required|string|exists:permissions,name'
        ]);

        $role = Role::findOrFail($roleId);
        $role->revokePermissionTo($request->permission);

        return response()->json([
            'status' => true,
            'message' => "Permission '{$request->permission}' revoked from role '{$role->name}'.",
            'data' => $role->permissions
        ]);
    }

    // ✅ Sync Permissions for Role
    public function syncPermissions(Request $request, $roleId)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        $role = Role::findOrFail($roleId);
        $role->syncPermissions($request->permissions);

        return response()->json([
            'status' => true,
            'message' => "Permissions synced for role '{$role->name}'.",
            'data' => $role->permissions
        ]);
    }

    // ✅ Get all permissions of a Role
    public function getPermissions($roleId)
    {
        $role = Role::findOrFail($roleId);

        return response()->json([
            'status' => true,
            'data' => $role->permissions
        ]);
    }
}

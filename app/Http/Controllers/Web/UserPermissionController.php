<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class UserPermissionController extends Controller
{
    public function syncPermissions(Request $request, $id)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            // Prevent users from changing their own permissions
            if (Auth::id() == $id) {
                return redirect()->back()->with('error', "You cannot modify your own permissions.");
            }

            // Prevent modifying super-admin's permissions
            if ($user->hasRole('super-admin')) {
                return redirect()->back()->with('error', "Cannot modify permissions for super-admin.");
            }

            // Prevent modifying customer's permissions
            if ($user->hasRole('customer')) {
                return redirect()->back()->with('error', "Cannot modify permissions for a customer.");
            }

            $user->syncPermissions($request->permissions);

            DB::commit();

            return redirect()->back()->with('success', "Permissions updated successfully for {$user->name}");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', "Failed to update permissions: " . $e->getMessage());
        }
    }
}

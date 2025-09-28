<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\RoleController;
use App\Http\Controllers\Auth\PermissionController;
use App\Http\Controllers\Auth\RolePermissionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']); // Admin only
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');


Route::get('/roles', [RoleController::class, 'index']);       // List all roles
Route::post('/roles', [RoleController::class, 'store']);      // Create role
Route::get('/roles/{id}', [RoleController::class, 'show']);  // Show single role
Route::put('/roles/{id}', [RoleController::class, 'update']); // Update role
Route::delete('/roles/{id}', [RoleController::class, 'destroy']); // Delete role

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {});

Route::get('/permissions', [PermissionController::class, 'index']);       // List all permissions
Route::post('/permissions', [PermissionController::class, 'store']);      // Create permission
Route::get('/permissions/{id}', [PermissionController::class, 'show']);  // Show single permission
Route::put('/permissions/{id}', [PermissionController::class, 'update']); // Update permission
Route::delete('/permissions/{id}', [PermissionController::class, 'destroy']); // Delete permission

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {});

// Role → Permission APIs
Route::post('/roles/{id}/give-permission', [RolePermissionController::class, 'givePermission']);
Route::post('/roles/{id}/revoke-permission', [RolePermissionController::class, 'revokePermission']);
Route::post('/roles/{id}/sync-permissions', [RolePermissionController::class, 'syncPermissions']);
Route::get('/roles/{id}/permissions', [RolePermissionController::class, 'getPermissions']);

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {});

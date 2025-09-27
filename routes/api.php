<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\RoleController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']); // Admin only
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');


Route::get('/roles', [RoleController::class, 'index']);       // List all roles
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/roles', [RoleController::class, 'store']);      // Create role
    Route::get('/roles/{id}', [RoleController::class, 'show']);  // Show single role
    Route::put('/roles/{id}', [RoleController::class, 'update']); // Update role
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']); // Delete role
});

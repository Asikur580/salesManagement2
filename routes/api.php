<?php

use App\Http\Controllers\Web\ProductController;
use App\Http\Controllers\Web\AttributeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('attributes', AttributeController::class);
    Route::post('attributes/{attribute}/values', [AttributeController::class, 'addValue']);
});

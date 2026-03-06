<?php

use App\Http\Controllers\CarController;
use App\Http\Controllers\FetchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Nexora Cars & More — API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('throttle:120,1')->group(function () {
    // Car listings
    Route::get('/cars', [CarController::class, 'index']);
    Route::get('/cars/{id}', [CarController::class, 'show'])->where('id', '[0-9]+');
    Route::get('/brands', [CarController::class, 'brands']);

    // Import triggers
    Route::post('/fetch', [FetchController::class, 'trigger']);
    Route::get('/fetch/status', [FetchController::class, 'status']);
});

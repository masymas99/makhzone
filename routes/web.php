<?php

use App\Http\Controllers\SalesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Sales Routes (استخدم SalesController فقط)
    Route::resource('sales', SalesController::class);

    // Products Routes
    Route::resource('products', \App\Http\Controllers\ProductsController::class);

    // باقي الراوتس لو عاوز تحتفظ بيهم
    Route::resource('traders', App\Http\Controllers\TraderController::class);
   
    Route::resource('purchases', App\Http\Controllers\PurchaseController::class);
    Route::resource('expenses', App\Http\Controllers\ExpenseController::class);
    Route::resource('payments', App\Http\Controllers\PaymentController::class);
});

require __DIR__.'/auth.php';
<?php

use App\Http\Controllers\SalesController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Sales Routes (استخدم SalesController فقط)
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
    Route::get('/sales/create', [SalesController::class, 'create'])->name('sales.create');
    Route::post('/sales', [SalesController::class, 'store'])->name('sales.store');
    Route::get('/sales/{sale}', [SalesController::class, 'show'])->name('sales.show');

    // باقي الراوتس لو عاوز تحتفظ بيهم
    Route::resource('products', App\Http\Controllers\ProductController::class);
    Route::resource('traders', App\Http\Controllers\TraderController::class);
    Route::resource('purchases', App\Http\Controllers\PurchaseController::class);
    Route::resource('expenses', App\Http\Controllers\ExpenseController::class);
    Route::resource('payments', App\Http\Controllers\PaymentController::class);
});

require __DIR__.'/auth.php';
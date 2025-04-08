<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Expense;
use App\Models\SaleDetail;
use App\Models\Trader;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // إجمالي المبيعات مع علاقة التاجر
        $totalSales = Sale::with('trader')->sum('TotalAmount');

        // حساب تكلفة البضاعة المباعة عبر العلاقة
        $cogs = SaleDetail::with('product')->get()
            ->sum(fn($detail) => $detail->quantity * $detail->product->UnitCost);

        // إجمالي المصروفات
        $totalExpenses = Expense::sum('Amount');

        // إجمالي الديون
        $tradersDebt = Trader::sum('TotalPayments');

        // آخر المبيعات مع تفاصيلها
        $recentSales = Sale::with(['trader', 'details.product'])
            ->orderBy('SaleDate', 'desc')
            ->take(5)
            ->get()
            ->map(function($sale) {
                return [
                    'date' => $sale->SaleDate,
                    'total' => $sale->TotalAmount,
                    'trader' => $sale->trader->Name,
                    'products' => $sale->details->map(fn($d) => $d->product->ProductName)
                ];
            });

        return Inertia::render('Dashboard', [
            'total_sales' => $totalSales,
            'cogs' => $cogs,
            'total_expenses' => $totalExpenses,
            'total_debts' => $tradersDebt,
            'profit' => $totalSales - $cogs - $totalExpenses,
            'recent_sales' => $recentSales
        ]);
    }
}
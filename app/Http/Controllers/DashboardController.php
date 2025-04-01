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

        // حساب الديون بدقة عبر علاقات المدفوعات
        $tradersDebt = Trader::with(['sales.payments', 'purchases'])->get()
            ->map(fn($trader) => $trader->sales->sum('TotalAmount')
                - $trader->sales->flatMap->payments->sum('Amount')
                + $trader->purchases->sum('TotalAmount'))
            ->sum();

        // المبيعات الأخيرة مع بيانات التاجر
        $recentSales = Sale::with(['trader', 'saleDetails.product'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($sale) => [
                'id' => $sale->id,
                'total' => $sale->TotalAmount,
                'trader' => $sale->trader->Name,
                'products' => $sale->saleDetails->map(fn($d) => $d->product->ProductName)
            ]);

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
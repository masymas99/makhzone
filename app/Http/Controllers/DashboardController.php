<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Purchase;
use App\Models\Product;
use App\Models\Trader;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Calculate total products
        $totalProducts = Product::count();

        // Calculate total sales
        $totalSales = Sale::sum('TotalAmount');

        // Calculate total purchases
        $totalPurchases = Purchase::sum('TotalAmount');

        // Calculate total expenses
        $totalExpenses = Expense::sum('Amount');

        // Calculate total profit (Sales - Purchases - Expenses)
        $totalProfit = $totalSales - ($totalPurchases + $totalExpenses);

        // Calculate product profit
        $productProfit = DB::table('sale_details')
            ->join('products', 'sale_details.ProductID', '=', 'products.ProductID')
            ->select(
                DB::raw('SUM((sale_details.UnitPrice - products.UnitCost) * sale_details.Quantity) as profit')
            )
            ->value('profit') ?? 0;

        // Count total traders
        $totalTraders = Trader::count();

        // Calculate total debts
        $totalDebts = Trader::where('Balance', '>', 0)
            ->sum('Balance');

        // Get recent sales
        $recentSales = Sale::with(['details.product'])->latest()->take(5)->get()->map(function($sale) {
            return [
                'SaleID' => $sale->SaleID,
                'InvoiceNumber' => $sale->InvoiceNumber,
                'SaleDate' => $sale->SaleDate,
                'TotalAmount' => $sale->TotalAmount
            ];
        });

        // Get recent purchases
        $recentPurchases = Purchase::with(['purchaseDetails.product'])->latest()->take(5)->get()->map(function($purchase) {
            return [
                'PurchaseID' => $purchase->PurchaseID,
                'BatchNumber' => $purchase->BatchNumber,
                'PurchaseDate' => $purchase->PurchaseDate,
                'TotalAmount' => $purchase->TotalAmount
            ];
        });

        // Get recent expenses
        $recentExpenses = Expense::latest()->take(5)->get()->map(function($expense) {
            return [
                'ExpenseID' => $expense->ExpenseID,
                'Description' => $expense->Description,
                'ExpenseDate' => $expense->ExpenseDate,
                'Amount' => $expense->Amount
            ];
        });

        // Get daily sales stats
        $salesStats = Sale::select(
            DB::raw('DATE(SaleDate) as date'),
            DB::raw('SUM(TotalAmount) as amount')
        )
        ->whereDate('SaleDate', '>=', now()->subDays(7))
        ->groupBy('date')
        ->get()
        ->toArray();

        // Get monthly purchases stats
        $purchaseStats = Purchase::select(
            DB::raw('DATE_FORMAT(PurchaseDate, "%M") as month'),
            DB::raw('SUM(TotalAmount) as amount')
        )
        ->whereYear('PurchaseDate', now()->year)
        ->groupBy('month')
        ->get()
        ->toArray();

        return Inertia::render('Dashboard', [
            'totalProducts' => $totalProducts,
            'totalSales' => $totalSales,
            'totalPurchases' => $totalPurchases,
            'totalExpenses' => $totalExpenses,
            'totalProfit' => $totalProfit,
            'productProfit' => $productProfit,
            'totalTraders' => $totalTraders,
            'totalDebts' => $totalDebts,
            'recentSales' => $recentSales,
            'recentPurchases' => $recentPurchases,
            'recentExpenses' => $recentExpenses,
            'salesStats' => $salesStats,
            'purchaseStats' => $purchaseStats,
        ]);
    }
}

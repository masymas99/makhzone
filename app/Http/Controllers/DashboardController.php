<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Payment;
use App\Models\Trader;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Calculate total expenses
        $totalExpenses = Expense::sum('Amount');
        
        // Calculate total purchases (sum of all purchase details subtotals)
        $totalPurchases = PurchaseDetail::sum('SubTotal');
        
        // Calculate total sales by summing UnitPrice * Quantity
        $totalSales = DB::table('sale_details')
            ->select(DB::raw('SUM(UnitPrice * Quantity) as total'))
            ->value('total') ?? 0;
        
        // Calculate total profit (Sales - Purchases - Expenses)
        $totalProfit = $totalSales - ($totalPurchases + $totalExpenses);
        
        // Get total debts by summing unpaid amounts from traders
        $totalDebts = Trader::where('Balance', '>', 0)
            ->sum('Balance');
        
        // Get recent activities
        $recentExpenses = Expense::orderBy('ExpenseDate', 'desc')->take(5)->get();
        
        $recentPurchases = Purchase::with('purchaseDetails')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function($purchase) {
                return [
                    'id' => $purchase->PurchaseID,
                    'product_name' => $purchase->purchaseDetails->first()->product->ProductName ?? 'غير معروف',
                    'purchase_date' => $purchase->created_at,
                    'total_cost' => $purchase->purchaseDetails->sum('SubTotal')
                ];
            });
        
        $recentSales = Sale::with('details')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function($sale) {
                return [
                    'id' => $sale->SaleID,
                    'total_amount' => $sale->details->sum(function($detail) {
                        return $detail->UnitPrice * $detail->Quantity;
                    }),
                    'created_at' => $sale->created_at
                ];
            });

        return inertia('Dashboard', [
            'totalExpenses' => $totalExpenses,
            'totalPurchases' => $totalPurchases,
            'totalSales' => $totalSales,
            'totalProfit' => $totalProfit,
            'totalDebts' => $totalDebts,
            'recentExpenses' => $recentExpenses,
            'recentPurchases' => $recentPurchases,
            'recentSales' => $recentSales
        ]);
    }
}
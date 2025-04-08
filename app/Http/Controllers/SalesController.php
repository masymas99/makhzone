<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Product;
use App\Models\Trader;
use App\Models\TraderFinancial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesController extends Controller
{
    // عرض صفحة إنشاء فاتورة جديدة
    public function create()
    {
        $traders = Trader::where('IsActive', true)->get();
        $products = Product::where('IsActive', true)->get();

        return Inertia::render('Sales/Create', [
            'traders' => $traders,
            'products' => $products,
        ]);
    }

    // حفظ الفاتورة
    public function store(Request $request)
    {
        $request->validate([
            'trader_id' => 'required|exists:traders,TraderID',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,ProductID',
            'products.*.quantity' => 'required|integer|min:1',
            'payment_amount' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Get the trader
            $trader = Trader::findOrFail($request->trader_id);

            // Calculate total amount
            $totalAmount = 0;
            foreach ($request->products as $productData) {
                $product = Product::findOrFail($productData['product_id']);
                $quantity = $productData['quantity'];
                $totalAmount += $product->UnitPrice * $quantity;
            }

            // Create sale record
            $sale = Sale::create([
                'TraderID' => $trader->TraderID,
                'SaleDate' => now(),
                'TotalAmount' => $totalAmount,
                'PaidAmount' => $request->payment_amount ?? 0,
                'Status' => $request->payment_amount >= $totalAmount ? 'paid' : 'pending'
            ]);

            // تحديث رقم الفاتورة بعد الحصول على ID
            $sale->update([
                'InvoiceNumber' => 'INV-' . date('Y') . '-' . str_pad($sale->id, 6, '0', STR_PAD_LEFT)
            ]);

            // Create sale details
            foreach ($request->products as $productData) {
                $product = Product::findOrFail($productData['product_id']);
                // تحديث المخزون وتسجيل التكلفة والربح
                $product->decrement('StockQuantity', $productData['quantity']);

                SaleDetail::create([
                    'SaleID' => $sale->id,
                    'ProductID' => $product->ProductID,
                    'Quantity' => $productData['quantity'],
                    'UnitPrice' => $product->UnitPrice,
                    'UnitCost' => $product->UnitCost,
                    'SubTotal' => $product->UnitPrice * $productData['quantity'],
                    'Profit' => ($product->UnitPrice - $product->UnitCost) * $productData['quantity']
                ]);
            }

            // Update trader's balance
            // تحديث إحصائيات التاجر بناء على أحدث البيانات
            $trader->TotalSales += $totalAmount;
            $trader->TotalPayments += $request->payment_amount ?? 0;
            $trader->Balance = $trader->TotalSales - $trader->TotalPayments;
            $trader->save();

            // Create financial record
            $financial = new TraderFinancial([
                'trader_id' => $trader->TraderID,
                'sale_id' => $sale->id,
                'sale_amount' => $totalAmount,
                'payment_amount' => $request->payment_amount ?? 0,
                'transaction_type' => 'sale',
                'description' => "تم إضافة فاتورة بيع رقم #{$sale->InvoiceNumber}",
                'balance' => $trader->Balance,
                'total_sales' => $trader->TotalSales,
                'total_payments' => $trader->TotalPayments,
                'remaining_amount' => $trader->Balance - $trader->TotalPayments
            ]);

            // Get the latest financial record to calculate the remaining amount
            $latestFinancial = TraderFinancial::where('trader_id', $trader->TraderID)
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latestFinancial) {
                $financial->total_sales = $latestFinancial->total_sales + $totalAmount;
                $financial->total_payments = $latestFinancial->total_payments + ($request->payment_amount ?? 0);
                $financial->balance = $financial->total_sales - $financial->total_payments;
                $financial->remaining_amount = $financial->balance;
            } else {
                $financial->total_sales = $totalAmount;
                $financial->total_payments = $request->payment_amount ?? 0;
                $financial->balance = $totalAmount;
                $financial->remaining_amount = $totalAmount - ($request->payment_amount ?? 0);
            }

            $financial->save();

            DB::commit();

            return redirect()->route('sales.index')->with('success', 'تم إنشاء الفاتورة بنجاح');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating sale:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'حدث خطأ أثناء إنشاء الفاتورة');
        }
    }

    // عرض كل الفواتير مع بيانات التجار والمنتجات
    public function index()
    {
        $sales = Sale::with(['trader', 'details.product', 'payments'])
            ->orderBy('SaleDate', 'desc')
            ->paginate(10);

        $traders = Trader::all();
        $products = Product::all();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'traders' => $traders,
            'products' => $products
        ]);
    }

    // عرض تفاصيل فاتورة معينة
    public function show($saleId)
    {
        $sale = Sale::with(['trader', 'details.product', 'payments'])
            ->findOrFail($saleId);

        return Inertia::render('Sales/Show', [
            'sale' => $sale
        ]);
    }
}

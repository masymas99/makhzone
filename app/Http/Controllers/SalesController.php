<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Product;
use App\Models\Trader;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    // عرض صفحة إنشاء فاتورة جديدة
    public function create()
    {
        $traders = Trader::where('IsActive', true)->get();
        $products = Product::where('IsActive', true)->get();

        return inertia('Sales/Create', [
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
        ]);

        \Log::info('Store Request Data:', $request->all());

        $totalAmount = 0;
        $productsData = $request->products;

        // Create the sale record
        $sale = Sale::create([
            'TraderID' => $request->trader_id,
            'TotalAmount' => 0, // Will be calculated later
            'SaleDate' => now()
        ]);

        // Process each product in the sale
        foreach ($productsData as $productData) {
            $product = Product::findOrFail($productData['product_id']);
            
            // Check if we have enough stock
            if ($productData['quantity'] > $product->StockQuantity) {
                return redirect()->back()->withErrors([
                    'products.' . $productData['product_id'] => 'الكمية المطلوبة غير متوفرة في المخزون'
                ]);
            }

            // Calculate subtotal using UnitCost
            $subTotal = $product->UnitCost * $productData['quantity'];
            $totalAmount += $subTotal;

            // Create sale detail
            $saleDetail = SaleDetail::create([
                'SaleID' => $sale->SaleID,
                'ProductID' => $product->ProductID,
                'Quantity' => $productData['quantity'],
                'UnitPrice' => $product->UnitCost, // Store the cost price
                'SubTotal' => $subTotal,
            ]);

            // Update product stock
            $product->StockQuantity -= $productData['quantity'];
            $product->save();

            \Log::info('Sale Detail Created:', $saleDetail->toArray());
        }

        // Update the total amount of the sale
        $sale->TotalAmount = $totalAmount;
        $sale->save();

        return redirect()->route('sales.index')->with('success', 'تم إنشاء الفاتورة بنجاح');
    }

    // عرض كل الفواتير مع بيانات التجار والمنتجات
    public function index()
    {
        $sales = Sale::with(['trader', 'saleDetails.product'])
            ->latest()
            ->paginate(10);
        $traders = Trader::where('IsActive', true)->get();
        $products = Product::where('IsActive', true)->get();

        return inertia('Sales/Index', [
            'sales' => $sales,
            'traders' => $traders,
            'products' => $products,
        ]);
    }

    // عرض تفاصيل فاتورة معينة
    public function show($saleId)
    {
        $sale = Sale::with(['trader', 'saleDetails.product'])
            ->findOrFail($saleId);

        return inertia('Sales/Show', [
            'sale' => $sale,
        ]);
    }
}
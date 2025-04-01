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

        foreach ($productsData as $productData) {
            $product = Product::findOrFail($productData['product_id']);
            $subTotal = $product->UnitPrice * $productData['quantity'];
            $totalAmount += $subTotal;
        }

        $sale = Sale::create([
            'TraderID' => $request->trader_id,
            'SaleDate' => now(),
            'TotalAmount' => $totalAmount,
            'PaidAmount' => 0,
        ]);

        \Log::info('Sale Created:', $sale->toArray());

        foreach ($productsData as $productData) {
            $product = Product::findOrFail($productData['product_id']);
            $subTotal = $product->UnitPrice * $productData['quantity'];
            $saleDetail = SaleDetail::create([
                'SaleID' => $sale->SaleID,
                'ProductID' => $product->ProductID,
                'Quantity' => $productData['quantity'],
                'UnitPrice' => $product->UnitPrice,
                'SubTotal' => $subTotal,
            ]);
            \Log::info('Sale Detail Created:', $saleDetail->toArray());
        }

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
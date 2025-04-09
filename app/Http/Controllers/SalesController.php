<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Trader;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function index()
    {
        $sales = Sale::with('trader', 'details.product')->get();
        return Inertia::render('Sales/Index', ['sales' => $sales]);
    }

    public function create()
    {
        $traders = Trader::where('IsActive', 1)->get();
        $products = Product::where('IsActive', 1)->get();
        return Inertia::render('Sales/Create', [
            'traders' => $traders,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'TraderID' => 'required|exists:traders,TraderID',
            'PaidAmount' => 'required|numeric|min:0',
            'products' => 'required|array',
            'products.*.ProductID' => 'required|exists:products,ProductID',
            'products.*.Quantity' => 'required|numeric|min:1',
        ]);

        $totalAmount = 0;
        $productsData = $request->input('products');

        // إنشاء الفاتورة مع القيم الأولية
        $sale = Sale::create([
            'InvoiceNumber' => 'INV-' . time(),
            'TraderID' => $request->TraderID,
            'SaleDate' => now(),
            'TotalAmount' => 0,
            'PaidAmount' => $request->PaidAmount,
            'Status' => 'Pending',
            'RemainingAmount' => 0, // تهيئة القيمة الأولية
        ]);

        // حساب المبلغ الإجمالي
        foreach ($productsData as $product) {
            $productModel = Product::find($product['ProductID']);
            $subTotal = $product['Quantity'] * $productModel->UnitPrice;
            $profit = $subTotal - ($product['Quantity'] * $productModel->UnitCost);
            $totalAmount += $subTotal;

            SaleDetail::create([
                'SaleID' => $sale->SaleID,
                'ProductID' => $product['ProductID'],
                'Quantity' => $product['Quantity'],
                'UnitPrice' => $productModel->UnitPrice,
                'UnitCost' => $productModel->UnitCost,
                'SubTotal' => $subTotal,
                'Profit' => $profit,
            ]);
        }

        // حساب المبلغ المتبقي وتحديث الفاتورة
        $remainingAmount = $totalAmount - $request->PaidAmount;
        
        $sale->update([
            'TotalAmount' => $totalAmount,
            'RemainingAmount' => $remainingAmount,
        ]);

        // تحديث حساب التاجر
        $trader = Trader::find($request->TraderID);
        $trader->Balance += $totalAmount;
        $trader->TotalSales += $totalAmount;
        $trader->save();

        return redirect()->route('sales.index')->with('success', 'تم إنشاء الفاتورة بنجاح');
    }
}
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Trader;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\FinancialController;

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
            'products' => 'required|array',
            'products.*.ProductID' => 'required|exists:products,ProductID',
            'products.*.Quantity' => 'required|numeric|min:1',
        ]);

        $totalAmount = 0;
        $productsData = $request->input('products');

        $sale = Sale::create([
            'InvoiceNumber' => 'INV-' . time(),
            'TraderID' => $request->TraderID,
            'SaleDate' => now(),
            'TotalAmount' => 0,
            'PaidAmount' => 0,
            'Status' => 'Pending',
        ]);

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

        $sale->update(['TotalAmount' => $totalAmount]);

        // تحديث المبلغ المتبقي للتاجر من خلال FinancialController
        $financialController = new FinancialController();
        $financialController->updateTraderBalance($request->TraderID, $totalAmount);

        return redirect()->route('sales.index')->with('success', 'تم إنشاء الفاتورة بنجاح');
    }
}
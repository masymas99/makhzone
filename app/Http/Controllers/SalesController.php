<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Trader;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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

        try {
            DB::beginTransaction();

            // التحقق من الكميات قبل إنشاء الفاتورة
            foreach ($request->products as $product) {
                $productModel = Product::find($product['ProductID']);
                
                if ($productModel->StockQuantity < $product['Quantity']) {
                    DB::rollBack();
                    return redirect()->back()->with('error', 'الكمية المطلوبة غير متوفرة في المخزون');
                }
            }

            // إنشاء الفاتورة مع القيم الأولية
            $sale = Sale::create([
                'InvoiceNumber' => 'INV-' . time(),
                'TraderID' => $request->TraderID,
                'SaleDate' => now(),
                'TotalAmount' => 0,
                'PaidAmount' => $request->PaidAmount,
                'Status' => 'pending',
                'RemainingAmount' => 0,
            ]);

            // حساب المبلغ الإجمالي وتحديث الكميات
            $totalAmount = 0;
            foreach ($request->products as $product) {
                $productModel = Product::find($product['ProductID']);
                
                $subTotal = $product['Quantity'] * $productModel->UnitPrice;
                $profit = $subTotal - ($product['Quantity'] * $productModel->UnitCost);
                $totalAmount += $subTotal;

                // إنشاء تفاصيل الفاتورة
                SaleDetail::create([
                    'SaleID' => $sale->SaleID,
                    'ProductID' => $product['ProductID'],
                    'Quantity' => $product['Quantity'],
                    'UnitPrice' => $productModel->UnitPrice,
                    'UnitCost' => $productModel->UnitCost,
                    'SubTotal' => $subTotal,
                    'Profit' => $profit,
                ]);

                // تحديث كمية المنتج
                $productModel->StockQuantity -= $product['Quantity'];
                $productModel->save();
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

            DB::commit();
            return redirect()->route('sales.index')->with('success', 'تم إنشاء الفاتورة بنجاح');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'حدث خطأ أثناء إنشاء الفاتورة: ' . $e->getMessage());
        }
    }
}
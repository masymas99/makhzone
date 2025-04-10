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

            // تحديث حساب العميل
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

    public function edit($id)
    {
        $sale = Sale::with('trader', 'details.product')->findOrFail($id);
        $traders = Trader::where('IsActive', 1)->get();
        return Inertia::render('Sales/Edit', [
            'sale' => $sale,
            'traders' => $traders,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'trader_id' => 'required|exists:traders,TraderID',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid,partial,cancelled',
            'products' => 'required|array',
            'products.*.ProductID' => 'required|exists:products,ProductID',
            'products.*.Quantity' => 'required|numeric|min:1',
        ]);

        try {
            DB::beginTransaction();

            $sale = Sale::with('details.product')->findOrFail($id);

            // First, restore the previous quantities
            foreach ($sale->details as $detail) {
                $product = Product::find($detail->ProductID);
                if ($product) {
                    $product->StockQuantity += $detail->Quantity;
                    $product->save();
                }
            }

            // Delete old details
            $sale->details()->delete();

            // Create new details with updated quantities
            $totalAmount = 0;
            foreach ($request->products as $product) {
                $productModel = Product::find($product['ProductID']);

                // Check if we have enough stock
                if ($productModel->StockQuantity < $product['Quantity']) {
                    DB::rollBack();
                    return redirect()->back()->with('error', 'الكمية المطلوبة غير متوفرة في المخزون');
                }

                $subTotal = $product['Quantity'] * $productModel->UnitPrice;
                $profit = $subTotal - ($product['Quantity'] * $productModel->UnitCost);
                $totalAmount += $subTotal;

                // Create new sale detail
                SaleDetail::create([
                    'SaleID' => $sale->SaleID,
                    'ProductID' => $product['ProductID'],
                    'Quantity' => $product['Quantity'],
                    'UnitPrice' => $productModel->UnitPrice,
                    'UnitCost' => $productModel->UnitCost,
                    'SubTotal' => $subTotal,
                    'Profit' => $profit,
                ]);

                // Update product quantity
                $productModel->StockQuantity -= $product['Quantity'];
                $productModel->save();
            }

            // Update sale information
            $sale->update([
                'TraderID' => $request->trader_id,
                'TotalAmount' => $totalAmount,
                'PaidAmount' => $request->paid_amount,
                'Status' => $request->status,
                'RemainingAmount' => $totalAmount - $request->paid_amount,
                'Note' => $request->note,
            ]);

            // Update trader balance
            $trader = Trader::find($request->trader_id);
            if ($trader) {
                $trader->Balance = $trader->Balance - $sale->TotalAmount + $totalAmount;
                $trader->save();
            }

            DB::commit();
            return redirect()->route('sales.index')->with('success', 'تم تحديث الفاتورة بنجاح');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'حدث خطأ أثناء تحديث الفاتورة: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $sale = Sale::with(['details', 'payments'])->findOrFail($id);

            // Restore product quantities
            foreach ($sale->details as $detail) {
                $product = Product::find($detail->ProductID);
                if ($product) {
                    $product->StockQuantity += $detail->Quantity;
                    $product->save();
                }
            }

            // Delete sale details first
            $sale->details()->delete();

            // Delete related payments
            $sale->payments()->delete();

            // Update trader balance
            $trader = $sale->trader;
            if ($trader) {
                $trader->Balance -= $sale->TotalAmount;
                $trader->save();
            }

            // Then delete the sale itself
            $sale->delete();

            DB::commit();
            return redirect()->route('sales.index')->with('success', 'تم حذف الفاتورة بنجاح');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'حدث خطأ أثناء حذف الفاتورة: ' . $e->getMessage());
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\InventoryBatch;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductsController extends Controller
{
    public function index()
    {
        $products = Product::with([
            'inventoryBatches' => function ($query) {
                $query->orderBy('PurchaseDate', 'desc');
            },
            'purchases' => function ($query) {
                $query->orderBy('PurchaseDate', 'desc');
            }
        ])
        ->latest()
        ->paginate(10);

        $purchases = Purchase::orderBy('PurchaseDate', 'desc')->get();

        return Inertia::render('Products/Index', [
            'products' => $products->items(),
            'links' => $products->links(),
            'purchases' => $purchases,
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ProductName' => 'required|string|max:255',
            'Category' => 'required|string|max:255',
            'StockQuantity' => 'required|integer|min:1',
            'UnitCost' => 'required|numeric|min:0',
            'UnitPrice' => 'nullable|numeric|min:0',
            'IsActive' => 'boolean',
            'product_id' => 'nullable|exists:products,ProductID',
            'SupplierName' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            if ($validated['product_id']) {
                $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
                
                $newQuantity = $validated['StockQuantity'];
                $newCost = $validated['UnitCost'];
                
                // Calculate new average cost
                $totalCost = ($product->StockQuantity * $product->UnitCost) + ($newQuantity * $newCost);
                $newAverageCost = $totalCost / ($product->StockQuantity + $newQuantity);

                $product->StockQuantity += $newQuantity;
                $product->UnitCost = $newAverageCost;
                $product->save();

                // Generate batch number
                $batchNumber = 'ADDITION-' . now()->format('YmdHis');

                // Create purchase record with correct TotalAmount
                $purchase = Purchase::create([
                    'ProductID' => $product->ProductID,
                    'Quantity' => $newQuantity,
                    'UnitCost' => $newCost,
                    'TotalAmount' => round($newQuantity * $newCost, 2),
                    'BatchNumber' => $batchNumber,
                    'PurchaseDate' => now(),
                    'SupplierName' => $validated['SupplierName'] ?? 'غير محدد',
                    'Notes' => 'إضافة كمية جديدة للمنتج',
                ]);

                // Create inventory batch
                InventoryBatch::create([
                    'ProductID' => $product->ProductID,
                    'PurchaseID' => $purchase->PurchaseID,
                    'BatchNumber' => $batchNumber,
                    'Quantity' => $newQuantity,
                    'UnitCost' => $newCost,
                    'PurchaseDate' => now(),
                ]);

                DB::commit();
                return redirect()->route('products.index')
                    ->with('success', 'تم إضافة الكمية بنجاح');
            } else {
                $product = Product::create([
                    'ProductName' => $validated['ProductName'],
                    'Category' => $validated['Category'],
                    'StockQuantity' => $validated['StockQuantity'],
                    'UnitCost' => $validated['UnitCost'],
                    'UnitPrice' => $validated['UnitPrice'] ?? 0,
                    'IsActive' => $validated['IsActive'] ?? true,
                ]);

                // Generate batch number
                $batchNumber = 'INIT-' . now()->format('YmdHis');

                // Create purchase record with correct TotalAmount
                $purchase = Purchase::create([
                    'ProductID' => $product->ProductID,
                    'Quantity' => $validated['StockQuantity'],
                    'UnitCost' => $validated['UnitCost'],
                    'TotalAmount' => round($validated['StockQuantity'] * $validated['UnitCost'], 2),
                    'BatchNumber' => $batchNumber,
                    'PurchaseDate' => now(),
                    'SupplierName' => $validated['SupplierName'] ?? 'غير محدد',
                    'Notes' => 'إضافة منتج جديد',
                ]);

                // Create initial inventory batch
                InventoryBatch::create([
                    'ProductID' => $product->ProductID,
                    'PurchaseID' => $purchase->PurchaseID,
                    'BatchNumber' => $batchNumber,
                    'Quantity' => $validated['StockQuantity'],
                    'UnitCost' => $validated['UnitCost'],
                    'PurchaseDate' => now(),
                ]);

                DB::commit();
                return redirect()->route('products.index')
                    ->with('success', 'تم إضافة المنتج بنجاح');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        $product = Product::findOrFail($id);
        return Inertia::render('Products/Edit', [
            'product' => $product,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'ProductName' => 'required|string|max:255',
            'Category' => 'required|string|max:255',
            'StockQuantity' => 'required|integer|min:0',
            'UnitPrice' => 'nullable|numeric|min:0',
            'UnitCost' => 'nullable|numeric|min:0',
            'IsActive' => 'boolean',
        ]);

        $product = Product::findOrFail($id);
        $product->update($validated);

        return redirect()->route('products.index')
            ->with('success', 'تم تحديث المنتج بنجاح');
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'تم حذف المنتج بنجاح');
    }
}
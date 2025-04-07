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
        $products = Product::with('inventoryBatches')
            ->latest()
            ->paginate(10);

        return Inertia::render('Products/Index', [
            'products' => $products->items(),
            'links' => $products->links(),
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
                
                // Calculate new average cost
                $newQuantity = $validated['StockQuantity'];
                $newCost = $validated['UnitCost'];
                $currentQuantity = $product->StockQuantity;
                
                if ($currentQuantity > 0) {
                    // Calculate weighted average cost
                    $totalCost = ($currentQuantity * $product->UnitCost) + ($newQuantity * $newCost);
                    $newAverageCost = $totalCost / ($currentQuantity + $newQuantity);
                    $product->UnitCost = $newAverageCost;
                } else {
                    $product->UnitCost = $newCost;
                }

                $product->StockQuantity += $newQuantity;
                $product->save();

                // Generate batch number first
                $batchNumber = 'ADDITION-' . now()->format('YmdHis');

                // Create purchase record first to get PurchaseID
                $purchase = Purchase::create([
                    'ProductID' => $product->ProductID,
                    'Quantity' => $newQuantity,
                    'UnitCost' => $newCost,
                    'TotalAmount' => $newQuantity * $newCost,
                    'BatchNumber' => $batchNumber,
                    'PurchaseDate' => now(),
                    'SupplierName' => $validated['SupplierName'] ?? 'غير محدد',
                ]);

                // Create inventory batch with PurchaseID and BatchNumber
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

                // Generate batch number first
                $batchNumber = 'INIT-' . now()->format('YmdHis');

                // Create purchase record first to get PurchaseID
                $purchase = Purchase::create([
                    'ProductID' => $product->ProductID,
                    'Quantity' => $validated['StockQuantity'],
                    'UnitCost' => $validated['UnitCost'],
                    'TotalAmount' => $validated['StockQuantity'] * $validated['UnitCost'],
                    'BatchNumber' => $batchNumber,
                    'PurchaseDate' => now(),
                    'SupplierName' => $validated['SupplierName'] ?? 'غير محدد',
                ]);

                // Create initial inventory batch with PurchaseID and BatchNumber
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

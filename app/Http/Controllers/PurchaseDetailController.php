<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Product;
use App\Models\InventoryBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseDetailController extends Controller
{
    public function index(Purchase $purchase)
    {
        return Inertia::render('Purchases/Details/Index', [
            'purchase' => $purchase,
            'details' => $purchase->details()->paginate(10)
        ]);
    }

    public function create(Purchase $purchase)
    {
        return Inertia::render('Purchases/Details/Create', [
            'purchase' => $purchase
        ]);
    }

    public function store(Request $request, Purchase $purchase)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:1',
            'price' => 'required|numeric|min:0'
        ]);

        $product = Product::findOrFail($validated['product_id']);
        
        // Create purchase detail
        $detail = $purchase->details()->create([
            'ProductID' => $product->ProductID,
            'Quantity' => $validated['quantity'],
            'UnitCost' => $validated['price'],
            'SubTotal' => $validated['quantity'] * $validated['price']
        ]);

        // Create inventory batch
        InventoryBatch::create([
            'ProductID' => $product->ProductID,
            'PurchaseID' => $purchase->PurchaseID,
            'BatchNumber' => 'BATCH-' . $purchase->PurchaseID . '-' . $detail->PurchaseDetailID,
            'Quantity' => $validated['quantity'],
            'UnitCost' => $validated['price'],
            'PurchaseDate' => $purchase->PurchaseDate
        ]);

        // Update product stock
        $product->StockQuantity += $validated['quantity'];
        $product->save();

        return redirect()->route('purchases.details.index', $purchase);
    }

    public function edit(Purchase $purchase, PurchaseDetail $detail)
    {
        return Inertia::render('Purchases/Details/Edit', [
            'purchase' => $purchase,
            'detail' => $detail
        ]);
    }

    public function update(Request $request, Purchase $purchase, PurchaseDetail $detail)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:1',
            'price' => 'required|numeric|min:0'
        ]);

        $detail->update($validated);

        return redirect()->route('purchases.details.index', $purchase);
    }

    public function destroy(Purchase $purchase, PurchaseDetail $detail)
    {
        $detail->delete();
        return redirect()->route('purchases.details.index', $purchase);
    }
}
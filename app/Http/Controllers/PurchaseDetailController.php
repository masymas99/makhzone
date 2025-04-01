<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseDetail;
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

        $purchase->details()->create($validated);

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
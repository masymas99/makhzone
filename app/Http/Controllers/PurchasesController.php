<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseDetail;
use Illuminate\Http\Request;

class PurchasesController extends Controller
{
    public function index()
    {
        $purchases = Purchase::with(['purchaseDetails' => function($query) {
            $query->with('product');
        }])->get();

        return inertia('Purchases/Index', [
            'purchases' => $purchases
        ]);
    }

    public function create()
    {
        return inertia('Purchases/Create');
    }

    public function store(Request $request)
    {
        $purchase = Purchase::create($request->all());
        
        if ($request->has('details')) {
            foreach ($request->details as $detail) {
                PurchaseDetail::create([
                    'PurchaseID' => $purchase->id,
                    'ProductID' => $detail['ProductID'],
                    'Quantity' => $detail['Quantity'],
                    'UnitPrice' => $detail['UnitPrice'],
                ]);
            }
        }

        return redirect()->route('purchases.index');
    }

    public function show(Purchase $purchase)
    {
        $purchase->load(['purchaseDetails' => function($query) {
            $query->with('product');
        }]);
        
        return inertia('Purchases/Show', [
            'purchase' => $purchase
        ]);
    }

    public function edit(Purchase $purchase)
    {
        $purchase->load(['purchaseDetails' => function($query) {
            $query->with('product');
        }]);
        
        return inertia('Purchases/Edit', [
            'purchase' => $purchase
        ]);
    }

    public function update(Request $request, Purchase $purchase)
    {
        $purchase->update($request->all());
        
        if ($request->has('details')) {
            $purchase->purchaseDetails()->delete();
            
            foreach ($request->details as $detail) {
                PurchaseDetail::create([
                    'PurchaseID' => $purchase->id,
                    'ProductID' => $detail['ProductID'],
                    'Quantity' => $detail['Quantity'],
                    'UnitPrice' => $detail['UnitPrice'],
                ]);
            }
        }

        return redirect()->route('purchases.index');
    }

    public function destroy(Purchase $purchase)
    {
        $purchase->delete();
        return redirect()->route('purchases.index');
    }
}

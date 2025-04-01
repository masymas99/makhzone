<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    protected $purchase;

    public function __construct(Purchase $purchase)
    {
        $this->purchase = $purchase;
    }

    public function index()
    {
        $purchases = $this->purchase->with(['supplier'])->get();
        return Inertia::render('Purchases/Index', ['purchases' => $purchases]);
    }

    public function create()
    {
        return Inertia::render('Purchases/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,SupplierID',
            'purchase_date' => 'required|date',
            'total_amount' => 'required|numeric|min:0'
        ]);

        $this->purchase->create($validated);
        return redirect()->route('purchases.index');
    }

    public function show($id)
    {
        $purchase = $this->purchase->with(['supplier', 'details.product'])->findOrFail($id);
        return Inertia::render('Purchases/Show', ['purchase' => $purchase]);
    }
}
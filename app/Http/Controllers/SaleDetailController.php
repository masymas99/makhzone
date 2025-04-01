<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaleDetailController extends Controller
{
    public function index(Sale $sale)
    {
        return Inertia::render('Sales/Details/Index', [
            'sale' => $sale,
            'details' => $sale->details()->paginate(10)
        ]);
    }

    public function create(Sale $sale)
    {
        return Inertia::render('Sales/Details/Create', [
            'sale' => $sale
        ]);
    }

    public function store(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:1',
            'price' => 'required|numeric|min:0'
        ]);

        $sale->details()->create($validated);

        return redirect()->route('sales.details.index', $sale);
    }

    public function edit(Sale $sale, SaleDetail $detail)
    {
        return Inertia::render('Sales/Details/Edit', [
            'sale' => $sale,
            'detail' => $detail
        ]);
    }

    public function update(Request $request, Sale $sale, SaleDetail $detail)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:1',
            'price' => 'required|numeric|min:0'
        ]);

        $detail->update($validated);

        return redirect()->route('sales.details.index', $sale);
    }

    public function destroy(Sale $sale, SaleDetail $detail)
    {
        $detail->delete();
        return redirect()->route('sales.details.index', $sale);
    }
}
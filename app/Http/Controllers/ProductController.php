<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    protected $product;

    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    public function index()
    {
        $products = $this->product->where('IsActive', 1)->get();
        return Inertia::render('Products/Index', ['products' => $products]);
    }

    public function create()
    {
        return Inertia::render('Products/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ProductName' => 'required|string|max:255',
            'Category' => 'required|string|max:100',
            'StockQuantity' => 'required|integer|min:0',
            'UnitPrice' => 'required|numeric|min:0',
            'UnitCost' => 'required|numeric|min:0',
            'IsActive' => 'sometimes|boolean'
        ]);

        $this->product->create($validated);
        return redirect()->route('products.index');
    }

    public function show($id)
    {
        $product = $this->product->findOrFail($id);
        return Inertia::render('Products/Show', ['product' => $product]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'ProductName' => 'required|string|max:255',
            'Category' => 'required|string|max:100',
            'StockQuantity' => 'required|integer|min:0',
            'UnitPrice' => 'required|numeric|min:0',
            'UnitCost' => 'required|numeric|min:0',
            'IsActive' => 'sometimes|boolean'
        ]);

        $product = $this->product->findOrFail($id);
        $product->update($validated);
        return redirect()->route('products.index');
    }

    public function destroy($id)
    {
        $product = $this->product->findOrFail($id);
        $product->update(['IsActive' => 0]);
        return redirect()->route('products.index');
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    protected $sale;
    protected $saleDetail;

    public function __construct(Sale $sale, SaleDetail $saleDetail)
    {
        $this->sale = $sale;
        $this->saleDetail = $saleDetail;
    }

    public function index()
    {
        $sales = $this->sale->with(['trader', 'details.product'])->get();
        $traders = \App\Models\Trader::all();
        $products = \App\Models\Product::all();
        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'traders' => $traders,
            'products' => $products
        ]);
    }

    public function create()
    {
        $traders = \App\Models\Trader::all();
        $products = \App\Models\Product::all();

        return Inertia::render('Sales/Create', [
            'traders' => $traders,
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'trader_id' => 'required|exists:traders,TraderID',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,ProductID',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        // Validate stock levels manually
        foreach ($request->products as $index => $product) {
            $productModel = Product::find($product['product_id']);
            if (!$productModel) {
                return redirect()->back()->withErrors(['products.' . $index . '.product_id' => 'المنتج غير موجود']);
            }

            if ($product['quantity'] > $productModel->stock) {
                return redirect()->back()->withErrors(['products.' . $index . '.quantity' => 'الكمية المطلوبة غير متوفرة']);
            }
        }

        // Continue with creating the sale...
        // Your code to create the sale record
    }

    public function show($id)
    {
        $sale = $this->sale->with(['trader', 'details.product'])->findOrFail($id);
        return Inertia::render('Sales/Show', ['sale' => $sale]);
    }
}
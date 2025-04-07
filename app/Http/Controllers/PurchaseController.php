<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\Product;
use App\Models\PurchaseDetail;
use App\Models\InventoryBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    protected $purchase;

    public function __construct(Purchase $purchase)
    {
        $this->purchase = $purchase;
    }

    public function index()
    {
        $purchases = $this->purchase->with([
            'supplier',
            'purchaseDetails' => function ($query) {
                $query->with('product:ProductID,ProductName,UnitCost');
            }
        ])->get();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases->map(function ($purchase) {
                return [
                    'id' => $purchase->PurchaseID,
                    'purchase_date' => $purchase->PurchaseDate,
                    'total_amount' => $purchase->TotalAmount,
                    'batch_number' => $purchase->BatchNumber,
                    'supplier_name' => $purchase->supplier ? $purchase->supplier->Name : $purchase->SupplierName,
                    'notes' => $purchase->Notes,
                    'created_at' => $purchase->created_at,
                    'updated_at' => $purchase->updated_at,
                    'details' => $purchase->purchaseDetails->map(function ($detail) {
                        return [
                            'product_id' => $detail->ProductID,
                            'product_name' => $detail->product ? $detail->product->ProductName : '---',
                            'quantity' => $detail->Quantity,
                            'unit_cost' => $detail->UnitCost,
                            'subtotal' => $detail->SubTotal
                        ];
                    })
                ];
            })
        ]);
    }

    public function create()
    {
        $products = Product::select('ProductID', 'ProductName', 'Category', 'UnitCost', 'UnitPrice')
            ->get();

        return Inertia::render('Purchases/Create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'required|string|max:255',
            'products' => 'required|array',
            'products.*.product_id' => 'nullable|exists:products,ProductID',
            'products.*.product_name' => 'required_without:products.*.product_id|string|max:255',
            'products.*.category' => 'required_without:products.*.product_id|string|max:255',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.unit_cost' => 'required|numeric|min:0',
            'products.*.unit_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Create the purchase
            $purchase = Purchase::create([
                'SupplierName' => $validated['supplier_name'],
                'PurchaseDate' => now(),
                'TotalAmount' => 0,
                'Notes' => $validated['notes'],
            ]);

            $totalAmount = 0;
            foreach ($validated['products'] as $productData) {
                if ($productData['product_id']) {
                    // Existing product
                    $product = Product::lockForUpdate()->findOrFail($productData['product_id']);
                    
                    $newQuantity = $productData['quantity'];
                    $newCost = $productData['unit_cost'];
                    
                    // Calculate new average cost
                    $totalCost = ($product->StockQuantity * $product->UnitCost) + ($newQuantity * $newCost);
                    $newAverageCost = $totalCost / ($product->StockQuantity + $newQuantity);

                    $product->StockQuantity += $newQuantity;
                    $product->UnitCost = $newAverageCost;
                    $product->UnitPrice = $productData['unit_price'] ?? $product->UnitPrice;
                    $product->save();
                } else {
                    // New product
                    $product = Product::create([
                        'ProductName' => $productData['product_name'],
                        'Category' => $productData['category'],
                        'StockQuantity' => $productData['quantity'],
                        'UnitCost' => $productData['unit_cost'],
                        'UnitPrice' => $productData['unit_price'] ?? 0,
                        'IsActive' => true,
                    ]);
                }

                // Create purchase detail
                $purchaseDetail = PurchaseDetail::create([
                    'PurchaseID' => $purchase->PurchaseID,
                    'ProductID' => $product->ProductID,
                    'Quantity' => $productData['quantity'],
                    'UnitCost' => $productData['unit_cost'],
                    'SubTotal' => $productData['quantity'] * $productData['unit_cost'],
                ]);

                $totalAmount += $purchaseDetail->SubTotal;

                // Create inventory batch
                $batchNumber = $productData['product_id'] ? 
                    'ADDITION-' . now()->format('YmdHis') : 
                    'INIT-' . now()->format('YmdHis');

                InventoryBatch::create([
                    'ProductID' => $product->ProductID,
                    'PurchaseID' => $purchase->PurchaseID,
                    'BatchNumber' => $batchNumber,
                    'Quantity' => $productData['quantity'],
                    'UnitCost' => $productData['unit_cost'],
                    'PurchaseDate' => now(),
                ]);
            }

            // Update purchase total amount
            $purchase->TotalAmount = $totalAmount;
            $purchase->save();

            DB::commit();
            return redirect()->route('purchases.index')
                ->with('success', 'تم إضافة المشتريات بنجاح');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $purchase = $this->purchase->with(['supplier', 'details.product'])->findOrFail($id);
        return Inertia::render('Purchases/Show', ['purchase' => $purchase]);
    }
}
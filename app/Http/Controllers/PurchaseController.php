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
        $purchase = $this->purchase->with([
            'supplier',
            'purchaseDetails' => function ($query) {
                $query->with('product:ProductID,ProductName,Category,UnitCost,UnitPrice');
            }
        ])->findOrFail($id);

        return Inertia::render('Purchases/Show', [
            'purchase' => [
                'id' => $purchase->PurchaseID,
                'purchase_date' => $purchase->PurchaseDate,
                'invoice_number' => $purchase->InvoiceNumber,
                'supplier_name' => $purchase->supplier ? $purchase->supplier->Name : $purchase->SupplierName,
                'total_amount' => $purchase->TotalAmount,
                'notes' => $purchase->Notes,
                'created_at' => $purchase->created_at,
                'updated_at' => $purchase->updated_at,
                'details' => $purchase->purchaseDetails->map(function ($detail) {
                    return [
                        'product_id' => $detail->ProductID,
                        'product_name' => $detail->product ? $detail->product->ProductName : '---',
                        'category' => $detail->product ? $detail->product->Category : '---',
                        'quantity' => $detail->Quantity,
                        'unit_cost' => $detail->UnitCost,
                        'unit_price' => $detail->product ? $detail->product->UnitPrice : 0,
                        'subtotal' => $detail->SubTotal
                    ];
                })
            ]
        ]);
    }

    public function edit($id)
    {
        $purchase = $this->purchase->with([
            'purchaseDetails' => function ($query) {
                $query->with('product:ProductID,ProductName,Category,UnitCost,UnitPrice');
            }
        ])->findOrFail($id);

        $products = Product::select('ProductID', 'ProductName', 'Category', 'UnitCost', 'UnitPrice')->get();

        return Inertia::render('Purchases/Edit', [
            'purchase' => [
                'id' => $purchase->PurchaseID,
                'supplier_name' => $purchase->SupplierName,
                'notes' => $purchase->Notes,
                'details' => $purchase->purchaseDetails->map(function ($detail) {
                    return [
                        'product_id' => $detail->ProductID,
                        'product_name' => $detail->product ? $detail->product->ProductName : '---',
                        'category' => $detail->product ? $detail->product->Category : '---',
                        'quantity' => $detail->Quantity,
                        'unit_cost' => $detail->UnitCost,
                        'unit_price' => $detail->product ? $detail->product->UnitPrice : 0,
                    ];
                })
            ],
            'products' => $products
        ]);
    }

    public function destroy($id)
    {
        $purchase = $this->purchase->findOrFail($id);

        DB::beginTransaction();
        try {
            // Delete inventory batches
            InventoryBatch::where('PurchaseID', $purchase->PurchaseID)->delete();

            // Update product stock quantities
            foreach ($purchase->purchaseDetails as $detail) {
                $product = $detail->product;
                $product->StockQuantity -= $detail->Quantity;
                $product->save();
            }

            // Delete purchase details
            PurchaseDetail::where('PurchaseID', $purchase->PurchaseID)->delete();

            // Delete the purchase
            $purchase->delete();

            DB::commit();
            return redirect()->route('purchases.index')
                ->with('success', 'تم حذف المشتريات بنجاح');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'حدث خطأ أثناء حذف المشتريات']);
        }
    }

    public function update(Request $request, $id)
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

        $purchase = $this->purchase->findOrFail($id);

        DB::beginTransaction();
        try {
            // First, update existing purchase details
            foreach ($purchase->purchaseDetails as $detail) {
                $product = $detail->product;
                $product->StockQuantity -= $detail->Quantity;
                $product->save();
            }

            // Delete existing purchase details
            PurchaseDetail::where('PurchaseID', $purchase->PurchaseID)->delete();

            // Update the purchase
            $purchase->update([
                'SupplierName' => $validated['supplier_name'],
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

                // Create new purchase detail
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
                    'UPDATE-' . now()->format('YmdHis') : 
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
                ->with('success', 'تم تحديث المشتريات بنجاح');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'حدث خطأ أثناء تحديث المشتريات']);
        }
    }
}
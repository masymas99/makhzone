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
        return Inertia::render('Purchases/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,SupplierID',
            'purchase_date' => 'required|date',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,ProductID',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $purchase = Purchase::create([
                'SupplierID' => $validated['supplier_id'],
                'SupplierName' => $request->supplier_name,
                'PurchaseDate' => $validated['purchase_date'],
                'TotalAmount' => 0,
            ]);

            $totalAmount = 0;

            foreach ($validated['details'] as $detail) {
                $product = Product::lockForUpdate()->findOrFail($detail['product_id']);
                
                // Calculate new average cost
                $newQuantity = $detail['quantity'];
                $newCost = $detail['unit_cost'];
                $currentQuantity = $product->StockQuantity;
                
                if ($currentQuantity > 0) {
                    // Calculate weighted average cost
                    $totalCost = ($currentQuantity * $product->UnitCost) + ($newQuantity * $newCost);
                    $newAverageCost = $totalCost / ($currentQuantity + $newQuantity);
                    
                    // Update product cost
                    $product->UnitCost = $newAverageCost;
                } else {
                    // First purchase of this product
                    $product->UnitCost = $newCost;
                }

                // Create purchase detail
                $purchaseDetail = PurchaseDetail::create([
                    'PurchaseID' => $purchase->PurchaseID,
                    'ProductID' => $product->ProductID,
                    'Quantity' => $detail['quantity'],
                    'UnitCost' => $newCost,
                    'SubTotal' => $detail['quantity'] * $newCost,
                ]);

                // Create inventory batch
                InventoryBatch::create([
                    'ProductID' => $product->ProductID,
                    'PurchaseID' => $purchase->PurchaseID,
                    'BatchNumber' => 'BATCH-' . $purchase->PurchaseID . '-' . $purchaseDetail->PurchaseDetailID,
                    'Quantity' => $detail['quantity'],
                    'UnitCost' => $newCost,
                    'PurchaseDate' => $purchase->PurchaseDate,
                ]);

                // Update product stock
                $product->StockQuantity += $detail['quantity'];
                $product->save();

                $totalAmount += $detail['quantity'] * $newCost;
            }

            // Update purchase total amount
            $purchase->TotalAmount = $totalAmount;
            $purchase->save();

            DB::commit();
            return redirect()->route('purchases.index')->with('success', 'تم إضافة المشتريات بنجاح');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $purchase = $this->purchase->with(['supplier', 'details.product'])->findOrFail($id);
        return Inertia::render('Purchases/Show', ['purchase' => $purchase]);
    }
}
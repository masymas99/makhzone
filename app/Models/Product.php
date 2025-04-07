<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $primaryKey = 'ProductID';
    protected $fillable = [
        'ProductName',
        'Category',
        'StockQuantity',
        'UnitPrice',
        'UnitCost',
        'IsActive'
    ];

    protected $casts = [
        'StockQuantity' => 'integer',
        'UnitPrice' => 'decimal:2',
        'UnitCost' => 'decimal:2',
        'IsActive' => 'boolean'
    ];

    public function saleDetails()
    {
        return $this->hasMany(SaleDetail::class, 'ProductID');
    }

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class, 'ProductID');
    }

    public function calculateCurrentCost()
    {
        if ($this->StockQuantity <= 0) {
            return 0;
        }
        return $this->UnitCost;
    }

    public function updateCost($newQuantity, $newUnitCost)
    {
        if ($this->StockQuantity > 0) {
            // Calculate weighted average cost
            $totalCost = ($this->StockQuantity * $this->UnitCost) + ($newQuantity * $newUnitCost);
            $newAverageCost = $totalCost / ($this->StockQuantity + $newQuantity);
            
            $this->UnitCost = $newAverageCost;
        } else {
            // First purchase of this product
            $this->UnitCost = $newUnitCost;
        }
        
        $this->StockQuantity += $newQuantity;
        $this->save();
    }

    public function inventoryBatches()
    {
        return $this->hasMany(InventoryBatch::class, 'ProductID', 'ProductID');
    }
}      

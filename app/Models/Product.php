<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $primaryKey = 'ProductID';
    protected $table = 'products';

    protected $fillable = [
        'ProductName',
        'Description',
        'UnitPrice',
        'UnitCost',
        'StockQuantity',
        'IsActive'
    ];

    protected $casts = [
        'UnitPrice' => 'decimal:2',
        'UnitCost' => 'decimal:2',
        'StockQuantity' => 'integer',
        'IsActive' => 'boolean'
    ];

    public function saleDetails(): HasMany
    {
        return $this->hasMany(SaleDetail::class, 'ProductID');
    }

    public function purchaseDetails(): HasMany
    {
        return $this->hasMany(PurchaseDetail::class, 'ProductID');
    }

    public function inventoryBatches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class, 'ProductID');
    }

    public function calculateCurrentCost(): float
    {
        if ($this->StockQuantity <= 0) {
            return 0;
        }
        return $this->UnitCost;
    }

    public function updateCost(int $newQuantity, float $newUnitCost): void
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

  

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'ProductID', 'ProductID');
    }
}

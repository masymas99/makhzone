<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product;

class InventoryBatch extends Model
{
    protected $table = 'inventory_batches';
    
    protected $fillable = [
        'ProductID',
        'BatchNumber',
        'Quantity',
        'UnitCost',
        'PurchaseDate'
    ];

    protected $casts = [
        'PurchaseDate' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID');
    }
}
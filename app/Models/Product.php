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

    public function saleDetails()
    {
        return $this->hasMany(SaleDetail::class, 'ProductID');
    }

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class, 'ProductID');
    }
}
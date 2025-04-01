<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseDetail extends Model
{
    use HasFactory;

    protected $primaryKey = 'PurchaseDetailID';
    protected $fillable = [
        'PurchaseID',
        'ProductID',
        'Quantity',
        'UnitCost',
        'SubTotal'
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'PurchaseID');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID');
    }
}
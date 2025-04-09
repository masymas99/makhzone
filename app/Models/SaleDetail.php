<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'SaleID',
        'ProductID',
        'Quantity',
        'UnitPrice',
        'SubTotal',
        'UnitCost',
        'Profit'
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class, 'SaleID');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    protected $primaryKey = 'PurchaseID';
    protected $fillable = [
        'SupplierID',
        'PurchaseDate',
        'TotalAmount'
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'SupplierID');
    }

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class, 'PurchaseID');
    }
}
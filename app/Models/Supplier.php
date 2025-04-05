<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Purchase;

class Supplier extends Model
{
    use HasFactory;

    protected $primaryKey = 'SupplierID';
    protected $fillable = [
        'Name',
        'Phone',
        'Email',
        'Address'
    ];

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'SupplierID');
    }
}

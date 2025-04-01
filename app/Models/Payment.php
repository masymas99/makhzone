<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $primaryKey = 'PaymentID';
    protected $fillable = [
        'TraderID',
        'SaleID',
        'PaymentDate',
        'Amount'
    ];

    public function trader()
    {
        return $this->belongsTo(Trader::class, 'TraderID');
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class, 'SaleID');
    }
}
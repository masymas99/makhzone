<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TraderFinancial extends Model
{
    protected $fillable = [
        'trader_id',
        'sale_id',
        'payment_id',
        'sale_amount',
        'payment_amount',
        'balance',
        'total_sales',
        'total_payments',
        'remaining_amount',
        'transaction_type',
        'description',
        'TraderID',
        'SaleID',
        'PaymentID',
    ];

    protected $casts = [
        'sale_amount' => 'decimal:2',
        'payment_amount' => 'decimal:2',
        'balance' => 'decimal:2',
        'total_sales' => 'decimal:2',
        'total_payments' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    public function trader(): BelongsTo
    {
        return $this->belongsTo(Trader::class, 'trader_id', 'TraderID');
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'SaleID');
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id', 'PaymentID');
    }
}

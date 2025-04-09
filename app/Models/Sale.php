<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory;

    protected $primaryKey = 'SaleID';
    protected $table = 'sales';

    protected $fillable = [
        'TraderID',
        'SaleDate',
        'TotalAmount',
        'PaidAmount'
    ];

    protected $casts = [
        'SaleDate' => 'date',
        'TotalAmount' => 'decimal:2',
        'PaidAmount' => 'decimal:2'
    ];

    public function trader(): BelongsTo
    {
        return $this->belongsTo(Trader::class, 'TraderID');
    }
    

    public function details(): HasMany
    {
        return $this->hasMany(SaleDetail::class, 'SaleID');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'SaleID');
    }

    public function getStatusAttribute(): string
    {
        return $this->PaidAmount >= $this->TotalAmount ? 'paid' : 'pending';
    }
}

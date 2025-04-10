<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Sale;
use App\Models\Purchase;
use App\Models\Payment;
use App\Models\TraderFinancial;

class Trader extends Model
{
    use HasFactory;

    protected $primaryKey = 'TraderID';

    protected $fillable = [
        'TraderName',
        'Phone',
        'Address',
        'Balance',
        'TotalSales',
        'TotalPayments',
        'IsActive'
    ];

    protected $casts = [
        'IsActive' => 'boolean',
        'Balance' => 'float',
        'TotalSales' => 'float',
        'TotalPayments' => 'float'
    ];

    protected $visible = [
        'TraderID',
        'TraderName',
        'Phone',
        'Address',
        'Balance',
        'TotalSales',
        'TotalPayments',
        'IsActive',
        'sales',
        'purchases',
        'payments',
        // debt
    ];

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'TraderID');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'TraderID');
    }

    public function financials(): HasMany
    {
        return $this->hasMany(TraderFinancial::class, 'trader_id');
    }

    public function calculateTotals(): array
    {
        // Calculate sales total
        $totalSales = $this->sales->reduce(function ($carry, $sale) {
            return $carry + $sale->TotalAmount;
        }, 0);

        // Calculate purchases total (using TotalPayments field)
        $totalPurchases = $this->TotalPayments;

        // Calculate payments total
        $totalPayments = $this->payments->sum('Amount');

        // Calculate balance
        $balance = $totalSales - $totalPurchases - $totalPayments;

        return [
            'totalSales' => $totalSales,
            'totalPurchases' => $totalPurchases,
            'totalPayments' => $totalPayments,
            'balance' => $balance
        ];
    }

    public function getFinancialStatus(): string
    {
        $balance = $this->calculateTotals()['balance'];

        if ($balance > 0) {
            return 'مستحق عليه'; // العميل مدين لنا
        } elseif ($balance < 0) {
            return 'مستحق له'; // نحن مدينون للعميل
        }
        return 'متوازن';
    }

    public function getBalanceColor(): string
    {
        $balance = $this->calculateTotals()['balance'];

        if ($balance > 0) {
            return 'bg-red-100 text-red-800'; // أحمر للديون
        } elseif ($balance < 0) {
            return 'bg-blue-100 text-blue-800'; // أزرق للحقوق
        }
        return 'bg-green-100 text-green-800'; // أخضر للتوازن
    }
}

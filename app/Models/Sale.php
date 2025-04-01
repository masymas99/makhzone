<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $primaryKey = 'SaleID';
    protected $fillable = [
        'TraderID',
        'SaleDate',
        'TotalAmount',
        'PaidAmount'
    ];

    public function trader()
    {
        return $this->belongsTo(Trader::class, 'TraderID');
    }

    public function saleDetails()
    {
        return $this->hasMany(SaleDetail::class, 'SaleID');
    }

    public static function profitSummary()
    {
        $totalSales = self::sum('TotalAmount');
        $cogs = \App\Models\SaleDetail::join('products', 'sale_details.ProductID', '=', 'products.ProductID')
            ->sum(\DB::raw('sale_details.Quantity * products.UnitCost'));
        $totalExpenses = \App\Models\Expense::sum('Amount');

        return [
            'total_sales' => $totalSales,
            'cogs' => $cogs,
            'total_expenses' => $totalExpenses,
            'profit' => $totalSales - $cogs - $totalExpenses
        ];
    }
}
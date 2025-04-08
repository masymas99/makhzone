<?php

namespace App\Observers;

use App\Models\Sale;
use App\Models\Payment;
use App\Models\TraderFinancial;
use App\Models\Trader;

class TraderFinancialObserver
{
    public function created(Sale $sale)
    {
        // Get the latest financial record for this trader
        $latestFinancial = TraderFinancial::where('trader_id', $sale->TraderID)
            ->orderBy('created_at', 'desc')
            ->first();

        // Get total sales and total payments for this trader
        $totalSales = $sale->trader->sales->sum('TotalAmount');
        $totalPayments = $sale->trader->sales->sum('PaidAmount');

        // Calculate remaining amount
        $remainingAmount = $totalSales - $totalPayments;

        // Create financial record
        TraderFinancial::create([
            'trader_id' => $sale->TraderID,
            'sale_id' => $sale->id,
            'sale_amount' => $sale->TotalAmount,
            'payment_amount' => $sale->PaidAmount,
            'balance' => $remainingAmount,
            'total_sales' => $totalSales,
            'total_payments' => $totalPayments,
            'remaining_amount' => $remainingAmount,
            'transaction_type' => 'sale',
            'description' => "تم إضافة فاتورة بيع رقم #{$sale->InvoiceNumber}",
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Update trader's balance
        $trader = $sale->trader;
        $trader->Balance = $remainingAmount;
        $trader->TotalSales = $totalSales;
        $trader->TotalPayments = $totalPayments;
        $trader->save();
    }

    public function updated(Sale $sale)
    {
        // Get all sale details for this sale
        $saleDetails = $sale->details;
        
        // Calculate total profit for this sale
        $totalProfit = $saleDetails->sum(function($detail) {
            return ($detail->UnitPrice - $detail->UnitCost) * $detail->Quantity;
        });

        // Get the latest financial record for this trader
        $latestFinancial = TraderFinancial::where('trader_id', $sale->TraderID)
            ->orderBy('created_at', 'desc')
            ->first();

        // Get total sales and total payments for this trader
        $totalSales = $sale->trader->sales->sum('TotalAmount');
        $totalPayments = $sale->trader->sales->sum('PaidAmount');

        // Calculate remaining amount
        $remainingAmount = $totalSales - $totalPayments;

        // Create financial record
        TraderFinancial::create([
            'trader_id' => $sale->TraderID,
            'sale_id' => $sale->id,
            'sale_amount' => $sale->TotalAmount,
            'payment_amount' => $sale->PaidAmount,
            'balance' => $remainingAmount,
            'total_sales' => $totalSales,
            'total_payments' => $totalPayments,
            'remaining_amount' => $remainingAmount,
            'profit' => $totalProfit,
            'transaction_type' => 'sale',
            'description' => "تم تحديث فاتورة بيع رقم #{$sale->InvoiceNumber}",
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Update trader's balance
        $trader = $sale->trader;
        $trader->Balance = $remainingAmount;
        $trader->TotalSales = $totalSales;
        $trader->TotalPayments = $totalPayments;
        $trader->save();
    }
}

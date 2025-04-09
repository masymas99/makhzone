<?php

namespace App\Observers;

use App\Models\Sale;
use App\Models\Payment;
use App\Models\TraderFinancial;
use App\Models\Trader;

class TraderFinancialObserver
{
    public function created($transaction)
    {
        if ($transaction instanceof Sale) {
            // For sales
            $latestFinancial = TraderFinancial::where('trader_id', $transaction->TraderID)
                ->orderBy('created_at', 'desc')
                ->first();

            $totalSales = $transaction->trader->sales->sum('TotalAmount');
            $totalPayments = $transaction->trader->sales->sum('PaidAmount') + 
                           $transaction->trader->payments->sum('Amount');

            // Calculate balance as total sales - total payments
            $remainingAmount = $totalSales - $totalPayments;

            TraderFinancial::create([
                'trader_id' => $transaction->TraderID,
                'sale_id' => $transaction->id,
                'sale_amount' => $transaction->TotalAmount,
                'payment_amount' => $transaction->PaidAmount,
                'balance' => $remainingAmount,
                'total_sales' => $totalSales,
                'total_payments' => $totalPayments,
                'remaining_amount' => $remainingAmount,
                'transaction_type' => 'sale',
                'description' => "تم إضافة فاتورة بيع رقم #{$transaction->InvoiceNumber}",
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } elseif ($transaction instanceof Payment) {
            // For payments
            $latestFinancial = TraderFinancial::where('trader_id', $transaction->TraderID)
                ->orderBy('created_at', 'desc')
                ->first();

            $totalSales = $transaction->trader->sales->sum('TotalAmount');
            $totalPayments = $transaction->trader->sales->sum('PaidAmount') + 
                           $transaction->trader->payments->sum('Amount');

            // Calculate balance as total sales - total payments
            $remainingAmount = $totalSales - $totalPayments;

            TraderFinancial::create([
                'trader_id' => $transaction->TraderID,
                'sale_id' => null,
                'payment_id' => $transaction->PaymentID,
                'sale_amount' => 0,
                'payment_amount' => $transaction->Amount,
                'balance' => $remainingAmount,
                'total_sales' => $totalSales,
                'total_payments' => $totalPayments,
                'remaining_amount' => $remainingAmount,
                'transaction_type' => 'payment',
                'description' => "تم إضافة دفعة يدوية بقيمة #{$transaction->Amount}",
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Update trader's balance
        $trader = $transaction->trader;
        $trader->Balance = $remainingAmount;
        $trader->TotalSales = $totalSales;
        $trader->TotalPayments = $totalPayments;
        $trader->save();
    }

    public function updated($transaction)
    {
        if ($transaction instanceof Sale) {
            // For sales
            $saleDetails = $transaction->details;
            $totalProfit = $saleDetails->sum(function($detail) {
                return ($detail->UnitPrice - $detail->UnitCost) * $detail->Quantity;
            });

            $latestFinancial = TraderFinancial::where('trader_id', $transaction->TraderID)
                ->orderBy('created_at', 'desc')
                ->first();

            $totalSales = $transaction->trader->sales->sum('TotalAmount');
            $totalPayments = $transaction->trader->sales->sum('PaidAmount') + 
                           $transaction->trader->payments->sum('Amount');

            // Calculate balance as total sales - total payments
            $remainingAmount = $totalSales - $totalPayments;

            TraderFinancial::create([
                'trader_id' => $transaction->TraderID,
                'sale_id' => $transaction->id,
                'sale_amount' => $transaction->TotalAmount,
                'payment_amount' => $transaction->PaidAmount,
                'balance' => $remainingAmount,
                'total_sales' => $totalSales,
                'total_payments' => $totalPayments,
                'remaining_amount' => $remainingAmount,
                'profit' => $totalProfit,
                'transaction_type' => 'sale',
                'description' => "تم تحديث فاتورة بيع رقم #{$transaction->InvoiceNumber}",
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Update trader's balance
        $trader = $transaction->trader;
        $trader->Balance = $remainingAmount;
        $trader->TotalSales = $totalSales;
        $trader->TotalPayments = $totalPayments;
        $trader->save();
    }
}

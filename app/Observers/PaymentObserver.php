<?php

namespace App\Observers;

use App\Models\Payment;
use App\Models\Trader;

class PaymentObserver
{
    /**
     * Handle the payment "created" event.
     */
    public function created(Payment $payment): void
    {
        // Update trader's balance when a payment is made
        $trader = Trader::findOrFail($payment->TraderID);
        
        // Update the trader's total payments
        $trader->TotalPayments += $payment->Amount;
        $trader->save();
    }

    /**
     * Handle the payment "deleted" event.
     */
    public function deleted(Payment $payment): void
    {
        // Update trader's balance when a payment is deleted
        $trader = Trader::findOrFail($payment->TraderID);
        
        // Update the trader's total payments
        $trader->TotalPayments -= $payment->Amount;
        $trader->save();
    }
}

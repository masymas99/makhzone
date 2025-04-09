<?php

namespace App\Http\Controllers;

use App\Models\Trader;

class FinancialController extends Controller
{
    public function updateTraderBalance($traderId, $amount)
    {
        $trader = Trader::find($traderId);
        if ($trader) {
            $trader->Balance += $amount;
            $trader->TotalSales += $amount;
            $trader->save();
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\TraderFinancial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TraderFinancialController extends Controller
{
    public function index()
    {
        $financials = TraderFinancial::with('trader')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Traders/Financials', [
            'financials' => $financials
        ]);
    }

    public function show($id)
    {
        $financial = TraderFinancial::with('trader')
            ->where('trader_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Traders/FinancialDetails', [
            'financial' => $financial
        ]);
    }
}

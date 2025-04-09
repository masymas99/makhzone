<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Trader;
use App\Models\Sale;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TraderController extends Controller
{
    public function index()
    {
        $traders = Trader::with(['sales', 'payments'])
            ->get()
            ->map(function ($trader) {
                // Calculate totals from sales
                $totalSales = $trader->sales->sum('TotalAmount');
                $paidAmount = $trader->sales->sum('PaidAmount');
                $remainingAmount = $trader->sales->sum('RemainingAmount');
                
                // Add payment amounts to paid amount
                $totalPaid = $paidAmount + $trader->payments->sum('Amount');
                
                // Calculate balance
                $balance = $totalSales - $totalPaid;
                
                // Add calculated values to trader object
                $trader->totalSales = $totalSales;
                $trader->totalPaid = $totalPaid;
                $trader->remainingAmount = $remainingAmount;
                $trader->balance = $balance;
                
                return $trader;
            });

        return Inertia::render('Traders/Index', [
            'traders' => $traders
        ]);
    }

    public function create()
    {
        return Inertia::render('Traders/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'TraderName' => ['required', 'string', 'max:255'],
            'Phone' => ['required', 'string', 'max:20', 'unique:traders', 'regex:/^[0-9+\s]+$/i'],
            'Address' => ['required', 'string', 'max:500'],
            'Balance' => ['nullable', 'numeric'],
            'TotalPayments' => ['nullable', 'numeric'],
            'IsActive' => ['boolean']
        ], [
            'Phone.regex' => 'رقم الهاتف يجب أن يحتوي على أرقام وعلامة + فقط',
            'Phone.unique' => 'رقم الهاتف موجود مسبقاً'
        ]);

        $validated['IsActive'] = $validated['IsActive'] ?? true;
        
        $trader = Trader::create($validated);
        return redirect()->route('traders.index')->with('success', 'تمت إضافة التاجر بنجاح');
    }

    public function show($id)
    {
        $trader = Trader::findOrFail($id);
        $trader->totalDebt = $trader->TotalSales - $trader->TotalPayments;

        return Inertia::render('Traders/Show', [
            'trader' => $trader
        ]);
    }

    public function edit($id)
    {
        $trader = Trader::findOrFail($id);
        $trader->totalDebt = $trader->TotalSales - $trader->TotalPayments;

        return Inertia::render('Traders/Edit', [
            'trader' => $trader
        ]);
    }

    public function update(Request $request, $id)
    {
        $trader = Trader::findOrFail($id);
        
        $validated = $request->validate([
            'TraderName' => ['required', 'string', 'max:255'],
            'Phone' => ['required', 'string', 'max:20', 'unique:traders,Phone,' . $id, 'regex:/^[0-9+\s]+$/i'],
            'Address' => ['required', 'string', 'max:500'],
            'Balance' => ['nullable', 'numeric'],
            'TotalPayments' => ['nullable', 'numeric'],
            'IsActive' => ['boolean']
        ], [
            'Phone.regex' => 'رقم الهاتف يجب أن يحتوي على أرقام وعلامة + فقط',
            'Phone.unique' => 'رقم الهاتف موجود مسبقاً'
        ]);

        $trader->update($validated);
        return redirect()->route('traders.index')->with('success', 'تم تحديث بيانات التاجر بنجاح');
    }

    public function destroy($id)
    {
        $trader = Trader::findOrFail($id);
        $trader->update(['IsActive' => 0]);
        return redirect()->route('traders.index')->with('success', 'تم تعطيل التاجر بنجاح');
    }

    private function calculateDebt($trader)
    {
        return $trader->TotalSales - $trader->TotalPayments;
    }
}
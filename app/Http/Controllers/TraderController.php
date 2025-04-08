<?php

namespace App\Http\Controllers;

use App\Models\Trader;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TraderController extends Controller
{
    public function index()
    {
        $traders = Trader::with([
            'sales.details.product', 
            'sales.payments', 
            'payments',
            'financials'
        ])
        ->get()
        ->map(function ($trader) {
            // Get the latest financial record
            $latestFinancial = $trader->financials
                ->sortByDesc('created_at')
                ->first();

            if ($latestFinancial) {
                $trader->balance = $latestFinancial->balance;
                $trader->total_sales = $latestFinancial->total_sales;
                $trader->total_payments = $latestFinancial->total_payments;
                $trader->remaining_amount = $latestFinancial->remaining_amount;
            } else {
                $trader->balance = 0;
                $trader->total_sales = 0;
                $trader->total_payments = 0;
                $trader->remaining_amount = 0;
            }

            $trader->recentSales = $trader->sales
                ->sortByDesc('SaleDate')
                ->take(5)
                ->map(function($sale) {
                    return [
                        'sale' => $sale,
                        'invoice_number' => $sale->InvoiceNumber,
                        'amount' => $sale->TotalAmount,
                        'date' => $sale->SaleDate,
                        'status' => $sale->Status,
                        'products' => $sale->details->map(function($detail) {
                            return [
                                'name' => $detail->product->ProductName,
                                'quantity' => $detail->Quantity,
                                'price' => $detail->UnitPrice
                            ];
                        })
                    ];
                });

            $trader->recentPayments = $trader->payments
                ->sortByDesc('PaymentDate')
                ->take(5)
                ->map(function($payment) {
                    return [
                        'amount' => $payment->Amount,
                        'date' => $payment->PaymentDate,
                        'description' => $payment->Description,
                        'sale_id' => $payment->SaleID
                    ];
                });

            return $trader;
        });

        return Inertia::render('Traders/Index', [
            'traders' => $traders,
            'loading' => false
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
        $trader = Trader::with([
            'sales' => function ($query) {
                $query->orderBy('SaleDate', 'desc')
                    ->with(['details' => function($query) {
                        $query->select(['SaleID', 'Quantity', 'UnitPrice', 'ProductID']);
                    }]);
            },
            'purchases' => function ($query) {
                $query->orderBy('PurchaseDate', 'desc')
                    ->with(['purchaseDetails' => function($query) {
                        $query->select(['PurchaseID', 'Quantity', 'UnitPrice', 'ProductID']);
                    }]);
            },
            'payments' => function ($query) {
                $query->orderBy('PaymentDate', 'desc');
            }
        ])->findOrFail($id);

        $totals = $trader->calculateTotals();
        return Inertia::render('Traders/Show', [
            'trader' => $trader,
            'totals' => $totals
        ]);
    }

    public function edit($id)
    {
        $trader = Trader::with(['sales', 'purchases', 'payments'])
            ->findOrFail($id);

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
}
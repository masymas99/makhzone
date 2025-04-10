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
                // Calculate totals directly from the database
                $totalSales = $trader->sales->sum('TotalAmount');
                $paidAmount = $trader->sales->sum('PaidAmount');
                $totalPayments = $paidAmount + $trader->payments->sum('Amount');
                
                // Calculate balance
                $balance = $totalSales - $totalPayments;
                
                // Update the trader's record with calculated values
                $trader->update([
                    'TotalSales' => $totalSales,
                    'TotalPayments' => $totalPayments,
                    'Balance' => $balance
                ]);

                // Add calculated values to trader object for display
                $trader->totalSales = $totalSales;
                $trader->totalPaid = $totalPayments;
                $trader->balance = $balance;
                $trader->remainingAmount = $totalSales - $totalPayments;

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
        $trader = Trader::with([
            'sales' => function($query) {
                $query->with('details');
            },
            'payments'
        ])->findOrFail($id);

        // Calculate totals
        $totalSales = $trader->sales->sum('TotalAmount');
        $totalPayments = $trader->payments->sum('Amount');
        
        // Calculate balance
        $balance = $totalSales - $totalPayments;

        return Inertia::render('Traders/Show', [
            'trader' => $trader,
            'balance' => $balance,
            'totals' => [
                'totalSales' => $totalSales,
                'totalPayments' => $totalPayments
            ]
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
        try {
            DB::beginTransaction();
            
            $trader = Trader::with(['sales', 'payments'])->findOrFail($id);
            
            // Delete all payments first
            $trader->payments()->delete();
            
            // Delete all sales and their details
            foreach ($trader->sales as $sale) {
                $sale->details()->delete();
                $sale->payments()->delete();
                $sale->delete();
            }
            
            // Delete the trader
            $trader->delete();
            
            DB::commit();
            return redirect()->route('traders.index')->with('success', 'تم حذف التاجر بنجاح');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'حدث خطأ أثناء حذف التاجر: ' . $e->getMessage());
        }
    }

    public function transactions($id)
    {
        $trader = Trader::with(['sales', 'payments'])->findOrFail($id);
        
        // Add type to sales
        $sales = $trader->sales->map(function ($sale) {
            $sale->type = 'sale';
            return $sale;
        });

        // Add type to payments
        $payments = $trader->payments->map(function ($payment) {
            $payment->type = 'payment';
            return $payment;
        });

        return Inertia::render('Traders/Transactions', [
            'trader' => $trader,
            'sales' => $sales,
            'payments' => $payments
        ]);
    }

    public function dashboard($id)
    {
        try {
            $trader = Trader::with([
                'sales' => function($query) {
                    $query->with('details')->orderBy('SaleDate', 'desc');
                },
                'payments' => function($query) {
                    $query->with('purchase')->orderBy('PaymentDate', 'desc');
                }
            ])->findOrFail($id);

            // Calculate statistics
            $stats = [
                'totalSales' => $trader->sales->sum('TotalAmount') ?? 0,
                'totalPayments' => $trader->payments->sum('Amount') ?? 0,
                'balance' => ($trader->sales->sum('TotalAmount') ?? 0) - ($trader->payments->sum('Amount') ?? 0),
                'pendingPayments' => $trader->payments->filter(function($payment) {
                    return $payment->Status !== 'confirmed';
                })->count(),
                'lastPayment' => $trader->payments->sortByDesc('PaymentDate')->first(),
                'salesByMonth' => $trader->sales->groupBy(function($sale) {
                    return $sale->SaleDate ? $sale->SaleDate->format('Y-m') : null;
                })->map(function($sales) {
                    return $sales->sum('TotalAmount');
                })->toArray(),
                'paymentsByMonth' => $trader->payments->groupBy(function($payment) {
                    return $payment->PaymentDate ? $payment->PaymentDate->format('Y-m') : null;
                })->map(function($payments) {
                    return $payments->sum('Amount');
                })->toArray()
            ];

            return Inertia::render('Traders/Dashboard', [
                'trader' => $trader,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'حدث خطأ أثناء تحميل البيانات');
        }
    }

    private function calculateDebt($trader)
    {
        return $trader->TotalSales - $trader->TotalPayments;
    }
}
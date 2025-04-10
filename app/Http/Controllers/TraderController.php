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
        $traders = Trader::with([
            'sales' => function($query) {
                $query->with('details');
            },
            'payments'
        ])->get();

        // Calculate totals and balance for each trader
        $traders = $traders->map(function($trader) {
            // Calculate total sales
            $trader->TotalSales = $trader->sales->sum('TotalAmount');
            
            // Calculate total payments (manual payments + paid invoices)
            $manualPayments = $trader->payments->sum('Amount');
            
            // Calculate total paid from invoices
            $totalPaidFromInvoices = $trader->sales->sum('PaidAmount');
            
            $trader->TotalPayments = $manualPayments + $totalPaidFromInvoices;
            
            // Calculate balance
            $trader->Balance = $trader->TotalPayments - $trader->TotalSales;
            
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
        return redirect()->route('traders.index')->with('success', 'تمت إضافة العميل بنجاح');
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
        
        // Calculate total payments (manual payments + paid invoices)
        $manualPayments = $trader->payments->sum('Amount');
        $totalPaidFromInvoices = $trader->sales->sum('PaidAmount');
        
        $totalPayments = $manualPayments + $totalPaidFromInvoices;
        
        // Calculate balance
        $balance = $totalPayments - $totalSales;

        return Inertia::render('Traders/Show', [
            'trader' => $trader,
            'balance' => $balance,
            'totals' => [
                'totalSales' => $totalSales,
                'totalPayments' => $totalPayments,
                'manualPayments' => $manualPayments,
                'paidInvoices' => $totalPaidFromInvoices
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
        return redirect()->route('traders.index')->with('success', 'تم تحديث بيانات العميل بنجاح');
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
            return redirect()->route('traders.index')->with('success', 'تم حذف العميل بنجاح');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'حدث خطأ أثناء حذف العميل: ' . $e->getMessage());
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
        $trader = Trader::with([
            'sales' => function($query) {
                $query->with('details')->orderBy('SaleDate', 'desc');
            },
            'payments' => function($query) {
                $query->orderBy('PaymentDate', 'desc');
            }
        ])->findOrFail($id);

        // Calculate statistics
        $totalSales = $trader->sales->sum('TotalAmount');
        
        // Calculate total payments (manual payments + paid invoices)
        $manualPayments = $trader->payments->sum('Amount');
        $totalPaidFromInvoices = $trader->sales->sum('PaidAmount');
        
        $totalPayments = $manualPayments + $totalPaidFromInvoices;
        
        // Calculate balance
        $balance = $totalPayments - $totalSales;

        // Calculate monthly data for chart
        $salesByMonth = $trader->sales->groupBy(function($sale) {
            return $sale->SaleDate ? $sale->SaleDate->format('Y-m') : null;
        })->map(function($sales) {
            return $sales->sum('TotalAmount');
        })->toArray();

        $paymentsByMonth = $trader->payments->groupBy(function($payment) {
            return $payment->PaymentDate ? $payment->PaymentDate->format('Y-m') : null;
        })->map(function($payments) {
            return $payments->sum('Amount');
        })->toArray();

        return Inertia::render('Traders/Dashboard', [
            'trader' => $trader,
            'stats' => [
                'totalSales' => $totalSales,
                'totalPayments' => $totalPayments,
                'manualPayments' => $manualPayments,
                'paidInvoices' => $totalPaidFromInvoices,
                'balance' => $balance,
                'pendingPayments' => $trader->payments->filter(function($payment) {
                    return $payment->Status !== 'confirmed';
                })->count(),
                'lastPayment' => $trader->payments->sortByDesc('PaymentDate')->first(),
                'salesByMonth' => $salesByMonth,
                'paymentsByMonth' => $paymentsByMonth
            ]
        ]);
    }

    private function calculateDebt($trader)
    {
        return $trader->TotalSales - $trader->TotalPayments;
    }
}
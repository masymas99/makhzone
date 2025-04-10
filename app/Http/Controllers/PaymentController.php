<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Trader;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function index()
    {
        $payments = $this->payment->with(['trader', 'sale'])->get();
        return Inertia::render('Payments/Index', ['payments' => $payments]);
    }

    public function create(Request $request)
    {
        $traderId = $request->query('trader_id');
        
        if (!$traderId) {
            return redirect()->back()->with('error', 'يجب تحديد العميل');
        }

        $trader = Trader::findOrFail($traderId);

        return Inertia::render('Payments/Create', [
            'trader' => $trader,
            'paymentMethods' => [
                'cash' => 'نقداً',
                'bank_transfer' => 'تحويل بنكي',
                'check' => 'شيك',
                'other' => 'طريقة أخرى'
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'trader_id' => 'required|exists:traders,TraderID',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
            'sale_id' => 'nullable|exists:sales,SaleID',
        ]);

        $trader = Trader::findOrFail($validated['trader_id']);

        // Update trader balance
        $trader->update([
            'Balance' => $trader->Balance - $validated['amount']
        ]);

        $payment = Payment::create([
            'TraderID' => $validated['trader_id'],
            'Amount' => $validated['amount'],
            'PaymentMethod' => $validated['payment_method'],
            'PaymentDate' => $validated['payment_date'],
            'Notes' => $validated['notes'],
            'Status' => 'confirmed',
            'SaleID' => $validated['sale_id'] ?? null,
        ]);

        return redirect()->route('traders.show', $trader->TraderID)
            ->with('success', 'تم إضافة الدفعة بنجاح');
    }

    public function show($id)
    {
        $payment = $this->payment->with(['trader', 'sale'])->findOrFail($id);
        return Inertia::render('Payments/Show', ['payment' => $payment]);
    }

    public function storeManual(Request $request, $trader)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
        ]);

        try {
            DB::beginTransaction();

            $trader = Trader::findOrFail($trader);
            
            // Create the payment
            $payment = $trader->payments()->create([
                'Amount' => $request->amount,
                'PaymentDate' => $request->payment_date,
                'SaleID' => null, // This is a manual payment, not linked to any sale
            ]);

            // Update trader's balance directly
            $trader->TotalPayments += $request->amount;
            $trader->Balance = $trader->TotalSales - $trader->TotalPayments;
            $trader->save();

            DB::commit();
            return redirect()->route('traders.index')->with('success', 'تم إضافة الدفعة بنجاح');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'حدث خطأ أثناء إضافة الدفعة: ' . $e->getMessage());
        }
    }
}
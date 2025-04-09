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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'TraderID' => 'required|exists:traders,TraderID',
            'Amount' => 'required|numeric|min:0',
            'PaymentDate' => 'required|date',
            'SaleID' => 'nullable|exists:sales,SaleID'
        ]);

        $payment = $this->payment->create($validated);
        return redirect()->route('payments.index');
    }

    public function show($id)
    {
        $payment = $this->payment->with(['trader', 'sale'])->findOrFail($id);
        return Inertia::render('Payments/Show', ['payment' => $payment]);
    }

    public function create($trader)
    {
        $trader = Trader::findOrFail($trader);
        return Inertia::render('Traders/AddPayment', [
            'trader' => $trader
        ]);
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
<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
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
}
<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Product;
use App\Models\Payment;
use App\Models\Trader;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    protected $sale;
    protected $saleDetail;

    public function __construct(Sale $sale, SaleDetail $saleDetail)
    {
        $this->sale = $sale;
        $this->saleDetail = $saleDetail;
    }

    public function index()
    {
        $sales = $this->sale->with(['trader', 'details.product'])->get();
        $traders = Trader::all();
        $products = Product::all();
        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'traders' => $traders,
            'products' => $products
        ]);
    }

    public function create()
    {
        $traders = Trader::all();
        $products = Product::all();

        return Inertia::render('Sales/Create', [
            'traders' => $traders,
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'TraderID' => ['required', 'exists:traders,TraderID'],
            'SaleDate' => ['required', 'date'],
            'SaleDetails' => ['required', 'array'],
            'PaymentAmount' => ['nullable', 'numeric', 'min:0'],
        ]);

        // Calculate total amount from sale details
        $totalAmount = 0;
        foreach ($validated['SaleDetails'] as $detail) {
            $totalAmount += $detail['Quantity'] * $detail['UnitPrice'];
        }

        // Create the sale
        $sale = Sale::create([
            'TraderID' => $validated['TraderID'],
            'SaleDate' => $validated['SaleDate'],
            'TotalAmount' => $totalAmount,
            'PaidAmount' => $validated['PaymentAmount'] ?? 0,
            'InvoiceNumber' => 'INV-' . Sale::max('SaleID') + 1,
            'Status' => $totalAmount == ($validated['PaymentAmount'] ?? 0) ? 'paid' : 'unpaid'
        ]);

        // Create sale details
        foreach ($validated['SaleDetails'] as $detail) {
            SaleDetail::create([
                'SaleID' => $sale->SaleID,
                'ProductID' => $detail['ProductID'],
                'Quantity' => $detail['Quantity'],
                'UnitPrice' => $detail['UnitPrice'],
            ]);
        }

        // If payment amount is provided and greater than 0, create a payment
        if ($validated['PaymentAmount'] ?? 0 > 0) {
            Payment::create([
                'TraderID' => $validated['TraderID'],
                'SaleID' => $sale->SaleID,
                'Amount' => $validated['PaymentAmount'],
                'PaymentDate' => now(),
                'Description' => 'دفع جزء من فاتورة البيع رقم ' . $sale->SaleID,
            ]);

            // Update the trader's total payments
            $trader = Trader::findOrFail($validated['TraderID']);
            $trader->TotalPayments += $validated['PaymentAmount'];
            $trader->save();
        }

        return redirect()->route('sales.index')->with('success', 'تم إضافة البيع بنجاح');
    }

    public function show($id)
    {
        $sale = $this->sale->with(['trader', 'details.product'])->findOrFail($id);
        return Inertia::render('Sales/Show', ['sale' => $sale]);
    }
}
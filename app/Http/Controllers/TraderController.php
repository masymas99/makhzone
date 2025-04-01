<?php

namespace App\Http\Controllers;

use App\Models\Trader;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TraderController extends Controller
{
    public function index()
    {
        $traders = Trader::where('IsActive', true)->get();
        return Inertia::render('Traders/Index', ['traders' => $traders]);
    }

    public function create()
    {
        return Inertia::render('Traders/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'TraderName' => 'required|string|max:255',
            'Phone' => 'required|string|max:20|regex:/^[0-9+\s]+$/',
            'Address' => 'required|string|max:500'
        ], [
            'Phone.regex' => 'رقم الهاتف يجب أن يحتوي على أرقام وعلامة + فقط'
        ]);

        Trader::create($validated);
        return redirect()->route('traders.index')->with('success', 'تمت إضافة التاجر بنجاح');
    }

    public function edit($id)
    {
        $trader = Trader::findOrFail($id);
        return Inertia::render('Traders/Edit', ['trader' => $trader]);
    }

    public function show($id)
    {
        $trader = $this->trader->findOrFail($id);
        return Inertia::render('Traders/Show', ['trader' => $trader]);
    }

    public function update(Request $request, Trader $trader)
    {
        $validated = $request->validate([
            'TraderName' => 'required|string|max:255',
            'Phone' => 'required|string|max:20|regex:/^[0-9+\s]+$/',
            'Address' => 'required|string|max:500',
            'IsActive' => 'sometimes|boolean'
        ]);

        $trader->update($validated);
        return redirect()->route('traders.index')->with('success', 'تم تحديث بيانات التاجر');
    }

    public function destroy($id)
    {
        $trader = $this->trader->findOrFail($id);
        $trader->update(['IsActive' => 0]);
        return redirect()->route('traders.index');
    }
}
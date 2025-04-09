<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::orderBy('ExpenseDate', 'desc')->get();
        return inertia('Expenses/Index', [
            'expenses' => $expenses
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ExpenseDate' => 'required|date',
            'Description' => 'required|string|max:255',
            'Amount' => 'required|numeric|min:0',
        ]);

        Expense::create($validated);

        return redirect()->back()->with('success', 'تم إضافة المصروف بنجاح');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return redirect()->back()->with('success', 'تم حذف المصروف بنجاح');
    }
}
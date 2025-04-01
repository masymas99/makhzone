<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    protected $expense;

    public function __construct(Expense $expense)
    {
        $this->expense = $expense;
    }

    public function index()
    {
        $expenses = $this->expense->latest()->get();
        return Inertia::render('Expenses/Index', ['expenses' => $expenses]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'description' => 'nullable|string|max:255'
        ]);

        $this->expense->create($validated);
        return redirect()->route('expenses.index');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'description' => 'nullable|string|max:255'
        ]);

        $expense = $this->expense->findOrFail($id);
        $expense->update($validated);
        return redirect()->route('expenses.index');
    }

    public function destroy($id)
    {
        $expense = $this->expense->findOrFail($id);
        $expense->delete();
        return redirect()->route('expenses.index');
    }
}
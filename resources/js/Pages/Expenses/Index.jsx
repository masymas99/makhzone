import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import AddExpense from './AddExpense';

export default function ExpensesIndex({ expenses }) {
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddExpense = () => {
        setShowAddForm(false);
    };

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.Amount, 0);
    const todayExpenses = expenses.filter(expense => new Date(expense.ExpenseDate).toDateString() === new Date().toDateString()).length;

    return (
        <>
            <Head title="المصروفات" />
            <Navbar />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">قائمة المصروفات</h2>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {showAddForm ? 'إلغاء' : 'إضافة مصروف'}
                            </button>
                        </div>

                        {showAddForm && (
                            <div className="mb-6">
                                <AddExpense onAdd={handleAddExpense} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">إجمالي المصروفات</h3>
                                <p className="text-2xl font-bold">{totalExpenses.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">المصروفات اليوم</h3>
                                <p className="text-2xl font-bold">{todayExpenses}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {expenses.map((expense) => (
                                        <tr key={expense.ExpenseID}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(expense.ExpenseDate).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {expense.Amount.toLocaleString('ar-EG')} ج.م
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {expense.Description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function ExpensesIndex() {
    const { expenses } = usePage().props;
    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const sortedExpenses = expenses.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a[sortField] > b[sortField] ? 1 : -1;
        } else {
            return a[sortField] < b[sortField] ? 1 : -1;
        }
    });

    const handleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const todayExpenses = expenses.filter(expense => new Date(expense.date).toDateString() === new Date().toDateString()).length;

    return (
        <>
            <Head title="المصروفات" />
            <Navbar />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">قائمة المصروفات</h2>
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
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('date')}>
                                            التاريخ {sortField === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('amount')}>
                                            المبلغ {sortField === 'amount' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3">التفاصيل</th>
                                        <th className="px-6 py-3">التصنيف</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedExpenses.map((expense) => (
                                        <tr key={expense.id} className="border-t">
                                            <td className="px-6 py-4">
                                                {new Date(expense.date).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {expense.amount.toLocaleString('ar-EG')} ج.م
                                            </td>
                                            <td className="px-6 py-4">{expense.details}</td>
                                            <td className="px-6 py-4">{expense.category}</td>
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
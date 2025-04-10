import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import AddExpense from './AddExpense';

export default function ExpensesIndex({ expenses }) {
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddExpense = () => {
        setShowAddForm(false);
    };

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, expense) => sum + (parseFloat(expense.Amount) || 0), 0).toLocaleString('ar-EG');
    }, [expenses]);

    const todayExpensesCount = useMemo(() => {
        const today = new Date().toDateString();
        return expenses.filter(expense => new Date(expense.ExpenseDate).toDateString() === today).length;
    }, [expenses]);

    return (
        <>
            <Head title="المصروفات" />
            <Navbar />
            <div className="py-12 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                        {/* العنوان والزر */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">المصروفات</h2>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                            >
                                {showAddForm ? 'إلغاء' : '+ إضافة مصروف'}
                            </button>
                        </div>

                        {/* الإجماليات */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl shadow-md">
                                <h3 className="text-gray-500 text-sm mb-3">إجمالي المصروفات</h3>
                                <div className="flex items-center justify-end">
                                    <span className="text-3xl font-bold text-indigo-600 ml-2">{totalExpenses}</span>
                                    <span className="text-xl font-medium text-gray-600">ج.م</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-md">
                                <h3 className="text-gray-500 text-sm mb-3">المصروفات اليوم</h3>
                                <p className="text-3xl font-bold text-purple-600 text-right">{todayExpensesCount}</p>
                            </div>
                        </div>

                        {/* قائمة المصروفات */}
                        {expenses.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-6 6l6-6M5 12h14M12 5v14" />
                                </svg>
                                لا توجد مصروفات مسجلة حاليًا
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {expenses.map((expense) => (
                                    <div
                                        key={expense.ExpenseID}
                                        className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm text-gray-500">
                                                {new Date(expense.ExpenseDate).toLocaleDateString('ar-EG')}
                                            </span>
                                            <span className="text-lg font-bold text-indigo-600">
                                                {parseFloat(expense.Amount).toLocaleString('ar-EG')} ج.م
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-base line-clamp-2" title={expense.Description}>
                                            {expense.Description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* المودال */}
                        {showAddForm && (
                            <div className="overflow-y-none fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                      
                                    </div>
                                    <div className="space-y-6 min-h-[600px]">
                                        <AddExpense onAdd={handleAddExpense} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
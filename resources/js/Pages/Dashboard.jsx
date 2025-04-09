import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function Dashboard({ 
    totalExpenses = 0, 
    totalPurchases = 0, 
    totalSales = 0, 
    totalProfit = 0, 
    totalDebts = 0,
    recentSales = [],
    recentExpenses = [],
    recentPurchases = []
}) {
    return (
        <>
            <Head title="لوحة التحكم" />
            <Navbar />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">لوحة التحكم</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">إجمالي المصروفات</h3>
                                <p className="text-2xl font-semibold">
                                    {totalExpenses.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">إجمالي المشتريات</h3>
                                <p className="text-2xl font-semibold">
                                    {totalPurchases.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">إجمالي المبيعات</h3>
                                <p className="text-2xl font-semibold">
                                    {totalSales.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">صافي الربح</h3>
                                <p className="text-2xl font-semibold">
                                    {totalProfit.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-4">المصروفات الأخيرة</h3>
                                <div className="space-y-4">
                                    {recentExpenses?.length > 0 ? (
                                        recentExpenses.map(expense => (
                                            <div key={expense.ExpenseID} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm">{expense.Description}</p>
                                                    <p className="text-xs text-gray-500">{new Date(expense.ExpenseDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <p className="text-sm font-medium">{expense.Amount.toLocaleString('ar-EG')} ج.م</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500">لا توجد مصروفات حديثة</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-4">المشتريات الأخيرة</h3>
                                <div className="space-y-4">
                                    {recentPurchases?.length > 0 ? (
                                        recentPurchases.map(purchase => (
                                            <div key={purchase.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm">{purchase.product_name}</p>
                                                    <p className="text-xs text-gray-500">{new Date(purchase.purchase_date).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <p className="text-sm font-medium">{purchase.total_cost.toLocaleString('ar-EG')} ج.م</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500">لا توجد مشتريات حديثة</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-gray-500 text-sm mb-4">إجمالي الديون</h3>
                            <div className="flex justify-between items-center">
                                <p className="text-2xl font-semibold">{totalDebts.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

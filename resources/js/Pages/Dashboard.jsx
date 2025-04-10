import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import Chart from 'react-apexcharts';

export default function Dashboard({
    totalProducts = 0,
    totalSales = 0,
    totalPurchases = 0,
    totalExpenses = 0,
    totalProfit = 0,
    productProfit = 0,
    totalTraders = 0,
    totalDebts = 0,
    recentSales = [],
    recentPurchases = [],
    recentExpenses = [],
    salesStats = [],
    purchaseStats = [],
}) {
    // مخطط المبيعات اليومية
    const dailySalesChart = {
        options: {
            chart: {
                type: 'line',
                toolbar: { show: false }
            },
            xaxis: {
                type: 'datetime',
                categories: salesStats.map(s => s.date),
                labels: {
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: 'MMM',
                        day: 'dd MMM',
                        hour: 'HH:mm'
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: function(value) {
                        return value.toLocaleString('ar-EG');
                    }
                }
            },
            colors: ['#4361ee'],
            fontFamily: 'Tajawal'
        },
        series: [{
            name: 'المبيعات',
            data: salesStats.map(s => s.amount)
        }]
    };

    // مخطط المشتريات الشهرية
    const monthlyPurchasesChart = {
        options: {
            chart: {
                type: 'bar',
                toolbar: { show: false }
            },
            xaxis: {
                categories: purchaseStats.map(p => p.month)
            },
            yaxis: {
                labels: {
                    formatter: function(value) {
                        return value.toLocaleString('ar-EG');
                    }
                }
            },
            colors: ['#4895ef'],
            fontFamily: 'Tajawal'
        },
        series: [{
            name: 'المشتريات',
            data: purchaseStats.map(p => p.amount)
        }]
    };

    return (
        <>
            <Head title="لوحة التحكم" />
            <Navbar />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">لوحة التحكم</h2>

                        {/* إحصائيات عامة */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">إجمالي المنتجات</h3>
                                <p className="text-2xl font-semibold">
                                    {totalProducts.toLocaleString('ar-EG')} منتج
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">إجمالي المبيعات</h3>
                                <p className="text-2xl font-semibold">
                                    {totalSales.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">إجمالي المشتريات</h3>
                                <p className="text-2xl font-semibold">
                                    {totalPurchases.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">إجمالي المصروفات</h3>
                                <p className="text-2xl font-semibold">
                                    {totalExpenses.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">صافي أرباح المنتجات</h3>
                                <p className="text-2xl font-semibold">
                                    {productProfit.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">صافي الربح</h3>
                                <p className="text-2xl font-semibold">
                                    {totalProfit.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">إجمالي التجار</h3>
                                <p className="text-2xl font-semibold">
                                    {totalTraders.toLocaleString('ar-EG')} تاجر
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-2">إجمالي الديون</h3>
                                <p className="text-2xl font-semibold">
                                    {totalDebts.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                        </div>

                        {/* المخططات الرئيسية */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold mb-4">المبيعات اليومية</h3>
                                <Chart
                                    options={dailySalesChart.options}
                                    series={dailySalesChart.series}
                                    type="line"
                                    height={300}
                                />
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold mb-4">المشتريات الشهرية</h3>
                                <Chart
                                    options={monthlyPurchasesChart.options}
                                    series={monthlyPurchasesChart.series}
                                    type="bar"
                                    height={300}
                                />
                            </div>
                        </div>

                        {/* آخر العمليات */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-4">المبيعات الأخيرة</h3>
                                <div className="space-y-4">
                                    {recentSales?.length ? (
                                        recentSales.map(sale => (
                                            <div key={sale.SaleID} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm">{sale.InvoiceNumber ? `فاتورة رقم ${sale.InvoiceNumber}` : `فاتورة رقم ${sale.SaleID}`}</p>
                                                    <p className="text-xs text-gray-500">{new Date(sale.SaleDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {sale.TotalAmount ? sale.TotalAmount.toLocaleString('ar-EG') : '0'} ج.م
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500">لا توجد مبيعات حديثة</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-4">المشتريات الأخيرة</h3>
                                <div className="space-y-4">
                                    {recentPurchases?.length ? (
                                        recentPurchases.map(purchase => (
                                            <div key={purchase.PurchaseID} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm">{purchase.BatchNumber ? `دفعة رقم ${purchase.BatchNumber}` : `دفعة رقم ${purchase.PurchaseID}`}</p>
                                                    <p className="text-xs text-gray-500">{new Date(purchase.PurchaseDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {purchase.TotalAmount ? purchase.TotalAmount.toLocaleString('ar-EG') : '0'} ج.م
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500">لا توجد مشتريات حديثة</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm mb-4">المصروفات الأخيرة</h3>
                                <div className="space-y-4">
                                    {recentExpenses?.length ? (
                                        recentExpenses.map(expense => (
                                            <div key={expense.ExpenseID} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm">{expense.Description ? expense.Description : `مصروف رقم ${expense.ExpenseID}`}</p>
                                                    <p className="text-xs text-gray-500">{new Date(expense.ExpenseDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {expense.Amount ? expense.Amount.toLocaleString('ar-EG') : '0'} ج.م
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500">لا توجد مصروفات حديثة</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

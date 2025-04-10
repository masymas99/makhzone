import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import Chart from 'react-apexcharts';
import { FaBox, FaShoppingCart, FaMoneyBillWave, FaChartLine, FaUsers, FaCoins, FaChartBar } from 'react-icons/fa';

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
                toolbar: { show: false },
                animations: { enabled: true, easing: 'easeinout', speed: 800 },
            },
            xaxis: {
                type: 'datetime',
                categories: salesStats.map(s => s.date),
                labels: {
                    style: { colors: '#6b7280', fontSize: '12px' },
                    datetimeFormatter: { year: 'yyyy', month: 'MMM', day: 'dd MMM', hour: 'HH:mm' },
                },
            },
            yaxis: {
                labels: {
                    formatter: function(value) { return value.toLocaleString('ar-EG'); },
                    style: { colors: '#6b7280', fontSize: '12px' },
                },
            },
            colors: ['#4f46e5'],
            stroke: { curve: 'smooth', width: 3 },
            grid: { borderColor: '#e5e7eb' },
            tooltip: { theme: 'light' },
            fontFamily: 'Tajawal',
        },
        series: [{ name: 'المبيعات', data: salesStats.map(s => s.amount) }],
    };

    // مخطط المشتريات الشهرية
    const monthlyPurchasesChart = {
        options: {
            chart: {
                type: 'bar',
                toolbar: { show: false },
                animations: { enabled: true, easing: 'easeinout', speed: 800 },
            },
            xaxis: {
                categories: purchaseStats.map(p => p.month),
                labels: { style: { colors: '#6b7280', fontSize: '12px' } },
            },
            yaxis: {
                labels: {
                    formatter: function(value) { return value.toLocaleString('ar-EG'); },
                    style: { colors: '#6b7280', fontSize: '12px' },
                },
            },
            colors: ['#3b82f6'],
            dataLabels: { enabled: false },
            grid: { borderColor: '#e5e7eb' },
            tooltip: { theme: 'light' },
            fontFamily: 'Tajawal',
        },
        series: [{ name: 'المشتريات', data: purchaseStats.map(p => p.amount) }],
    };

    return (
        <>
            <Head title="لوحة التحكم" />
            <Navbar />
            <div className="min-h-screen bg-gray-100 py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                            <FaChartLine className="text-indigo-600" /> لوحة التحكم
                        </h2>

                        {/* إحصائيات عامة */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-md text-white transform hover:scale-105 transition-all duration-300">
                                <FaBox className="text-3xl mb-3" />
                                <h3 className="text-sm font-medium opacity-80">إجمالي المنتجات</h3>
                                <p className="text-2xl font-bold">{totalProducts.toLocaleString('ar-EG')} منتج</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-md text-white transform hover:scale-105 transition-all duration-300">
                                <FaShoppingCart className="text-3xl mb-3" />
                                <h3 className="text-sm font-medium opacity-80">إجمالي المبيعات</h3>
                                <p className="text-2xl font-bold">{totalSales.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-md text-white transform hover:scale-105 transition-all duration-300">
                                <FaMoneyBillWave className="text-3xl mb-3" />
                                <h3 className="text-sm font-medium opacity-80">إجمالي المشتريات</h3>
                                <p className="text-2xl font-bold">{totalPurchases.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-md text-white transform hover:scale-105 transition-all duration-300">
                                <FaCoins className="text-3xl mb-3" />
                                <h3 className="text-sm font-medium opacity-80">إجمالي المصروفات</h3>
                                <p className="text-2xl font-bold">{totalExpenses.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-xl shadow-md text-white transform hover:scale-105 transition-all duration-300">
                                <FaChartBar className="text-3xl mb-3" />
                                <h3 className="text-sm font-medium opacity-80">صافي أرباح المنتجات</h3>
                                <p className="text-2xl font-bold">{productProfit.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-md text-white transform hover:scale-105 transition-all duration-300">
                                <FaChartLine className="text-3xl mb-3" />
                                <h3 className="text-sm font-medium opacity-80">صافي الربح</h3>
                                <p className="text-2xl font-bold">{totalProfit.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-md text-white transform hover:scale-105 transition-all duration-300">
                                <FaUsers className="text-3xl mb-3" />
                                <h3 className="text-sm font-medium opacity-80">إجمالي العملاء</h3>
                                <p className="text-2xl font-bold">{totalTraders.toLocaleString('ar-EG')} عميل</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-md text-white transform hover:scale-105 transition-all duration-300">
                                <FaCoins className="text-3xl mb-3" />
                                <h3 className="text-sm font-medium opacity-80">إجمالي الديون</h3>
                                <p className="text-2xl font-bold">{totalDebts.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                        </div>

                        {/* المخططات الرئيسية */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaChartLine className="text-indigo-600" /> المبيعات اليومية
                                </h3>
                                <Chart
                                    options={dailySalesChart.options}
                                    series={dailySalesChart.series}
                                    type="line"
                                    height={300}
                                />
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaChartBar className="text-blue-600" /> المشتريات الشهرية
                                </h3>
                                <Chart
                                    options={monthlyPurchasesChart.options}
                                    series={monthlyPurchasesChart.series}
                                    type="bar"
                                    height={300}
                                />
                            </div>
                        </div>

                        {/* آخر العمليات */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaShoppingCart className="text-green-600" /> المبيعات الأخيرة
                                </h3>
                                <div className="space-y-4">
                                    {recentSales?.length ? (
                                        recentSales.map(sale => (
                                            <div key={sale.SaleID} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {sale.InvoiceNumber ? `فاتورة #${sale.InvoiceNumber}` : `فاتورة #${sale.SaleID}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{new Date(sale.SaleDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-green-600">
                                                    {sale.TotalAmount ? sale.TotalAmount.toLocaleString('ar-EG') : '0'} ج.م
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">لا توجد مبيعات حديثة</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-blue-600" /> المشتريات الأخيرة
                                </h3>
                                <div className="space-y-4">
                                    {recentPurchases?.length ? (
                                        recentPurchases.map(purchase => (
                                            <div key={purchase.PurchaseID} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {purchase.BatchNumber ? `دفعة #${purchase.BatchNumber}` : `دفعة #${purchase.PurchaseID}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{new Date(purchase.PurchaseDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-blue-600">
                                                    {purchase.TotalAmount ? purchase.TotalAmount.toLocaleString('ar-EG') : '0'} ج.م
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">لا توجد مشتريات حديثة</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaCoins className="text-red-600" /> المصروفات الأخيرة
                                </h3>
                                <div className="space-y-4">
                                    {recentExpenses?.length ? (
                                        recentExpenses.map(expense => (
                                            <div key={expense.ExpenseID} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {expense.Description ? expense.Description : `مصروف #${expense.ExpenseID}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{new Date(expense.ExpenseDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-red-600">
                                                    {expense.Amount ? expense.Amount.toLocaleString('ar-EG') : '0'} ج.م
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">لا توجد مصروفات حديثة</p>
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
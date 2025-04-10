import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';

export default function Show() {
    const { trader, balance, totals } = usePage().props;

    return (
        <Layout>
            <Head title={`تفاصيل التاجر - ${trader.TraderName}`} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{trader.TraderName}</h1>
                        <p className="text-gray-600">الرصيد الحالي: {balance.toLocaleString()} ج.م</p>
                    </div>
                    <Link
                        href="/traders"
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        الرجوع للقائمة
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Trader Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">معلومات التاجر</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">الاسم</label>
                                <p className="mt-1 text-gray-900">{trader.TraderName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                                <p className="mt-1 text-gray-900">{trader.Phone}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">العنوان</label>
                                <p className="mt-1 text-gray-900">{trader.Address}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">الحالة</label>
                                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    trader.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {trader.IsActive ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">المعلومات المالية</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">الحساب</h3>
                                <p><strong>الرصيد الحالي:</strong> {balance.toLocaleString()} ج.م</p>
                                <p><strong>المبيعات الإجمالية:</strong> {totals.totalSales.toLocaleString()} ج.م</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">الحركة المالية</h3>
                                <table className="w-full border">
                                    <thead>
                                        <tr>
                                            <th className="border p-2">التاريخ</th>
                                            <th className="border p-2">نوع المعاملة</th>
                                            <th className="border p-2">المبلغ</th>
                                            <th className="border p-2">الوصف</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trader.financials.map((financial) => (
                                            <tr key={financial.id}>
                                                <td className="border p-2">{new Date(financial.created_at).toLocaleDateString('ar-EG')}</td>
                                                <td className="border p-2">{financial.transaction_type}</td>
                                                <td className="border p-2" style={{ color: financial.transaction_type === 'credit' ? 'green' : 'red' }}>
                                                    {financial.transaction_type === 'credit' ? '+' : '-'} {financial.payment_amount || financial.sale_amount}
                                                </td>
                                                <td className="border p-2">{financial.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Details */}
                <div className="bg-white rounded-lg shadow p-6 mt-8">
                    <h2 className="text-xl font-bold mb-4">تفاصيل المبيعات</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">المنتجات</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {trader.sales?.map((sale) => (
                                    <tr key={sale.SaleID}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sale.SaleDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sale.TotalAmount.toLocaleString()} ج.م
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sale.details?.map(detail => (
                                                <div key={detail.ProductID}>
                                                    {detail.product?.ProductName}: {detail.Quantity} × {detail.UnitPrice?.toLocaleString() || '0'} ج.م
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/sales/${sale.SaleID}`} className="text-blue-600 hover:text-blue-900">
                                                عرض التفاصيل
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Purchases Details */}
                <div className="bg-white rounded-lg shadow p-6 mt-8">
                    <h2 className="text-xl font-bold mb-4">تفاصيل المشتريات</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">المنتجات</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {trader.purchases?.map((purchase) => (
                                    <tr key={purchase.PurchaseID}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {purchase.PurchaseDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {purchase.TotalAmount.toLocaleString()} ج.م
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {purchase.purchaseDetails?.map(detail => (
                                                <div key={detail.PurchaseID}>
                                                    {detail.ProductName}: {detail.Quantity} × {detail.UnitPrice.toLocaleString()} ج.م
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/purchases/${purchase.PurchaseID}`} className="text-blue-600 hover:text-blue-900">
                                                عرض التفاصيل
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payments Details */}
                <div className="bg-white rounded-lg shadow p-6 mt-8">
                    <h2 className="text-xl font-bold mb-4">تفاصيل المدفوعات</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">نوع الدفع</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">الملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {trader.payments?.map((payment) => (
                                    <tr key={payment.PaymentID}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.PaymentDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.Amount.toLocaleString()} ج.م
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.PaymentMethod || 'نقداً'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.Notes || 'لا توجد ملاحظات'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

Show.layout = Layout

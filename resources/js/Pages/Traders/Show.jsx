import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function Show() {
    const { trader, balance, totals } = usePage().props;

    if (!trader) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">جاري تحميل البيانات...</h1>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate additional metrics
    const totalSales = totals?.totalSales || 0;
    const totalPayments = totals?.totalPayments || 0;
    const pendingPayments = trader.payments?.filter(p => p.Status !== 'confirmed').length || 0;

    return (
        <div className="min-h-screen bg-gray-100 ">
            <Navbar />
            <Head title={`تفاصيل التاجر - ${trader.TraderName}`} />

            <div className="container mx-auto px-4 py-8 mt-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{trader.TraderName}</h1>
                        <div className="flex items-center gap-4">
                            <p className="text-gray-600">الرصيد الحالي: {balance.toLocaleString()} ج.م</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {balance >= 0 ? 'رصيد إيجابي' : 'رصيد سلبي'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/traders"
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            الرجوع للقائمة
                        </Link>
                        <Link
                            href={`/payments/create?trader_id=${trader.TraderID}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            إضافة دفعة يدوية
                        </Link>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">معلومات التاجر</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">الاسم</label>
                                <p className="mt-1 text-gray-900">{trader.TraderName}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                                <p className="mt-1 text-gray-900">{trader.Phone}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">العنوان</label>
                                <p className="mt-1 text-gray-900">{trader.Address}</p>
                            </div>
                        </div>
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">الحالة</label>
                                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    trader.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {trader.IsActive ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">تاريخ الإنشاء</label>
                                <p className="mt-1 text-gray-900">
                                    {new Date(trader.CreatedAt).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">آخر تحديث</label>
                                <p className="mt-1 text-gray-900">
                                    {new Date(trader.UpdatedAt).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">المجمل</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>إجمالي المبيعات</span>
                                <span className="font-bold text-green-600">
                                    {totalSales.toLocaleString()} ج.م
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>إجمالي المدفوعات</span>
                                <span className="font-bold text-blue-600">
                                    {totalPayments.toLocaleString()} ج.م
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>المبلغ المستحق</span>
                                <span className={`font-bold ${
                                    balance >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {balance.toLocaleString()} ج.م
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">المدفوعات</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>إجمالي المدفوعات</span>
                                <span className="font-bold text-blue-600">
                                    {totalPayments.toLocaleString()} ج.م
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>المدفوعات المعلقة</span>
                                <span className="font-bold text-orange-600">
                                    {pendingPayments} مدفوعات
                                </span>
                            </div>
                            {trader.payments?.length > 0 && (
                                <div className="flex justify-between items-center">
                                    <span>آخر دفعة</span>
                                    <span className="font-bold text-gray-600">
                                        {new Date(trader.payments[0].PaymentDate).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sales History */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">تاريخ المبيعات</h2>
                    <p className="text-gray-600 mb-4">
                        إجمالي المبيعات: {trader.sales?.length || 0} مبيعات
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ الإجمالي</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trader.sales?.map((sale) => (
                                    <tr key={sale.SaleID}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(sale.SaleDate).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sale.TotalAmount.toLocaleString()} ج.م
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                sale.Status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {sale.Status === 'confirmed' ? 'مؤكد' : 'قيد التأكيد'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link 
                                                href={`/sales/${sale.SaleID}`} 
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                عرض التفاصيل
                                            </Link>
                                        </td>
                                    </tr>
                                )) || (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-500">
                                            لا توجد مبيعات حتى الآن
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment History */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">تاريخ المدفوعات</h2>
                    <p className="text-gray-600 mb-4">
                        إجمالي المدفوعات: {trader.payments?.length || 0} مدفوعات
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">طريقة الدفع</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">حالة الدفع</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبيعات المرتبطة</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trader.payments?.map((payment) => (
                                    <tr key={payment.PaymentID}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(payment.PaymentDate).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.Amount.toLocaleString()} ج.م
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.PaymentMethod || 'نقداً'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                payment.Status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {payment.Status === 'confirmed' ? 'مؤكد' : 'قيد التأكيد'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.SaleID ? (
                                                <Link 
                                                    href={`/sales/${payment.SaleID}`} 
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    مبيعات #{payment.SaleID}
                                                </Link>
                                            ) : 'لا توجد مبيعات مرتبطة'}
                                        </td>
                                    </tr>
                                )) || (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">
                                            لا توجد مدفوعات حتى الآن
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

Show.layout = null;

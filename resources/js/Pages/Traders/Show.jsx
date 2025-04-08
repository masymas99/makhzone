import { Head } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import Layout from '@/Layouts/Layout'

export default function Show({ trader, balance, totals }) {
    return (
        <Layout>
            <Head title={`تفاصيل التاجر - ${trader.TraderName}`} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{trader.TraderName}</h1>
                        <p className="text-gray-600">الرصيد الحالي: {balance.toLocaleString()} ر.س</p>
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
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <h3 className="text-blue-600 font-bold mb-2">المبيعات</h3>
                                <p className="text-2xl">{totals.totalSales.toLocaleString()} ر.س</p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg">
                                <h3 className="text-green-600 font-bold mb-2">المشتريات</h3>
                                <p className="text-2xl">{totals.totalPurchases.toLocaleString()} ر.س</p>
                            </div>
                            <div className="bg-red-100 p-4 rounded-lg">
                                <h3 className="text-red-600 font-bold mb-2">المدفوعات</h3>
                                <p className="text-2xl">{totals.totalPayments.toLocaleString()} ر.ص</p>
                            </div>
                            <div className={`bg-${totals.balance > 0 ? 'red' : totals.balance < 0 ? 'blue' : 'green'}-100 p-4 rounded-lg`}>
                                <h3 className={`${totals.balance > 0 ? 'text-red' : totals.balance < 0 ? 'text-blue' : 'text-green'}-600 font-bold mb-2`}>
                                    {totals.balance > 0 ? 'مستحق عليه' : totals.balance < 0 ? 'مستحق له' : 'متوازن'}
                                </h3>
                                <p className="text-2xl">{totals.balance.toLocaleString()} ر.س</p>
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
                                            {sale.TotalAmount.toLocaleString()} ر.س
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sale.details?.map(detail => (
                                                <div key={detail.ProductID}>
                                                    {detail.product?.ProductName}: {detail.Quantity} × {detail.UnitPrice?.toLocaleString() || '0'} ر.س
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
                                            {purchase.TotalAmount.toLocaleString()} ر.س
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {purchase.purchaseDetails?.map(detail => (
                                                <div key={detail.PurchaseID}>
                                                    {detail.ProductName}: {detail.Quantity} × {detail.UnitPrice.toLocaleString()} ر.س
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
                                            {payment.Amount.toLocaleString()} ر.س
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

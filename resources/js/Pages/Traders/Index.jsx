import { Head, usePage } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import Layout from '@/Layouts/Layout'
import { Inertia } from '@inertiajs/inertia'
import Navbar from '@/Shared/Navbar'

export default function Index({ traders, loading }) {
    // Check if there are any traders
    const hasTraders = traders && traders.length > 0

    return (
        <div>
            <Head title="التجار" />
            <Navbar />
            <div className="container mx-auto px-4 py-8 mt-20">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">التجار</h1>
                    <Link 
                        href={route('traders.create')} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        إضافة تاجر جديد
                    </Link>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">جاري التحميل...</p>
                    </div>
                ) : (
                    <>
                        {/* No traders state */}
                        {!hasTraders && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">لا توجد تجار مسجلين حالياً</p>
                            </div>
                        )}

                        {/* Traders list */}
                        {hasTraders && (
                            <div className="space-y-6">
                                {traders.map((trader) => (
                                    <div key={trader.TraderID} className="bg-white rounded-lg shadow p-6">
                                        {/* Trader Header */}
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold">{trader.TraderName}</h2>
                                                <p className="text-gray-600">{trader.Phone}</p>
                                                <p className="text-gray-600">{trader.Address}</p>
                                            </div>
                                            <div className="flex space-x-4">
                                                {/* Status Badge */}
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    trader.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {trader.IsActive ? 'نشط' : 'غير نشط'}
                                                </span>
                                                {/* Financial Status Badge */}
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    trader.balance > 0 ? 'bg-red-100 text-red-800' : 
                                                    trader.balance < 0 ? 'bg-blue-100 text-blue-800' : 
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {trader.financialStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Account Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-500">المبيعات الإجمالية</h3>
                                                <p className="text-xl font-bold">{trader.totalSales?.toLocaleString() || '0'} ر.س</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-500">المشتريات الإجمالية</h3>
                                                <p className="text-xl font-bold">{trader.totalPurchases?.toLocaleString() || '0'} ر.س</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-500">المدفوعات الإجمالية</h3>
                                                <p className="text-xl font-bold">{trader.totalPayments?.toLocaleString() || '0'} ر.س</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-500">الرصيد</h3>
                                                <p className={`text-xl font-bold ${
                                                    trader.balance > 0 ? 'text-red-600' : 
                                                    trader.balance < 0 ? 'text-blue-600' : 
                                                    'text-green-600'
                                                }`}>
                                                    {trader.balance?.toLocaleString() || '0'} ر.س
                                                </p>
                                            </div>
                                        </div>

                                        {/* Recent Sales */}
                                        <div className="mt-4">
                                            <h3 className="text-lg font-medium mb-2">آخر المبيعات</h3>
                                            {trader.recentSales && trader.recentSales.length > 0 ? (
                                                trader.recentSales.map((saleData, index) => (
                                                    <div key={index} className="flex items-center justify-between border-b border-gray-200 py-2">
                                                        <div>
                                                            <div className="text-sm text-gray-600">
                                                                رقم الفاتورة: {saleData.invoice_number}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                التاريخ: {new Date(saleData.date).toLocaleDateString('ar-SA')}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                المبلغ: {saleData.amount?.toLocaleString() || '0'} ر.س
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                الحالة: <span className={`px-2 py-1 rounded ${
                                                                    saleData.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {saleData.status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col space-y-1">
                                                            {(saleData.products || []).map((product, pIndex) => (
                                                                <div key={pIndex} className="text-sm text-gray-600">
                                                                    {product.name || 'غير معروف'} x {product.quantity || 0} = {product.price?.toLocaleString() || '0'} ر.س
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    لا توجد مبيعات حالية
                                                </div>
                                            )}
                                        </div>

                                        {/* Recent Payments */}
                                        <div className="mt-4">
                                            <h3 className="text-lg font-medium mb-2">آخر الدفعات</h3>
                                            {trader.recentPayments && trader.recentPayments.length > 0 ? (
                                                trader.recentPayments.map((payment, index) => (
                                                    <div key={index} className="flex items-center justify-between border-b border-gray-200 py-2">
                                                        <div>
                                                            <div className="text-sm text-gray-600">
                                                                التاريخ: {new Date(payment.date).toLocaleDateString('ar-SA')}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                المبلغ: {payment.amount?.toLocaleString() || '0'} ر.س
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                الوصف: {payment.description || 'لا يوجد وصف'}
                                                            </div>
                                                            {payment.sale_id && (
                                                                <div className="text-sm text-gray-600">
                                                                    رقم الفاتورة: {payment.sale_id}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    لا توجد دفعات حالية
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 flex justify-end space-x-2">
                                            <Link 
                                                href={route('traders.show', trader.TraderID)} 
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                عرض التفاصيل
                                            </Link>
                                            <Link 
                                                href={route('traders.edit', trader.TraderID)} 
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                تعديل
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (confirm('هل أنت متأكد من تعطيل هذا التاجر؟')) {
                                                        Inertia.delete(route('traders.destroy', trader.TraderID))
                                                    }
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                تعطيل
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

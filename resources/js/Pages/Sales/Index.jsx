import React from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import { FaTrash } from 'react-icons/fa';

export default function Index() {
    const { props } = usePage();
    const { sales, filters } = props;
    const [confirmDelete, setConfirmDelete] = React.useState(null);
    const { delete: deleteForm } = useForm();

    const handleDelete = async (saleId) => {
        if (confirmDelete === saleId) {
            try {
                setConfirmDelete(null);
                await deleteForm(`/sales/${saleId}`);
                window.dispatchEvent(new Event('refresh'));
            } catch (error) {
                console.error('Error deleting sale:', error);
                window.dispatchEvent(new Event('error'));
            }
        } else {
            setConfirmDelete(saleId);
        }
    };

    return (
        <div className="min-h-screen mt-12 bg-gray-100">
            <Navbar />
            <Head title="الفواتير المباعة" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">الفواتير المباعة</h1>
                    <Link
                        href={route('sales.create')}
                        className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                    >
                        + إنشاء فاتورة جديدة
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {sales?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sales.map((sale) => (
                                <div
                                    key={sale.SaleID}
                                    className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                                >
                                    <div key={sale.SaleID} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {sale.InvoiceNumber ? `فاتورة #${sale.InvoiceNumber}` : `فاتورة #${sale.SaleID}`}
                                            </p>
                                            <p className="text-xs text-gray-500">{new Date(sale.SaleDate).toLocaleDateString('ar-EG')}</p>
                                            <div className="mt-2 space-y-1">
                                                {sale.details?.map((detail, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-600">{detail.product?.ProductName || 'منتج غير معرف'}</span>
                                                        <span className="text-sm text-gray-600">×</span>
                                                        <span className="text-sm text-gray-600">{detail.Quantity || 0}</span>
                                                        <span className="text-sm text-gray-600">×</span>
                                                        <span className="text-sm font-medium text-green-600">
                                                            {detail.UnitPrice ? detail.UnitPrice.toLocaleString('ar-EG') : '0'} ج.م
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-green-600">
                                            {sale.TotalAmount ? sale.TotalAmount.toLocaleString('ar-EG') : '0'} ج.م
                                        </p>
                                    </div>
                                    <div className="text-gray-700 text-base mb-2">
                                        <p>التاجر: {sale.trader.TraderName}</p>
                                        <p>الإجمالي: {sale.TotalAmount} ج.م</p>
                                        <p>المدفوع: {sale.PaidAmount} ج.م</p>
                                        <p style={{ color: sale.RemainingAmount > 0 ? 'red' : 'green' }}>
                                            المتبقي: {sale.RemainingAmount} ج.م
                                        </p>
                                        <p>الحالة: {sale.Status}</p>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            href={route('sales.edit', sale.SaleID)}
                                            className="text-yellow-600 hover:text-yellow-800 p-1"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(sale.SaleID)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                        >
                                            <FaTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-6 6l6-6M5 12h14M12 5v14" />
                            </svg>
                            لا توجد فواتير حتى الآن
                        </div>
                    )}
                </div>

                {/* مودال تأكيد الحذف */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="text-gray-500 hover:text-gray-700 text-xl font-bold focus:outline-none"
                                >
                                    ×
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6 text-center">هل أنت متأكد من حذف هذه الفاتورة؟</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDelete)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-all duration-200"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = null;
import React, { useState } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function PurchasesIndex() {
    const { purchases } = usePage().props;
    const [sortField, setSortField] = useState('purchase_date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const deleteForm = useForm({});

    const handleDelete = (id) => {
        setDeleteId(id);
        setConfirmDelete(true);
    };

    const confirmDeletePurchase = () => {
        deleteForm.delete(route('purchases.destroy', deleteId));
        setConfirmDelete(false);
        setDeleteId(null);
    };

    const cancelDelete = () => {
        setConfirmDelete(false);
        setDeleteId(null);
    };

    if (!purchases) {
        return <div className="text-center py-8 text-gray-500">جاري التحميل...</div>;
    }

    const sortedPurchases = [...purchases].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a[sortField] > b[sortField] ? 1 : -1;
        } else {
            return a[sortField] < b[sortField] ? 1 : -1;
        }
    });

    const totalPurchases = purchases.reduce((sum, purchase) => 
        sum + (purchase?.total_amount ? parseFloat(purchase.total_amount) : 0), 
        0
    ).toFixed(2);

    const todayPurchases = purchases.filter(purchase => 
        purchase?.purchase_date && 
        new Date(purchase.purchase_date).toDateString() === new Date().toDateString()
    ).length;

    return (
        <>
            <Head title="المشتريات" />
            <Navbar />
            <div className="py-12 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                        {/* العنوان والزر */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">المشتريات</h2>
                            <Link
                                href={route('purchases.create')}
                                className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                            >
                                + إضافة مشتريات جديدة
                            </Link>
                        </div>

                        {/* الإجماليات */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl shadow-md">
                                <h3 className="text-gray-500 text-sm mb-3">إجمالي المشتريات</h3>
                                <div className="flex items-center justify-end">
                                    <span className="text-3xl font-bold text-indigo-600 ml-2">{parseFloat(totalPurchases).toLocaleString('ar-EG')}</span>
                                    <span className="text-xl font-medium text-gray-600">ج.م</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-md">
                                <h3 className="text-gray-500 text-sm mb-3">المشتريات اليوم</h3>
                                <p className="text-3xl font-bold text-purple-600 text-right">{todayPurchases}</p>
                            </div>
                        </div>

                        {/* قائمة المشتريات */}
                        {sortedPurchases.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-6 6l6-6M5 12h14M12 5v14M12 5v14M12 5v14" />
                                </svg>
                                لا توجد مشتريات مسجلة حاليًا
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedPurchases.map((purchase) => (
                                    console.log(purchase),
                                    <div
                                        key={purchase.id}
                                        className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm text-gray-500">
                                                {purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('ar-EG') : '---'}
                                            </span>
                                            <span className="text-lg font-bold text-indigo-600">
                                                {parseFloat(purchase.total_amount).toLocaleString('ar-EG')} ج.م
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-base mb-2">#{purchase.id} - {purchase.supplier_name || '---'}</p>
                                        <div className="text-sm text-gray-600 mb-3">
                                            <p>رقم الدفعة: {purchase.batch_number || '---'}</p>
                                            <p className="line-clamp-1" title={purchase.notes}>ملاحظات: {purchase.notes || 'لا توجد ملاحظات'}</p>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {purchase.details?.map((detail, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-600">
                                                        {detail.product_name || 'منتج غير معرف'}
                                                    </span>
                                                    <span className="text-sm text-gray-600">×</span>
                                                    <span className="text-sm text-gray-600">
                                                        {detail.quantity || 0}
                                                    </span>
                                                    <span className="text-sm text-gray-600">×</span>
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {detail.unit_cost ? detail.unit_cost.toLocaleString('ar-EG') : '0'} ج.م
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Link
                                                href={route('purchases.show', purchase.id)}
                                                className="text-indigo-600 hover:text-indigo-800 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>
                                            <Link
                                                href={route('purchases.edit', purchase.id)}
                                                className="text-yellow-600 hover:text-yellow-800 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(purchase.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* مودال تأكيد الحذف */}
                        {confirmDelete && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">تأكيد الحذف</h3>
                                        <button
                                            onClick={cancelDelete}
                                            className="text-gray-500 hover:text-gray-700 text-xl font-bold focus:outline-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <p className="text-gray-600 mb-6 text-center">هل أنت متأكد من حذف هذه المشتريات؟</p>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={cancelDelete}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            onClick={confirmDeletePurchase}
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
            </div>
        </>
    );
}
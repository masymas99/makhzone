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
        return <div className="text-center py-8">جاري التحميل...</div>;
    }

    const sortedPurchases = [...purchases].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a[sortField] > b[sortField] ? 1 : -1;
        } else {
            return a[sortField] < b[sortField] ? 1 : -1;
        }
    });

    const handleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

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
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">قائمة المشتريات</h2>
                            <Link 
                                href={route('purchases.create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                إضافة مشتريات جديدة
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">إجمالي المشتريات</h3>
                                <p className="text-2xl font-bold">{parseFloat(totalPurchases).toLocaleString('ar-EG')} ج.م</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">المشتريات اليوم</h3>
                                <p className="text-2xl font-bold">{todayPurchases}</p>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('purchase_date')}>
                                            التاريخ {sortField === 'purchase_date' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3">رقم المنتج</th>
                                        <th className="px-6 py-3">اسم المنتج</th>
                                        <th className="px-6 py-3">الكمية</th>
                                        <th className="px-6 py-3">سعر الوحدة</th>
                                        <th className="px-6 py-3">المبلغ الفرعي</th>
                                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('total_amount')}>
                                            المبلغ الإجمالي {sortField === 'total_amount' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('batch_number')}>
                                            رقم الدفعة {sortField === 'batch_number' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('supplier_name')}>
                                            اسم المورد {sortField === 'supplier_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('notes')}>
                                            الملاحظات {sortField === 'notes' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3">تاريخ الإنشاء</th>
                                        <th className="px-6 py-3">تاريخ التحديث</th>
                                        <th className="px-6 py-3">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedPurchases.map((purchase) => (
                                        <React.Fragment key={purchase.id}>
                                            <tr className="border-t bg-gray-50">
                                                <td colSpan={12} className="px-6 py-4 text-lg font-semibold">
                                                    المشتريات #{purchase.id}
                                                </td>
                                            </tr>
                                            {purchase.details?.map((detail) => (
                                                <tr key={detail.product_id} className="border-t">
                                                    <td className="px-6 py-4">
                                                        {purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('ar-EG') : '---'}
                                                    </td>
                                                    <td className="px-6 py-4">{detail.product_id}</td>
                                                    <td className="px-6 py-4">{detail.product_name || '---'}</td>
                                                    <td className="px-6 py-4">{detail.quantity}</td>
                                                    <td className="px-6 py-4">{detail.unit_cost?.toLocaleString('ar-EG') || '---'} ج.م</td>
                                                    <td className="px-6 py-4">{detail.subtotal?.toLocaleString('ar-EG') || '---'} ج.م</td>
                                                    <td className="px-6 py-4">{purchase.total_amount.toLocaleString('ar-EG')} ج.م</td>
                                                    <td className="px-6 py-4">{purchase.batch_number}</td>
                                                    <td className="px-6 py-4">{purchase.supplier_name}</td>
                                                    <td className="px-6 py-4">{purchase.notes || 'لا توجد ملاحظات'}</td>
                                                    <td className="px-6 py-4">
                                                        {purchase.created_at ? new Date(purchase.created_at).toLocaleString('ar-EG') : '---'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {purchase.updated_at ? new Date(purchase.updated_at).toLocaleString('ar-EG') : '---'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link 
                                                                href={route('purchases.show', purchase.id)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                            <Link 
                                                                href={route('purchases.edit', purchase.id)}
                                                                className="text-yellow-600 hover:text-yellow-800"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Link>
                                                            <button 
                                                                onClick={() => handleDelete(purchase.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {confirmDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">تأكيد الحذف</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    هل أنت متأكد من حذف هذه المشتريات؟
                                </p>
                            </div>
                            <div className="mt-5 px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-4">
                                <button 
                                    onClick={cancelDelete}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    onClick={confirmDeletePurchase}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

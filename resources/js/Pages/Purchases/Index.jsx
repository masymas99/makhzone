import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function PurchasesIndex() {
    const { purchases } = usePage().props;
    const [sortField, setSortField] = useState('purchase_date');
    const [sortOrder, setSortOrder] = useState('desc');

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
        </>
    );
}

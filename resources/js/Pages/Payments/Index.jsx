import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function PaymentsIndex() {
    const { payments } = usePage().props;
    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const sortedPayments = payments.sort((a, b) => {
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

    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const todayPayments = payments.filter(payment => new Date(payment.date).toDateString() === new Date().toDateString()).length;
    return (
        <>

            <Head title="Payments" />
<Navbar />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">قائمة المدفوعات</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">إجمالي المدفوعات</h3>
                                <p className="text-2xl font-bold">{totalPayments.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">المدفوعات اليوم</h3>
                                <p className="text-2xl font-bold">{todayPayments}</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('date')}>
                                            التاريخ {sortField === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('amount')}>
                                            المبلغ {sortField === 'amount' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3">رقم الفاتورة</th>
                                        <th className="px-6 py-3">العميل</th>
                                        <th className="px-6 py-3">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedPayments.map((payment) => (
                                        <tr key={payment.id} className="border-t">
                                            <td className="px-6 py-4">
                                                {new Date(payment.date).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {payment.amount.toLocaleString('ar-EG')} ج.م
                                            </td>
                                            <td className="px-6 py-4">{payment.invoice_number}</td>
                                            <td className="px-6 py-4">{payment.trader}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {payment.status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </>
    );
}
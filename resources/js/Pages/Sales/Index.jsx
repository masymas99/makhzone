import React, { useState, useEffect } from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function SalesIndex() {
    const { sales: rawSales = [], traders = [], products = [] } = usePage().props;
    const sales = Array.isArray(rawSales.data) ? rawSales.data : [];

    const [sortField, setSortField] = useState('SaleDate');
    const [sortOrder, setSortOrder] = useState('desc');

    const handleSort = (field) => {
        setSortField(field);
        setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortedSales = [...sales].sort((a, b) => {
        const fieldA = a[sortField] || '';
        const fieldB = b[sortField] || '';
        return sortOrder === 'asc' ? (fieldA > fieldB ? 1 : -1) : (fieldA < fieldB ? 1 : -1);
    });

    return (
        <>
            <Head title="المبيعات" />
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">المبيعات</h1>
                        <Link href={route('sales.create')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            إضافة فاتورة جديدة
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-100">
                                <tr>
                                    {['رقم الفاتورة', 'التاجر', 'المبلغ الإجمالي', 'المبلغ المدفوع', 'تاريخ البيع', 'الحالة'].map((header, idx) => (
                                        <th
                                            key={idx}
                                            onClick={() => handleSort(['InvoiceNumber', 'trader.TraderName', 'TotalAmount', 'PaidAmount', 'SaleDate', 'Status'][idx])}
                                            className="px-4 py-2 text-gray-600 cursor-pointer hover:text-gray-800"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSales.map((sale) => (
                                    <tr key={sale.SaleID} className="border-b">
                                        <td className="px-4 py-2">{sale.InvoiceNumber}</td>
                                        <td className="px-4 py-2">{sale.trader?.TraderName}</td>
                                        <td className="px-4 py-2">{sale.TotalAmount.toLocaleString()} ر.س</td>
                                        <td className="px-4 py-2">{sale.PaidAmount.toLocaleString()} ر.س</td>
                                        <td className="px-4 py-2">{new Date(sale.SaleDate).toLocaleDateString('ar-SA')}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${sale.Status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {sale.Status === 'paid' ? 'مدفوعة' : 'معلقة'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
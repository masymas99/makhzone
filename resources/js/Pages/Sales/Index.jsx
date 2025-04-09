import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function Index() {
    const { sales } = usePage().props;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    };

    return (
        <div className="p-6">
            <Head title="الفواتير المباعة" />
            <Navbar />
            <h1 className="text-2xl font-bold mb-4">الفواتير المباعة</h1>
            <Link href={route('sales.create')} className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
                إنشاء فاتورة جديدة
            </Link>
            <table className="w-full border">
                <thead>
                    <tr>
                        <th className="border p-2">رقم الفاتورة</th>
                        <th className="border p-2">التاجر</th>
                        <th className="border p-2">التاريخ</th>
                        <th className="border p-2">الإجمالي</th>
                        <th className="border p-2">الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale) => (
                        <tr key={sale.SaleID}>
                            <td className="border p-2">{sale.InvoiceNumber}</td>
                            <td className="border p-2">{sale.trader.TraderName}</td>
                            <td className="border p-2">{formatDate(sale.SaleDate)}</td>
                            <td className="border p-2">{sale.TotalAmount}</td>
                            <td className="border p-2">{sale.Status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function Index() {
    const { traders } = usePage().props;

    return (
        <div className="p-6">
            <Head title="التجار" />
            <Navbar />
            <h1 className="text-2xl font-bold mb-4">التجار</h1>

            <Link href={route('traders.create')} className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
                إضافة تاجر جديد
            </Link>

            <table className="w-full border">
                <thead>
                    <tr>
                        <th className="border p-2">رقم التاجر</th>
                        <th className="border p-2">اسم التاجر</th>
                        <th className="border p-2">الهاتف</th>
                        <th className="border p-2">الرصيد</th>
                        <th className="border p-2">إجمالي المبيعات</th>
                        <th className="border p-2">المدفوع</th>
                        <th className="border p-2">الحالة</th>
                        <th className="border p-2">العمليات</th>
                    </tr>
                </thead>
                <tbody>
                    {traders.map((trader) => (
                        console.log(trader),
                        <tr key={trader.TraderID}>
                            <td className="border p-2">{trader.TraderID}</td>
                            <td className="border p-2">{trader.TraderName}</td>
                            <td className="border p-2">{trader.Phone}</td>
                            <td className="border p-2" style={{ color: trader.balance < 0 ? 'red' : 'green' }}>
                                {trader.Balance}
                            </td>
                            <td className="border p-2" style={{ color: trader.totalSales < 0 ? 'red' : 'green' }}>
                                {trader.TotalSales}
                            </td>
                            <td className="border p-2" style={{ color: trader.totalPaid < 0 ? 'red' : 'green' }}>
                                {trader.TotalPayments}
                            </td>
                         
                            <td className="border p-2">{trader.IsActive ? 'نشط' : 'غير نشط'}</td>
                            <td className="border p-2">
                                <div className="flex gap-2">
                                    <Link href={route('traders.edit', trader.TraderID)} className="text-blue-500 hover:text-blue-700">
                                        تعديل
                                    </Link>
                                    <Link href={route('traders.show', trader.TraderID)} className="text-green-500 hover:text-green-700">
                                        تفاصيل
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

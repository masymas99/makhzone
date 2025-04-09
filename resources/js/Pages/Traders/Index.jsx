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
                        <th className="border p-2">المبيعات الإجمالية</th>
                        <th className="border p-2">المدفوعات الإجمالية</th>
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
                            <td className="border p-2" style={{ color: trader.Balance > 0 ? 'green' : 'red' }}>
                                {trader.Balance}
                            </td>
                            <td className="border p-2">{trader.TotalSales}</td>
                            <td className="border p-2">{trader.TotalPayments}</td>
                          
                            <td className="border p-2">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    trader.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {trader.IsActive ? 'نشط' : 'غير نشط'}
                                </span>
                            </td>
                            <td className="border p-2">
                                <div className="flex space-x-2">
                                    <Link href={route('traders.show', trader.TraderID)} className="text-blue-500 hover:text-blue-700">عرض</Link>
                                    <Link href={route('traders.edit', trader.TraderID)} className="text-yellow-500 hover:text-yellow-700">تعديل</Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function FinancialDetails() {
    const { financial } = usePage().props;

    return (
        <div className="p-6">
            <Head title="تفاصيل الحساب" />
            <Navbar />
            <h1 className="text-2xl font-bold mb-4">تفاصيل الحساب</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">معلومات العميل</h3>
                        <p><strong>اسم العميل:</strong> {financial[0]?.trader?.TraderName}</p>
                        <p><strong>الرصيد الحالي:</strong> {financial[0]?.balance}</p>
                        <p><strong>المبيعات الإجمالية:</strong> {financial[0]?.total_sales}</p>
                        <p><strong>المدفوعات الإجمالية:</strong> {financial[0]?.total_payments}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">الحركة المالية</h3>
                        <table className="w-full border">
                            <thead>
                                <tr>
                                    <th className="border p-2">التاريخ</th>
                                    <th className="border p-2">نوع المعاملة</th>
                                    <th className="border p-2">المبلغ</th>
                                    <th className="border p-2">الوصف</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financial.map((item) => (
                                    <tr key={item.id}>
                                        <td className="border p-2">{new Date(item.created_at).toLocaleDateString('ar-EG')}</td>
                                        <td className="border p-2">{item.transaction_type}</td>
                                        <td className="border p-2" style={{ color: item.transaction_type === 'credit' ? 'green' : 'red' }}>
                                            {item.transaction_type === 'credit' ? '+' : '-'} {item.payment_amount || item.sale_amount}
                                        </td>
                                        <td className="border p-2">{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

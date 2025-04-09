import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function Index() {
    const { sales } = usePage().props;

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
                        <th className="border p-2">المدفوع</th>
                        <th className="border p-2">المتبقي</th>
                        <th className="border p-2">الحالة</th>
                        <th className="border p-2">إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale) => (
                        <tr key={sale.SaleID}>
                            <td className="border p-2">{sale.InvoiceNumber}</td>
                            <td className="border p-2">{sale.trader.TraderName}</td>
                            <td className="border p-2">{new Date(sale.SaleDate).toLocaleDateString('ar-EG')}</td>
                            <td className="border p-2">{sale.TotalAmount}</td>
                            <td className="border p-2">{sale.PaidAmount}</td>
                            <td className="border p-2" style={{ color: sale.RemainingAmount > 0 ? 'red' : 'green' }}>
                                {sale.RemainingAmount}
                            </td>
                            <td className="border p-2">{sale.Status}</td>
                            <td className="border p-2">
                                <div className="flex gap-2">
                                    <Link href={route('sales.edit', sale.SaleID)} className="text-blue-500 hover:text-blue-700">
                                        تعديل
                                    </Link>
                                    <Link href={route('sales.destroy', sale.SaleID)} 
                                          method="delete" 
                                          onClick={(e) => {
                                              if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
                                                  e.preventDefault();
                                              }
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                    >
                                        حذف
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
import React from 'react';
import { Link, Head, usePage, router } from '@inertiajs/react'; // إضافة router إلى الاستيراد
import Navbar from '@/Shared/Navbar';
import { FaEdit, FaEye, FaMoneyBillWave, FaTrash } from 'react-icons/fa';

export default function Index() {
    const { traders } = usePage().props; // الاحتفاظ بـ usePage للوصول إلى traders

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا التاجر؟ سيتم حذف جميع معاملاته وفواتيره.')) {
            router.delete(route('traders.destroy', id), {
                onSuccess: () => {
                    alert('تم حذف التاجر بنجاح');
                },
                onError: (errors) => {
                    console.error('Error during delete:', errors);
                    alert('حدث خطأ أثناء حذف التاجر: ' + Object.values(errors).join(', '));
                },
            });
        }
    };

    return (
        <div className="p-6">
            <Head title="التجار" />
            <Navbar />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">قائمة التجار</h1>
                    <Link href={route('traders.create')} className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
                        إضافة تاجر جديد
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
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
                                <tr key={trader.TraderID} className="border-b hover:bg-gray-50">
                                    <td className="border p-2">{trader.TraderID}</td>
                                    <td className="border p-2">{trader.TraderName}</td>
                                    <td className="border p-2">{trader.Phone}</td>
                                    <td className="border p-2" style={{ color: trader.Balance < 0 ? 'red' : 'green' }}>
                                        {trader.Balance}
                                    </td>
                                    <td className="border p-2" style={{ color: trader.TotalSales < 0 ? 'red' : 'green' }}>
                                        {trader.TotalSales}
                                    </td>
                                    <td className="border p-2" style={{ color: trader.TotalPayments < 0 ? 'red' : 'green' }}>
                                        {trader.TotalPayments}
                                    </td>
                                    <td className="border p-2">{trader.IsActive ? 'نشط' : 'غير نشط'}</td>
                                    <td className="border p-2">
                                        <div className="flex gap-2">
                                            <Link href={route('traders.edit', trader.TraderID)} 
                                                className="p-2 hover:bg-blue-100 rounded-full text-blue-500 hover:text-blue-700"
                                                title="تعديل"
                                            >
                                                <FaEdit />
                                            </Link>
                                            <Link href={route('traders.transactions', trader.TraderID)} 
                                                className="p-2 hover:bg-green-100 rounded-full text-green-500 hover:text-green-700"
                                                title="تفاصيل"
                                            >
                                                <FaEye />
                                            </Link>
                                            <Link href={route('traders.payments.create', trader.TraderID)} 
                                                className="p-2 hover:bg-purple-100 rounded-full text-purple-500 hover:text-purple-700"
                                                title="دفعة يدوية"
                                            >
                                                <FaMoneyBillWave />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(trader.TraderID)}
                                                className="p-2 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700"
                                                title="حذف"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
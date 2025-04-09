import React, { useState } from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react'; // إضافة usePage إلى الاستيراد
import Navbar from '@/Shared/Navbar';
import { FaArrowLeft, FaMoneyBillWave, FaTrash } from 'react-icons/fa';

export default function Transactions() {
    const { trader, sales, payments } = usePage().props; // الوصول إلى props باستخدام usePage
    const [activeTab, setActiveTab] = useState('all');

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

    // Combine sales and payments for all transactions view
    const allTransactions = [...sales, ...payments]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <div className="p-6">
            <Head title={`معاملات التاجر ${trader.TraderName}`} />
            <Navbar />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">معاملات التاجر {trader.TraderName}</h1>
                    <div className="flex gap-2">
                        <Link href={route('traders.index')} 
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-gray-900"
                            title="العودة"
                        >
                            <FaArrowLeft />
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
                            title="حذف التاجر"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded ${
                                activeTab === 'all' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            كل المعاملات
                        </button>
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`px-4 py-2 rounded ${
                                activeTab === 'sales' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            الفواتير
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`px-4 py-2 rounded ${
                                activeTab === 'payments' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            الدفعات
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="border p-2">التاريخ</th>
                                <th className="border p-2">نوع المعاملة</th>
                                <th className="border p-2">رقم الفاتورة/الدفع</th>
                                <th className="border p-2">المبلغ</th>
                                <th className="border p-2">الوصف</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'all' && allTransactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b">
                                    <td className="border p-2">{formatDate(transaction.created_at)}</td>
                                    <td className="border p-2">
                                        {transaction.type === 'sale' ? 'فاتورة بيع' : 'دفعة يدوية'}
                                    </td>
                                    <td className="border p-2">
                                        {transaction.type === 'sale' 
                                            ? transaction.InvoiceNumber 
                                            : `دفع #${transaction.PaymentID}`}
                                    </td>
                                    <td className="border p-2" style={{ color: transaction.type === 'sale' ? 'green' : 'red' }}>
                                        {transaction.type === 'sale' 
                                            ? `+${transaction.TotalAmount}` 
                                            : `-${transaction.Amount}`}
                                    </td>
                                    <td className="border p-2">{transaction.Note || transaction.description}</td>
                                </tr>
                            ))}

                            {activeTab === 'sales' && sales.map((sale) => (
                                <tr key={sale.SaleID} className="border-b">
                                    <td className="border p-2">{formatDate(sale.created_at)}</td>
                                    <td className="border p-2">فاتورة بيع</td>
                                    <td className="border p-2">{sale.InvoiceNumber}</td>
                                    <td className="border p-2 text-green-600">+{sale.TotalAmount}</td>
                                    <td className="border p-2">{sale.description}</td>
                                </tr>
                            ))}

                            {activeTab === 'payments' && payments.map((payment) => (
                                <tr key={payment.PaymentID} className="border-b">
                                    <td className="border p-2">{formatDate(payment.created_at)}</td>
                                    <td className="border p-2">دفعة يدوية</td>
                                    <td className="border p-2">دفع #{payment.PaymentID}</td>
                                    <td className="border p-2 text-red-600">-{payment.Amount}</td>
                                    <td className="border p-2">{payment.Note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-lg font-bold">إجمالي المبيعات</p>
                            <p className="text-2xl text-green-600">{trader.TotalSales}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">إجمالي الدفعات</p>
                            <p className="text-2xl text-red-600">{trader.TotalPayments}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">الرصيد</p>
                            <p className="text-2xl" style={{ color: trader.Balance >= 0 ? 'green' : 'red' }}>
                                {trader.Balance}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
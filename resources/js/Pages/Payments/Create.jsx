import React from 'react';
import { Link, Head, usePage, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function Create() {
    const { trader, paymentMethods } = usePage().props;
    const { data, setData, post, processing } = useForm({
        trader_id: trader.TraderID,
        amount: '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
        sale_id: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/payments', {
            data: {
                trader_id: data.trader_id,
                amount: data.amount,
                payment_method: data.payment_method,
                payment_date: data.payment_date,
                notes: data.notes,
                sale_id: data.sale_id,
            },
            preserveScroll: true,
            onSuccess: () => {
                // Handle success
            },
            onError: (errors) => {
                // Handle errors
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Head title={`إضافة دفعة - ${trader.TraderName}`} />

            <div className="container mx-auto px-4 py-8 mt-12">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold mb-6">إضافة دفعة يدوية</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">التاجر</label>
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="font-medium">{trader.TraderName}</p>
                                <p className="text-sm text-gray-600">{trader.Phone}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                {Object.entries(paymentMethods).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الدفع</label>
                            <input
                                type="date"
                                value={data.payment_date}
                                onChange={(e) => setData('payment_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Link
                                href={`/traders/${trader.TraderID}`}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                إلغاء
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-4 py-2 rounded-lg ${
                                    processing
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {processing ? 'جاري الإضافة...' : 'إضافة الدفعة'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Create.layout = null;

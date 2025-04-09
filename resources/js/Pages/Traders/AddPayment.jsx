import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import { usePage } from '@inertiajs/react';

export default function AddPayment({ trader }) {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        payment_date: new Date().toISOString().slice(0, 10),
        note: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('traders.payments.storeManual', trader.TraderID));
    }

    return (
        <div className="p-6">
            <Head title={`إضافة دفعة لـ ${trader.TraderName}`} />
            <Navbar />
            
            <h1 className="text-2xl font-bold mb-4">إضافة دفعة لـ {trader.TraderName}</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium mb-1">المبلغ</label>
                    <input
                        type="number"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                    {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">تاريخ الدفعة</label>
                    <input
                        type="date"
                        value={data.payment_date}
                        onChange={(e) => setData('payment_date', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    {errors.payment_date && <div className="text-red-500 text-sm">{errors.payment_date}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">ملاحظات</label>
                    <textarea
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    {errors.note && <div className="text-red-500 text-sm">{errors.note}</div>}
                </div>

                <div className="flex justify-end gap-4">
                    <Link href={route('traders.index')} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        إلغاء
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        إضافة الدفعة
                    </button>
                </div>
            </form>
        </div>
    );
}

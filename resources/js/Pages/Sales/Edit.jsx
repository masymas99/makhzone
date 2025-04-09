import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function Edit() {
    const { sale, traders } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        trader_id: sale.trader_id,
        total_amount: sale.TotalAmount,
        paid_amount: sale.PaidAmount,
        status: sale.Status,
        note: sale.Note,
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('sales.update', sale.SaleID));
    }

    return (
        <div className="p-6">
            <Head title="تعديل الفاتورة" />
            <Navbar />
            <h1 className="text-2xl font-bold mb-4">تعديل الفاتورة رقم {sale.InvoiceNumber}</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium mb-1">التاجر</label>
                    <select
                        value={data.trader_id}
                        onChange={(e) => setData('trader_id', e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        {traders.map((trader) => (
                            <option key={trader.TraderID} value={trader.TraderID}>
                                {trader.TraderName}
                            </option>
                        ))}
                    </select>
                    {errors.trader_id && <div className="text-red-500 text-sm">{errors.trader_id}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">المبلغ الإجمالي</label>
                    <input
                        type="number"
                        value={data.total_amount}
                        onChange={(e) => setData('total_amount', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    {errors.total_amount && <div className="text-red-500 text-sm">{errors.total_amount}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">المبلغ المدفوع</label>
                    <input
                        type="number"
                        value={data.paid_amount}
                        onChange={(e) => setData('paid_amount', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    {errors.paid_amount && <div className="text-red-500 text-sm">{errors.paid_amount}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">الحالة</label>
                    <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="pending">قيد الانتظار</option>
                        <option value="paid">مدفوع</option>
                        <option value="partial">مدفوع جزئياً</option>
                        <option value="cancelled">ملغى</option>
                    </select>
                    {errors.status && <div className="text-red-500 text-sm">{errors.status}</div>}
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
                    <Link href={route('sales.index')} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        إلغاء
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        حفظ التغييرات
                    </button>
                </div>
            </form>
        </div>
    );
}

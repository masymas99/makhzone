import React from 'react';
import { useForm } from '@inertiajs/react';

export default function AddExpense({ onAdd }) {
    const { data, setData, post, processing } = useForm({
        ExpenseDate: new Date().toISOString().split('T')[0],
        Description: '',
        Amount: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('expenses.store'), {
            data,
            onSuccess: () => {
                onAdd();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">التاريخ</label>
                <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={data.ExpenseDate}
                    onChange={(e) => setData('ExpenseDate', e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">الوصف</label>
                <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={data.Description}
                    onChange={(e) => setData('Description', e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">المبلغ</label>
                <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={data.Amount}
                    onChange={(e) => setData('Amount', e.target.value)}
                />
            </div>
            <button
                type="submit"
                disabled={processing}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
                {processing ? 'جاري الإضافة...' : 'إضافة مصروف'}
            </button>
        </form>
    );
}

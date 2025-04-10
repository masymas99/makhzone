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
            onSuccess: () => onAdd(),
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">إضافة مصروف جديد</h3>
                    <button
                        type="button"
                        onClick={onAdd}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="text-gray-500">التاريخ:</span>
                            <span className="text-gray-900 font-medium"> {new Date().toLocaleDateString('ar-EG')}</span>
                        </label>
                        <input
                            type="date"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={data.ExpenseDate}
                            onChange={(e) => setData('ExpenseDate', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="text-gray-500">الوصف:</span>
                            <span className="text-gray-900 font-medium"> (وصف المصروف)</span>
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={data.Description}
                            onChange={(e) => setData('Description', e.target.value)}
                            placeholder="أدخل وصف المصروف..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="text-gray-500">المبلغ:</span>
                            <span className="text-gray-900 font-medium"> (بالجنيه المصري)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                                value={data.Amount}
                                onChange={(e) => setData('Amount', e.target.value)}
                                placeholder="0.00"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">ج.م</span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

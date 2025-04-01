import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [formData, setFormData] = useState({
        date: '',
        description: '',
        amount: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch expenses on component mount
    useEffect(() => {
        router.get('/expenses', {}, {
            onSuccess: (data) => {
                setExpenses(data.props.expenses);
                setLoading(false);
            },
            onError: () => setLoading(false)
        });
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        setErrors({...errors, [e.target.name]: ''});
    };

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        router.post('/expenses', formData, {
            onSuccess: () => {
                setFormData({ date: '', description: '', amount: '' });
                // Refresh expenses list after successful submission
                router.get('/expenses', {}, {
                    onSuccess: (data) => setExpenses(data.props.expenses)
                });
            },
            onError: (errors) => setErrors(errors)
        });
    };

    if (loading) return (
        <div className="p-6 text-gray-500">Loading expenses...</div>
    );

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Expense Management</h1>

            {/* Add Expense Form */}
            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.date ? 'border-red-500' : ''}`}
                        />
                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : ''}`}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.amount ? 'border-red-500' : ''}`}
                        />
                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Add Expense
                </button>
            </form>

            {/* Expenses Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3 text-left text-sm">Date</th>
                            <th className="p-3 text-left text-sm">Description</th>
                            <th className="p-3 text-left text-sm">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(expense => (
                            <tr key={expense.id} className="border-t">
                                <td className="p-3">{new Date(expense.date).toLocaleDateString()}</td>
                                <td className="p-3">{expense.description}</td>
                                <td className="p-3">${parseFloat(expense.amount).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
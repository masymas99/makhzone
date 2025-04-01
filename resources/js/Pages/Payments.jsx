import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Navbar from '../Shared/Navbar';

export default function Payments() {
    const [traders, setTraders] = useState([]);
    const [sales, setSales] = useState([]);
    const [payments, setPayments] = useState([]);
    const [formData, setFormData] = useState({
        trader_id: '',
        sale_id: '',
        amount: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch initial data on component mount
    useEffect(() => {
        router.get('/payments', {}, {
            onSuccess: (data) => {
                setPayments(data.props.payments);
                setLoading(false);
            },
            onError: () => setLoading(false)
        });

        router.get('/traders', {}, {
            onSuccess: (data) => setTraders(data.props.traders)
        });
    }, []);

    // Fetch sales when trader is selected
    useEffect(() => {
        if (formData.trader_id) {
            router.get(`/sales?trader_id=${formData.trader_id}`, {}, {
                onSuccess: (data) => setSales(data.props.sales)
            });
        }
    }, [formData.trader_id]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        setErrors({...errors, [e.target.name]: ''});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.trader_id) newErrors.trader_id = 'Trader selection required';
        if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        router.post('/payments', formData, {
            onSuccess: () => {
                setFormData({ trader_id: '', sale_id: '', amount: '' });
                // Refresh payments list
                router.get('/payments', {}, {
                    onSuccess: (data) => setPayments(data.props.payments)
                });
            },
            onError: (errors) => setErrors(errors)
        });
    };

    if (loading) return (
        <div className="p-6 text-gray-500">Loading payments...</div>
    );

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">Payment Management</h1>

                {/* Payment Form */}
                <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Trader</label>
                            <select
                                name="trader_id"
                                value={formData.trader_id}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.trader_id ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select a trader</option>
                                {traders.map(trader => (
                                    <option key={trader.id} value={trader.id}>{trader.name}</option>
                                ))}
                            </select>
                            {errors.trader_id && <p className="text-red-500 text-sm mt-1">{errors.trader_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Linked Sale (optional)</label>
                            <select
                                name="sale_id"
                                value={formData.sale_id}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                disabled={!formData.trader_id}
                            >
                                <option value="">Select a sale</option>
                                {sales.map(sale => (
                                    <option key={sale.id} value={sale.id}>Sale #{sale.id}</option>
                                ))}
                            </select>
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
                                placeholder="0.00"
                            />
                            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Record Payment
                    </button>
                </form>

                {/* Payments Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 text-left text-sm">Trader</th>
                                <th className="p-3 text-left text-sm">Date</th>
                                <th className="p-3 text-left text-sm">Amount</th>
                                <th className="p-3 text-left text-sm">Linked Sale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id} className="border-t">
                                    <td className="p-3">{payment.trader_name}</td>
                                    <td className="p-3">{new Date(payment.created_at).toLocaleDateString()}</td>
                                    <td className="p-3">${parseFloat(payment.amount).toFixed(2)}</td>
                                    <td className="p-3">{payment.sale_id || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
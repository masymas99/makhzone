import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Navbar from '../Shared/Navbar';

export default function Traders() {
    const [traders, setTraders] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [selectedTrader, setSelectedTrader] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Fetch traders on component mount
    useEffect(() => {
        router.get('/traders', {}, {
            onSuccess: (data) => setTraders(data.props.traders)
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
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone.match(/^\+?[0-9\s-]{7,}$/)) newErrors.phone = 'Invalid phone number';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const method = editingId ? 'put' : 'post';
        const url = editingId ? `/traders/${editingId}` : '/traders';

        router[method](url, formData, {
            onSuccess: () => {
                setFormData({ name: '', phone: '', address: '' });
                setEditingId(null);
            },
            onError: (errors) => setErrors(errors)
        });
    };

    // Handle soft delete
    const handleDeactivate = (id) => {
        if (confirm('Are you sure you want to deactivate this trader?')) {
            router.put(`/traders/${id}`, { is_active: 0 });
        }
    };

    // Start editing a trader
    const startEditing = (trader) => {
        setEditingId(trader.id);
        setFormData({
            name: trader.name,
            phone: trader.phone,
            address: trader.address
        });
    };

    return (
<>
<div className="min-h-screen">
            <Navbar />
            <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Trader Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trader Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Trader Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : ''}`}
                        />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : ''}`}
                            rows="3"
                        />
                        {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        {editingId ? 'Update Trader' : 'Add Trader'}
                    </button>
                </form>

                {/* Active Traders Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 text-left text-sm">Name</th>
                                <th className="p-3 text-left text-sm">Phone</th>
                                <th className="p-3 text-left text-sm">Address</th>
                                <th className="p-3 text-left text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {traders.filter(t => t.is_active).map(trader => (
                                <tr key={trader.id} className="border-t">
                                    <td className="p-3">{trader.name}</td>
                                    <td className="p-3">{trader.phone}</td>
                                    <td className="p-3">{trader.address}</td>
                                    <td className="p-3 space-x-2">
                                        <button
                                            onClick={() => setSelectedTrader(trader)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => startEditing(trader)}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeactivate(trader.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Deactivate
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedTrader && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">{selectedTrader.name} Details</h2>
                        <div className="space-y-2">
                            <p><span className="font-semibold">Total Sales:</span> ${selectedTrader.total_sales?.toFixed(2)}</p>
                            <p><span className="font-semibold">Current Debt:</span> ${selectedTrader.debt?.toFixed(2)}</p>
                        </div>
                        <button
                            onClick={() => setSelectedTrader(null)}
                            className="mt-4 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            </div>
  </div>
</>

    );
}
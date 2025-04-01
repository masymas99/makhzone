import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Sales() {
    const [traders, setTraders] = useState([]);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [formData, setFormData] = useState({
        trader_id: '',
        paid_amount: '',
        productEntries: [{
            product_id: '',
            quantity: 1,
            unit_price: 0,
            subtotal: 0
        }]
    });
    const [errors, setErrors] = useState({});

    // Fetch initial data
    useEffect(() => {
        router.get('/traders', {}, {
            onSuccess: (data) => setTraders(data.props.traders)
        });

        router.get('/products', {}, {
            onSuccess: (data) => setProducts(data.props.products)
        });

        router.get('/sales', {}, {
            onSuccess: (data) => setSales(data.props.sales)
        });
    }, []);

    // Calculate total amount
    const totalAmount = formData.productEntries.reduce((sum, entry) => sum + entry.subtotal, 0);
    const remainingDebt = totalAmount - (parseFloat(formData.paid_amount) || 0);

    // Handle form changes
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        setErrors({...errors, [e.target.name]: ''});
    };

    // Handle product entry changes
    const handleProductChange = (index, e) => {
        const newEntries = [...formData.productEntries];
        newEntries[index][e.target.name] = e.target.value;

        // Update price and recalculate subtotal when product changes
        if (e.target.name === 'product_id') {
            const selectedProduct = products.find(p => p.id == e.target.value);
            if (selectedProduct) {
                newEntries[index].unit_price = selectedProduct.unit_price;
                newEntries[index].subtotal = selectedProduct.unit_price * newEntries[index].quantity;
            }
        }

        // Recalculate subtotal when quantity changes
        if (e.target.name === 'quantity') {
            newEntries[index].quantity = Math.max(1, e.target.value);
            newEntries[index].subtotal = newEntries[index].unit_price * newEntries[index].quantity;
        }

        setFormData({...formData, productEntries: newEntries});
    };

    // Add new product entry
    const addProductEntry = () => {
        setFormData({
            ...formData,
            productEntries: [...formData.productEntries, {
                product_id: '',
                quantity: 1,
                unit_price: 0,
                subtotal: 0
            }]
        });
    };

    // Remove product entry
    const removeProductEntry = (index) => {
        const newEntries = formData.productEntries.filter((_, i) => i !== index);
        setFormData({...formData, productEntries: newEntries});
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.trader_id) newErrors.trader_id = 'Trader is required';
        if (formData.productEntries.some(entry => !entry.product_id)) {
            newErrors.productEntries = 'All products must be selected';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const saleData = {
            trader_id: formData.trader_id,
            paid_amount: formData.paid_amount || 0,
            products: formData.productEntries.map(entry => ({
                product_id: entry.product_id,
                quantity: entry.quantity,
                unit_price: entry.unit_price
            }))
        };

        router.post('/sales', saleData, {
            onSuccess: () => {
                setFormData({
                    trader_id: '',
                    paid_amount: '',
                    productEntries: [{
                        product_id: '',
                        quantity: 1,
                        unit_price: 0,
                        subtotal: 0
                    }]
                });
            },
            onError: (errors) => setErrors(errors)
        });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Sales Management</h1>

            {/* Sales Form */}
            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trader Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Trader</label>
                        <select
                            name="trader_id"
                            value={formData.trader_id}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.trader_id ? 'border-red-500' : ''}`}
                        >
                            <option value="">Choose a trader...</option>
                            {traders.filter(t => t.is_active).map(trader => (
                                <option key={trader.id} value={trader.id}>{trader.name}</option>
                            ))}
                        </select>
                        {errors.trader_id && <p className="text-red-500 text-sm">{errors.trader_id}</p>}
                    </div>

                    {/* Product Entries */}
                    <div className="col-span-full">
                        <div className="space-y-4">
                            {formData.productEntries.map((entry, index) => (
                                <div key={index} className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Product</label>
                                        <select
                                            name="product_id"
                                            value={entry.product_id}
                                            onChange={(e) => handleProductChange(index, e)}
                                            className={`w-full p-2 border rounded ${errors.productEntries ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Select product...</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} (${product.unit_price})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="w-24">
                                        <label className="block text-sm font-medium mb-1">Qty</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            min="1"
                                            value={entry.quantity}
                                            onChange={(e) => handleProductChange(index, e)}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>

                                    <div className="w-32">
                                        <label className="block text-sm font-medium mb-1">Subtotal</label>
                                        <div className="p-2 bg-gray-100 rounded">
                                            ${entry.subtotal.toFixed(2)}
                                        </div>
                                    </div>

                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProductEntry(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addProductEntry}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                            + Add Another Product
                        </button>
                    </div>

                    {/* Payment Details */}
                    <div className="col-span-full grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Total Amount</label>
                            <div className="p-2 bg-gray-100 rounded">
                                ${totalAmount.toFixed(2)}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Paid Amount</label>
                            <input
                                type="number"
                                name="paid_amount"
                                value={formData.paid_amount}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Remaining Debt</label>
                            <div className={`p-2 bg-gray-100 rounded ${remainingDebt > 0 ? 'text-red-600' : ''}`}>
                                ${remainingDebt.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Record Sale
                </button>
            </form>

            {/* Recent Sales Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3 text-left text-sm">Trader</th>
                            <th className="p-3 text-left text-sm">Date</th>
                            <th className="p-3 text-left text-sm">Total</th>
                            <th className="p-3 text-left text-sm">Paid</th>
                            <th className="p-3 text-left text-sm">Debt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale.id} className="border-t">
                                <td className="p-3">{sale.trader_name}</td>
                                <td className="p-3">{new Date(sale.date).toLocaleDateString()}</td>
                                <td className="p-3">${sale.total_amount.toFixed(2)}</td>
                                <td className="p-3">${sale.paid_amount.toFixed(2)}</td>
                                <td className="p-3">${(sale.total_amount - sale.paid_amount).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
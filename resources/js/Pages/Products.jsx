import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        stock_quantity: '',
        unit_price: '',
        unit_cost: ''
    });
    const [errors, setErrors] = useState({});

    // Fetch products on component mount
    useEffect(() => {
        router.get('/products', {}, {
            onSuccess: (data) => setProducts(data.props.products)
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
        if (!formData.category.trim()) newErrors.category = 'Category is required';
        if (formData.stock_quantity <= 0) newErrors.stock_quantity = 'Must be positive';
        if (formData.unit_price <= 0) newErrors.unit_price = 'Must be positive';
        if (formData.unit_cost <= 0) newErrors.unit_cost = 'Must be positive';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission for create/update
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const method = editingProduct ? 'put' : 'post';
        const url = editingProduct ? `/products/${editingProduct.id}` : '/products';

        router[method](url, formData, {
            onSuccess: () => {
                setFormData({ name: '', category: '', stock_quantity: '', unit_price: '', unit_cost: '' });
                setEditingProduct(null);
            },
            onError: (errors) => setErrors(errors)
        });
    };

    // Handle delete operation
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/products/${id}`);
        }
    };

    // Start editing a product
    const startEditing = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            stock_quantity: product.stock_quantity,
            unit_price: product.unit_price,
            unit_cost: product.unit_cost
        });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Product Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    {/* Other form fields with similar structure */}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                </form>

                {/* Product Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 text-left text-sm">Name</th>
                                <th className="p-3 text-left text-sm">Category</th>
                                <th className="p-3 text-left text-sm">Stock</th>
                                <th className="p-3 text-left text-sm">Price</th>
                                <th className="p-3 text-left text-sm">Cost</th>
                                <th className="p-3 text-left text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-t">
                                    <td className="p-3">{product.name}</td>
                                    <td className="p-3">{product.category}</td>
                                    <td className="p-3">{product.stock_quantity}</td>
                                    <td className="p-3">${product.unit_price}</td>
                                    <td className="p-3">${product.unit_cost}</td>
                                    <td className="p-3 space-x-2">
                                        <button
                                            onClick={() => startEditing(product)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
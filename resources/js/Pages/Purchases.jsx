import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Navbar from '../Shared/Navbar';

export default function Purchases() {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [formData, setFormData] = useState({
    supplier_name: '',
    products: [{ product_id: '', quantity: 0, unit_cost: 0, subtotal: 0 }]
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    router.get('/products', {}, {
      onSuccess: (data) => setProducts(data.props.products)
    });

    router.get('/purchases', {}, {
      onSuccess: (data) => setPurchases(data.props.purchases)
    });
  }, []);

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] = value;

    if (field === 'quantity' || field === 'unit_cost') {
      updatedProducts[index].subtotal = (
        Number(updatedProducts[index].quantity) *
        Number(updatedProducts[index].unit_cost)
      );
    }

    setFormData({ ...formData, products: updatedProducts });
  };

  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [...formData.products,
        { product_id: '', quantity: 0, unit_cost: 0, subtotal: 0 }
      ]
    });
  };

  const removeProductRow = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplier_name.trim()) newErrors.supplier_name = 'Supplier name is required';
    formData.products.forEach((product, index) => {
      if (!product.product_id) newErrors[`products.${index}.product_id`] = 'Product selection required';
      if (product.quantity <= 0) newErrors[`products.${index}.quantity`] = 'Quantity must be positive';
      if (product.unit_cost <= 0) newErrors[`products.${index}.unit_cost`] = 'Unit cost must be positive';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const total = formData.products.reduce((sum, product) => sum + product.subtotal, 0);

    router.post('/purchases', {
      ...formData,
      total_amount: total
    }, {
      onSuccess: () => {
        setFormData({
          supplier_name: '',
          products: [{ product_id: '', quantity: 0, unit_cost: 0, subtotal: 0 }]
        });
        router.get('/purchases', {}, {
          onSuccess: (data) => setPurchases(data.props.purchases)
        });
      },
      onError: (errors) => setErrors(errors)
    });
  };

  const totalAmount = formData.products.reduce((sum, product) => sum + product.subtotal, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Purchase Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchase Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier Name</label>
              <input
                type="text"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                className={`w-full p-2 border rounded ${errors.supplier_name ? 'border-red-500' : ''}`}
              />
              {errors.supplier_name && <p className="text-red-500 text-sm">{errors.supplier_name}</p>}
            </div>

            <div className="space-y-4">
              {formData.products.map((product, index) => (
                <div key={index} className="border p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Product #{index + 1}</h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeProductRow(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Product</label>
                    <select
                      value={product.product_id}
                      onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                      className={`w-full p-2 border rounded ${errors[`products.${index}.product_id`] ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a product</option>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.id}>{prod.name}</option>
                      ))}
                    </select>
                    {errors[`products.${index}.product_id`] && (
                      <p className="text-red-500 text-sm">{errors[`products.${index}.product_id`]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        className={`w-full p-2 border rounded ${errors[`products.${index}.quantity`] ? 'border-red-500' : ''}`}
                      />
                      {errors[`products.${index}.quantity`] && (
                        <p className="text-red-500 text-sm">{errors[`products.${index}.quantity`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Unit Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={product.unit_cost}
                        onChange={(e) => handleProductChange(index, 'unit_cost', e.target.value)}
                        className={`w-full p-2 border rounded ${errors[`products.${index}.unit_cost`] ? 'border-red-500' : ''}`}
                      />
                      {errors[`products.${index}.unit_cost`] && (
                        <p className="text-red-500 text-sm">{errors[`products.${index}.unit_cost`]}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right font-medium">
                    Subtotal: ${product.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addProductRow}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Another Product
              </button>
            </div>

            <div className="text-xl font-semibold text-right">
              Total Amount: ${totalAmount.toFixed(2)}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Record Purchase
            </button>
          </form>

          {/* Recent Purchases Table */}
          <div className="overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">Recent Purchases</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left text-sm">Supplier</th>
                  <th className="p-3 text-left text-sm">Date</th>
                  <th className="p-3 text-left text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(purchase => (
                  <tr key={purchase.id} className="border-t">
                    <td className="p-3">{purchase.supplier_name}</td>
                    <td className="p-3">{new Date(purchase.date).toLocaleDateString()}</td>
                    <td className="p-3">${purchase.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function PurchasesCreate({ products }) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_name: '',
        notes: '',
        products: [{
            product_id: '',
            product_name: '',
            category: '',
            quantity: 1,
            unit_cost: 0,
            unit_price: 0,
        }],
    });

    const addProduct = () => {
        setData('products', [...data.products, {
            product_id: '',
            product_name: '',
            category: '',
            quantity: 1,
            unit_cost: 0,
            unit_price: 0,
        }]);
    };

    const removeProduct = (index) => {
        if (data.products.length > 1) {
            const newProducts = [...data.products];
            newProducts.splice(index, 1);
            setData('products', newProducts);
        }
    };

    const handleProductChange = (index, productId) => {
        const newProducts = [...data.products];
        const selectedProduct = products.find(p => p.ProductID.toString() === productId.toString());
        
        if (selectedProduct) {
            newProducts[index] = {
                ...newProducts[index],
                product_id: selectedProduct.ProductID,
                product_name: selectedProduct.ProductName,
                category: selectedProduct.Category,
                unit_cost: selectedProduct.UnitCost,
                unit_price: selectedProduct.UnitPrice,
            };
        } else {
            newProducts[index] = {
                ...newProducts[index],
                product_id: '',
                product_name: '',
                category: '',
                unit_cost: 0,
                unit_price: 0,
            };
        }
        setData('products', newProducts);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('purchases.store'));
    };

    return (
        <>
            <Head title="إضافة مشتريات" />
            <Navbar />
            <div className="py-12 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">إضافة مشتريات جديدة</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-base font-semibold text-gray-800 mb-2">اسم المورد</label>
                                    <input
                                        type="text"
                                        name="supplier_name"
                                        value={data.supplier_name}
                                        onChange={(e) => setData('supplier_name', e.target.value)}
                                        className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200"
                                        required
                                    />
                                    {errors.supplier_name && (
                                        <div className="text-red-600 text-sm mt-2">{errors.supplier_name}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-base font-semibold text-gray-800 mb-2">الملاحظات</label>
                                    <textarea
                                        name="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200"
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {data.products.map((product, index) => (
                                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-md border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">المنتج {index + 1}</h3>
                                            {data.products.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(index)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    حذف المنتج
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 mb-2">المنتج</label>
                                                <select
                                                    name={`products.${index}.product_id`}
                                                    value={product.product_id}
                                                    onChange={(e) => handleProductChange(index, e.target.value)}
                                                    className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200"
                                                >
                                                    <option value="">اختر منتجًا جديدًا أو موجودًا</option>
                                                    {products?.map((p) => (
                                                        <option key={p.ProductID} value={p.ProductID}>
                                                            {p.ProductName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 mb-2">اسم المنتج</label>
                                                <input
                                                    type="text"
                                                    name={`products.${index}.product_name`}
                                                    value={product.product_name}
                                                    onChange={(e) => {
                                                        const newProducts = [...data.products];
                                                        newProducts[index].product_name = e.target.value;
                                                        setData('products', newProducts);
                                                    }}
                                                    className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200 disabled:bg-gray-100"
                                                    required
                                                    disabled={product.product_id}
                                                />
                                                {errors[`products.${index}.product_name`] && (
                                                    <div className="text-red-600 text-sm mt-2">{errors[`products.${index}.product_name`]}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 mb-2">الفئة</label>
                                                <input
                                                    type="text"
                                                    name={`products.${index}.category`}
                                                    value={product.category}
                                                    onChange={(e) => {
                                                        const newProducts = [...data.products];
                                                        newProducts[index].category = e.target.value;
                                                        setData('products', newProducts);
                                                    }}
                                                    className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200 disabled:bg-gray-100"
                                                    required
                                                    disabled={product.product_id}
                                                />
                                                {errors[`products.${index}.category`] && (
                                                    <div className="text-red-600 text-sm mt-2">{errors[`products.${index}.category`]}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 mb-2">الكمية</label>
                                                <input
                                                    type="number"
                                                    name={`products.${index}.quantity`}
                                                    value={product.quantity}
                                                    onChange={(e) => {
                                                        const newProducts = [...data.products];
                                                        newProducts[index].quantity = e.target.value;
                                                        setData('products', newProducts);
                                                    }}
                                                    className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200"
                                                    required
                                                    min="1"
                                                />
                                                {errors[`products.${index}.quantity`] && (
                                                    <div className="text-red-600 text-sm mt-2">{errors[`products.${index}.quantity`]}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 mb-2">سعر الشراء</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name={`products.${index}.unit_cost`}
                                                    value={product.unit_cost}
                                                    onChange={(e) => {
                                                        const newProducts = [...data.products];
                                                        newProducts[index].unit_cost = e.target.value;
                                                        setData('products', newProducts);
                                                    }}
                                                    className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200"
                                                    required
                                                    min="0"
                                                />
                                                {errors[`products.${index}.unit_cost`] && (
                                                    <div className="text-red-600 text-sm mt-2">{errors[`products.${index}.unit_cost`]}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 mb-2">سعر البيع</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name={`products.${index}.unit_price`}
                                                    value={product.unit_price}
                                                    onChange={(e) => {
                                                        const newProducts = [...data.products];
                                                        newProducts[index].unit_price = e.target.value;
                                                        setData('products', newProducts);
                                                    }}
                                                    className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={addProduct}
                                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                                >
                                    + إضافة منتج جديد
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50"
                                >
                                    حفظ المشتريات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
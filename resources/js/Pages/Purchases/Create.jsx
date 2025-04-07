import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';

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
        const newProducts = [...data.products];
        newProducts.splice(index, 1);
        setData('products', newProducts);
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
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">إضافة مشتريات جديدة</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        اسم المورد
                                    </label>
                                    <input
                                        type="text"
                                        name="supplier_name"
                                        value={data.supplier_name}
                                        onChange={(e) => setData('supplier_name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.supplier_name && (
                                        <div className="text-red-600 text-sm mt-1">{errors.supplier_name}</div>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الملاحظات
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {data.products.map((product, index) => (
                                    <div key={index} className="border rounded-lg p-6">
                                        <h3 className="text-lg font-medium mb-4">المنتج {index + 1}</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    المنتج
                                                </label>
                                                <select
                                                    name={`products.${index}.product_id`}
                                                    value={product.product_id}
                                                    onChange={(e) => handleProductChange(index, e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    اسم المنتج
                                                </label>
                                                <input
                                                    type="text"
                                                    name={`products.${index}.product_name`}
                                                    value={product.product_name}
                                                    onChange={(e) => {
                                                        const newProducts = [...data.products];
                                                        newProducts[index].product_name = e.target.value;
                                                        setData('products', newProducts);
                                                    }}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    required
                                                    disabled={product.product_id}
                                                />
                                                {errors[`products.${index}.product_name`] && (
                                                    <div className="text-red-600 text-sm mt-1">
                                                        {errors[`products.${index}.product_name`]}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    الفئة
                                                </label>
                                                <input
                                                    type="text"
                                                    name={`products.${index}.category`}
                                                    value={product.category}
                                                    onChange={(e) => {
                                                        const newProducts = [...data.products];
                                                        newProducts[index].category = e.target.value;
                                                        setData('products', newProducts);
                                                    }}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    required
                                                    disabled={product.product_id}
                                                />
                                                {errors[`products.${index}.category`] && (
                                                    <div className="text-red-600 text-sm mt-1">
                                                        {errors[`products.${index}.category`]}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    الكمية
                                                </label>
                                                <input
                                                    type="number"
                                                    name={`products.${index}.quantity`}
                                                    value={product.quantity}
                                                    onChange={(e) => {
                                                        const newProducts = [...data.products];
                                                        newProducts[index].quantity = e.target.value;
                                                        setData('products', newProducts);
                                                    }}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    required
                                                    min="1"
                                                />
                                                {errors[`products.${index}.quantity`] && (
                                                    <div className="text-red-600 text-sm mt-1">
                                                        {errors[`products.${index}.quantity`]}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    سعر الوحدة
                                                </label>
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
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    required
                                                    min="0"
                                                />
                                                {errors[`products.${index}.unit_cost`] && (
                                                    <div className="text-red-600 text-sm mt-1">
                                                        {errors[`products.${index}.unit_cost`]}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    سعر البيع
                                                </label>
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
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                حذف المنتج
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={addProduct}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    إضافة منتج جديد
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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

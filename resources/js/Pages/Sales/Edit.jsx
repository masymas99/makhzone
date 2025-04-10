import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function Edit({ sale, traders }) {
    // تهيئة البيانات الأولية مع فحص للقيم
    const initialProducts = sale?.products?.map(product => ({
        product_id: product.product_id || '',
        quantity: product.quantity || 1,
        unit_price: product.unit_price || 0,
        unit_cost: product.unit_cost || 0
    })) || [{
        product_id: '',
        quantity: 1,
        unit_price: 0,
        unit_cost: 0
    }];

    const { data, setData, put, processing, errors } = useForm({
        trader_id: sale?.trader_id || '',
        notes: sale?.notes || '',
        products: initialProducts
    });

    const addProduct = () => {
        const newProducts = [...data.products];
        newProducts.push({
            product_id: '',
            quantity: 1,
            unit_price: 0,
            unit_cost: 0
        });
        setData('products', newProducts);
    };

    const removeProduct = (index) => {
        const newProducts = [...data.products];
        newProducts.splice(index, 1);
        setData('products', newProducts);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('sales.update', sale?.SaleID));
    };

    return (
        <>
            <Head title={`تعديل الفاتورة #${sale?.InvoiceNumber || 'جديد'}`} />
            <Navbar />
            <div className="py-12 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">تعديل الفاتورة #
                            {sale?.InvoiceNumber || 'جديد'}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-base font-semibold text-gray-800 mb-2">العميل</label>
                                    <select
                                        name="trader_id"
                                        value={data.trader_id}
                                        onChange={(e) => setData('trader_id', e.target.value)}
                                        className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200"
                                        required
                                    >
                                        <option value="">اختر العميل...</option>
                                        {traders?.map((trader) => (
                                            <option key={trader.TraderID} value={trader.TraderID}>
                                                {trader.TraderName}
                                            </option>
                                        ))}
                                    </select>
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
                                                    onChange={(e) => {
                                                        const newProducts = [...data.products];
                                                        newProducts[index].product_id = e.target.value;
                                                        setData('products', newProducts);
                                                    }}
                                                    className="block w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 py-3 px-4 text-base transition-all duration-200"
                                                    required
                                                >
                                                    <option value="">اختر المنتج...</option>
                                                    {/* هنا يجب أن تضيف قائمة المنتجات */}
                                                </select>
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
                                                    min="1"
                                                    required
                                                />
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
                                                    required
                                                />
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
                                                    min="0"
                                                    required
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
                                    className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50"
                                    disabled={processing}
                                >
                                    حفظ التغييرات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

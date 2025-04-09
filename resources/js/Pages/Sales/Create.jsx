import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function Create() {
    const { traders, products } = usePage().props;
    const { data, setData, post, errors, processing } = useForm({
        TraderID: '',
        products: [],
    });

    const [selectedProducts, setSelectedProducts] = useState([]);

    // إضافة منتج جديد
    const addProduct = () => {
        setSelectedProducts([...selectedProducts, { ProductID: '', Quantity: 1 }]);
    };

    // تحديث بيانات المنتج
    const updateProduct = (index, field, value) => {
        const updatedProducts = selectedProducts.map((item, i) =>
            i === index ? { ...item, [field]: field === 'Quantity' ? parseInt(value) || 1 : value } : item
        );
        setSelectedProducts(updatedProducts);
        setData('products', updatedProducts);
    };

    // حذف منتج
    const removeProduct = (index) => {
        const updatedProducts = selectedProducts.filter((_, i) => i !== index);
        setSelectedProducts(updatedProducts);
        setData('products', updatedProducts);
    };

    // حساب المبلغ الفرعي لمنتج واحد
    const calculateSubTotal = (product) => {
        const item = products.find((p) => p.ProductID == product.ProductID); // استخدام == للتعامل مع أنواع مختلفة
        return item ? (product.Quantity || 0) * item.UnitPrice : 0;
    };

    // حساب الإجمالي الكلي
    const calculateTotal = () => {
        return selectedProducts.reduce((total, item) => total + calculateSubTotal(item), 0);
    };

    // معالجة الإرسال
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('sales.store'), {
            onSuccess: () => alert('تم حفظ الفاتورة بنجاح!'),
        });
    };

    return (
        <>
            <Head title="إنشاء فاتورة" />
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-4xl mx-auto p-6 sm:p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">إنشاء فاتورة جديدة</h1>

                    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
                        {/* اختيار التاجر */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">اختر التاجر</label>
                            <select
                                value={data.TraderID}
                                onChange={(e) => setData('TraderID', e.target.value)}
                                className="w-full border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">اختر تاجر</option>
                                {traders.map((trader) => (
                                    <option key={trader.TraderID} value={trader.TraderID}>
                                        {trader.TraderName}
                                    </option>
                                ))}
                            </select>
                            {errors.TraderID && (
                                <span className="text-red-500 text-sm mt-1">{errors.TraderID}</span>
                            )}
                        </div>

                        {/* المنتجات */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">المنتجات</h2>
                                <button
                                    type="button"
                                    onClick={addProduct}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                >
                                    + إضافة منتج
                                </button>
                            </div>

                            {selectedProducts.length === 0 ? (
                                <p className="text-gray-500">لم يتم إضافة منتجات بعد</p>
                            ) : (
                                selectedProducts.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-4 mb-4 bg-gray-50 p-3 rounded-lg"
                                    >
                                        <select
                                            value={item.ProductID}
                                            onChange={(e) => updateProduct(index, 'ProductID', e.target.value)}
                                            className="flex-1 border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">اختر منتج</option>
                                            {products.map((product) => (
                                                <option key={product.ProductID} value={product.ProductID}>
                                                    {product.ProductName} - {product.UnitPrice} ج.م
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            value={item.Quantity}
                                            onChange={(e) => updateProduct(index, 'Quantity', e.target.value)}
                                            className="w-24 border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                            min="1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* تفاصيل الفاتورة */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">تفاصيل الفاتورة</h2>
                            {selectedProducts.length === 0 ? (
                                <p className="text-gray-500">لا توجد منتجات لعرضها</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse bg-white rounded-lg shadow">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="p-3 text-right">المنتج</th>
                                                <th className="p-3 text-right">السعر الوحدة</th>
                                                <th className="p-3 text-right">الكمية</th>
                                                <th className="p-3 text-right">المبلغ الفرعي</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedProducts.map((item, index) => {
                                                const product = products.find((p) => p.ProductID == item.ProductID);
                                                return (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="border-t p-3">
                                                            {product ? product.ProductName : 'غير محدد'}
                                                        </td>
                                                        <td className="border-t p-3">
                                                            {product ? `${product.UnitPrice} ج.م` : '-'}
                                                        </td>
                                                        <td className="border-t p-3">{item.Quantity || 0}</td>
                                                        <td className="border-t p-3 font-medium">
                                                            {calculateSubTotal(item)} ج.م
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-100">
                                                <td colSpan="3" className="p-3 text-right font-bold">
                                                    المجموع الإجمالي:
                                                </td>
                                                <td className="p-3 font-bold text-blue-600">
                                                    {calculateTotal()} ج.م
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* زر الحفظ */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition ${
                                    processing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {processing ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
import React, { useState } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function SalesIndex() {
    const { sales: rawSales = [], traders = [], products = [] } = usePage().props;
    const sales = Array.isArray(rawSales.data) ? rawSales.data : [];

    const { data, setData, post, processing, errors } = useForm({
        trader_id: '',
        products: [{ product_id: '', quantity: 1 }],
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sortField, setSortField] = useState('SaleDate');
    const [sortOrder, setSortOrder] = useState('desc');

    const handleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const sortedSales = [...sales].sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        if (sortOrder === 'asc') {
            return fieldA > fieldB ? 1 : -1;
        } else {
            return fieldA < fieldB ? 1 : -1;
        }
    });

    // لوجيك إنشاء الفاتورة داخل المودال
    const addProduct = () => {
        setData('products', [...data.products, { product_id: '', quantity: 1 }]);
    };

    const removeProduct = (index) => {
        if (data.products.length > 1) {
            const newProducts = [...data.products];
            newProducts.splice(index, 1);
            setData('products', newProducts);
        }
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...data.products];
        newProducts[index][field] = field === 'quantity' ? Number(value) : value;
        setData('products', newProducts);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('sales.store'), {
            onSuccess: () => setShowCreateModal(false),
        });
    };

    // تنسيق الـ options للتجار
    const traderOptions = [
        { value: '', label: 'اختر تاجر' },
        ...traders.map((trader) => ({
            value: trader.TraderID,
            label: trader.TraderName,
        })),
    ];

    // تنسيق الـ options للمنتجات
    const productOptions = [
        { value: '', label: 'اختر منتج' },
        ...products.map((p) => ({
            value: p.ProductID,
            label: `${p.ProductName} - المتوفر: ${p.StockQuantity}`,
        })),
    ];

    return (
        <>
            <Head title="المبيعات" />
            <Navbar />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">قائمة المبيعات</h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            >
                                إضافة عملية بيع جديدة
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th
                                            className="px-6 py-3 cursor-pointer"
                                            onClick={() => handleSort('SaleDate')}
                                        >
                                            التاريخ {sortField === 'SaleDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th
                                            className="px-6 py-3 cursor-pointer"
                                            onClick={() => handleSort('TotalAmount')}
                                        >
                                            المبلغ {sortField === 'TotalAmount' && (sortOrder === 'asc' ? '▲' : '▼')}
                                        </th>
                                        <th className="px-6 py-3">رقم الفاتورة</th>
                                        <th className="px-6 py-3">التاجر</th>
                                        <th className="px-6 py-3">المنتجات</th>
                                        <th className="px-6 py-3">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSales.length > 0 ? (
                                        sortedSales.map((sale) => (
                                            <tr key={sale.SaleID} className="border-t">
                                                <td className="px-6 py-4">
                                                    {new Date(sale.SaleDate).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sale.TotalAmount.toLocaleString('ar-EG')} ج.م
                                                </td>
                                                <td className="px-6 py-4">INV-{sale.SaleID}</td>
                                                <td className="px-6 py-4">
                                                    {sale.trader?.TraderName || 'غير معروف'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sale.sale_details?.map((detail) => (
                                                        <div key={detail.SaleDetailID}>
                                                            {detail.product?.ProductName || 'غير معروف'} -{' '}
                                                            {detail.quantity} x {detail.UnitPrice} ج.م
                                                            <div className="text-sm text-gray-500">
                                                                المجموع: {detail.SubTotal} ج.م
                                                            </div>
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded ${
                                                            sale.PaidAmount >= sale.TotalAmount
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {sale.PaidAmount >= sale.TotalAmount
                                                            ? 'مدفوع'
                                                            : 'غير مدفوع'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center">
                                                لا توجد فواتير
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md relative">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            إنشاء فاتورة جديدة
                        </h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* اختيار التاجر */}
                            <div>
                                <InputLabel htmlFor="trader_id" value="التاجر" />
                                <SelectInput
                                    id="trader_id"
                                    name="trader_id"
                                    className="mt-1 block w-full text-gray-600 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={data.trader_id}
                                    onChange={(e) => setData('trader_id', e.target.value)}
                                    options={traderOptions}
                                    required
                                />
                                {errors.trader_id && (
                                    <p className="text-red-500 mt-1">{errors.trader_id}</p>
                                )}
                            </div>

                            {/* المنتجات */}
                            {data.products.map((product, index) => (
                                <div key={index} className="flex space-x-4 items-end">
                                    <div className="flex-1">
                                        <InputLabel
                                            htmlFor={`product_id_${index}`}
                                            value="المنتج"
                                        />
                                        <SelectInput
                                            id={`product_id_${index}`}
                                            name={`products[${index}][product_id]`}
                                            className="mt-1 block w-full text-gray-600 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                            value={product.product_id}
                                            onChange={(e) =>
                                                handleProductChange(index, 'product_id', e.target.value)
                                            }
                                            options={productOptions}
                                            required
                                        />
                                    </div>

                                    <div className="w-32">
                                        <InputLabel
                                            htmlFor={`quantity_${index}`}
                                            value="الكمية"
                                        />
                                        <TextInput
                                            id={`quantity_${index}`}
                                            name={`products[${index}][quantity]`}
                                            type="number"
                                            className="mt-1 block w-full text-gray-600 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                            value={product.quantity}
                                            onChange={(e) =>
                                                handleProductChange(index, 'quantity', e.target.value)
                                            }
                                            min="1"
                                            required
                                        />
                                    </div>

                                    {data.products.length > 1 && (
                                        <PrimaryButton
                                            type="button"
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                            onClick={() => removeProduct(index)}
                                        >
                                            حذف
                                        </PrimaryButton>
                                    )}
                                </div>
                            ))}

                            {/* أزرار التحكم */}
                            <div className="flex space-x-4">
                                <PrimaryButton
                                    type="button"
                                    onClick={addProduct}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    إضافة منتج
                                </PrimaryButton>
                                <PrimaryButton
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:bg-gray-400"
                                >
                                    {processing ? 'جاري الحفظ...' : 'إنشاء الفاتورة'}
                                </PrimaryButton>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                                >
                                    إلغاء
                                </button>
                            </div>

                            {/* عرض الأخطاء */}
                            {errors.products && (
                                <p className="text-red-500 text-sm">{errors.products}</p>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
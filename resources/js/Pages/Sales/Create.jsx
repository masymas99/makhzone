import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function SalesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        trader_id: '',
        products: [{ product_id: '', quantity: 1 }],
        payment_amount: '',
    });

    const { props: { traders = [], products = [] } } = usePage();

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

    const handleProductSelect = (index, productId) => {
        const selectedProduct = products.find(p => p.ProductID === parseInt(productId));
        if (selectedProduct) {
            const updatedProducts = [...data.products];
            const productIdNumber = parseInt(productId, 10);
            updatedProducts[index] = {
                product_id: productIdNumber,
                quantity: 1,
                unit_price: selectedProduct.UnitPrice || 0,
                stock_quantity: selectedProduct.StockQuantity || 0
            };
            setData('products', updatedProducts);
        }
    };

    const handleQuantityChange = (index, value) => {
        const updatedProducts = [...data.products];
        const currentProduct = updatedProducts[index];
        const newQuantity = Math.max(Number(value), 1);
        updatedProducts[index] = {
            ...currentProduct,
            quantity: newQuantity
        };
        setData('products', updatedProducts);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('sales.store'), {
            onSuccess: () => {
                alert('تمت إضافة الفاتورة بنجاح');
                setData({
                    trader_id: '',
                    products: [{ product_id: '', quantity: 1 }],
                    payment_amount: '',
                });
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).join('. ');
                alert(`خطأ: ${errorMessages}`);
            },
        });
    };

    const calculateTotal = () => {
        return data.products.reduce((total, product) => {
            if (!product.unit_price) return total;
            return total + (Number(product.unit_price) * Number(product.quantity || 0));
        }, 0);
    };

    const traderOptions = [{ value: '', label: 'اختر تاجر' }, ...traders.map(t => ({
        value: t.TraderID,
        label: t.TraderName,
        data: t
    }))];

    const productOptions = [{ value: '', label: 'اختر منتج' }, ...products.map(p => ({
        value: String(p.ProductID),
        label: `${p.ProductName} (المتوفر: ${p.StockQuantity || 0}) - ${p.UnitPrice || 0} ر.س/وحدة`,
        data: p
    }))];

    return (
        <>
            <Head title="إضافة فاتورة بيع" />
            <Navbar />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">إضافة فاتورة بيع جديدة</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="trader_id" value="التاجر" />
                                <SelectInput
                                    id="trader_id"
                                    name="trader_id"
                                    value={data.trader_id}
                                    onChange={(e) => setData('trader_id', e.target.value)}
                                    options={traderOptions}
                                    className="w-full"
                                    error={errors.trader_id}
                                />
                            </div>

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
                                            value={product.product_id}
                                            onChange={(e) => handleProductSelect(index, e.target.value)}
                                            options={productOptions}
                                            className="w-full"
                                            error={errors[`products.${index}.product_id`]}
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
                                            value={product.quantity}
                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            min="1"
                                            max={product.stock_quantity || 1000}
                                            className="w-full"
                                            error={errors[`products.${index}.quantity`]}
                                        />
                                        <span className="text-sm text-gray-500">المتاح: {product.stock_quantity || 0}</span>
                                    </div>

                                    {data.products.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            حذف
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div>
                                <InputLabel htmlFor="payment_amount" value="المبلغ المدفوع" />
                                <TextInput
                                    id="payment_amount"
                                    name="payment_amount"
                                    value={data.payment_amount}
                                    onChange={(e) => setData('payment_amount', e.target.value)}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full"
                                    error={errors.payment_amount}
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-gray-700">
                                    <p>المبلغ الإجمالي: <span className="font-bold">{calculateTotal().toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span></p>
                                    <p>المتبقي: <span className="font-bold">{Math.max(calculateTotal() - (Number(data.payment_amount) || 0), 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span></p>
                                </div>

                                <div className="flex space-x-4">
                                    <PrimaryButton
                                        type="button"
                                        onClick={addProduct}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        + إضافة منتج
                                    </PrimaryButton>

                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {processing ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
                                    </PrimaryButton>
                                    <PrimaryButton
                                        type="button"
                                        onClick={() => window.location.href = route('sales.index')}
                                        className="bg-gray-600 hover:bg-gray-700"
                                    >
                                        إلغاء
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

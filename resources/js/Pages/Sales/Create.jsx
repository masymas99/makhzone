import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

const Create = ({ traders = [], products = [] }) => {
    const { data, setData, post, processing, errors } = useForm({
        trader_id: '',
        products: [{ product_id: '', quantity: 1 }],
    });

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
        post(route('sales.store'));
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
            label: p.ProductName,
        })),
    ];

    return (
        <>
<Navbar/>
            <Head title="إنشاء فاتورة جديدة" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* اختيار التاجر */}
                        <div>
                            <InputLabel htmlFor="trader_id" value="التاجر" />
                            <SelectInput
                                id="trader_id"
                                name="trader_id"
                                className="mt-1 block w-full"
                                value={data.trader_id}
                                onChange={(e) => setData('trader_id', e.target.value)}
                                options={traderOptions}
                                required
                            />
                        </div>

                        {/* المنتجات */}
                        {data.products.map((product, index) => (
                            <div key={index} className="flex space-x-4 items-end">
                                <div className="flex-1">
                                    <InputLabel htmlFor={`product_id_${index}`} value="المنتج" />
                                    <SelectInput
                                        id={`product_id_${index}`}
                                        name={`products[${index}][product_id]`}
                                        className="mt-1 block w-full"
                                        value={product.product_id}
                                        onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                                        options={productOptions}
                                        required
                                    />
                                </div>

                                <div className="w-32">
                                    <InputLabel htmlFor={`quantity_${index}`} value="الكمية" />
                                    <TextInput
                                        id={`quantity_${index}`}
                                        name={`products[${index}][quantity]`}
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={product.quantity}
                                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                        min="1"
                                        required
                                    />
                                </div>

                                {data.products.length > 1 && (
                                    <PrimaryButton
                                        type="button"
                                        className="bg-red-500"
                                        onClick={() => removeProduct(index)}
                                    >
                                        حذف
                                    </PrimaryButton>
                                )}
                            </div>
                        ))}

                        {/* أزرار التحكم */}
                        <div className="flex space-x-4">
                            <PrimaryButton type="button" onClick={addProduct}>
                                إضافة منتج
                            </PrimaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                إنشاء الفاتورة
                            </PrimaryButton>
                        </div>

                        {/* عرض الأخطاء */}
                        {errors.trader_id && <p className="text-red-500 text-sm">{errors.trader_id}</p>}
                        {errors.products && <p className="text-red-500 text-sm">{errors.products}</p>}
                    </form>
                </div>
            </div>
        </>
    );
};

export default Create;
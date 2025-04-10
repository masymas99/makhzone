import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function PurchasesShow({ purchase }) {
    const totalAmount = purchase.details.reduce((sum, detail) => 
        sum + (detail.quantity * detail.unit_cost), 0
    ).toFixed(2);

    return (
        <>
            <Head title={`عرض المشتريات #${purchase.id}`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">عرض المشتريات #{purchase.id}</h2>
                            <div className="flex space-x-4">
                                <Link 
                                    href={route('purchases.edit', purchase.id)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    تعديل
                                </Link>
                                <Link 
                                    href={route('purchases.index')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    العودة للقائمة
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">التاريخ</h3>
                                <p className="text-lg">{purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('ar-EG') : '---'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">رقم الفاتورة</h3>
                                <p className="text-lg">{purchase.invoice_number || '---'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">اسم المورد</h3>
                                <p className="text-lg">{purchase.supplier_name || '---'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-500 text-sm">إجمالي المبلغ</h3>
                                <p className="text-2xl font-bold">{parseFloat(totalAmount).toLocaleString('ar-EG')} ج.م</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3">رقم المنتج</th>
                                        <th className="px-6 py-3">اسم المنتج</th>
                                        <th className="px-6 py-3">الصنف</th>
                                        <th className="px-6 py-3">الكمية</th>
                                        <th className="px-6 py-3">سعر الشراء</th>
                                        <th className="px-6 py-3">سعر البيع</th>
                                        <th className="px-6 py-3">المبلغ الفرعي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchase.details.map((detail) => (
                                        <tr key={detail.product_id} className="border-t">
                                            <td className="px-6 py-4">{detail.product_id}</td>
                                            <td className="px-6 py-4">{detail.product_name || '---'}</td>
                                            <td className="px-6 py-4">{detail.category || '---'}</td>
                                            <td className="px-6 py-4">{detail.quantity}</td>
                                            <td className="px-6 py-4">{detail.unit_cost?.toLocaleString('ar-EG') || '---'} ج.م</td>
                                            <td className="px-6 py-4">{detail.unit_price?.toLocaleString('ar-EG') || '---'} ج.م</td>
                                            <td className="px-6 py-4">{(detail.quantity * detail.unit_cost).toLocaleString('ar-EG')} ج.م</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-gray-500 text-sm mb-2">الملاحظات</h3>
                            <p className="text-gray-700">{purchase.notes || 'لا توجد ملاحظات'}</p>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <Link 
                                href={route('purchases.index')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                العودة للقائمة
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

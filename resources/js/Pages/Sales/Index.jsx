import React from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import { FaTrash } from 'react-icons/fa';

export default function Index() {
    const { props } = usePage();
    const { sales, filters } = props;
    const [confirmDelete, setConfirmDelete] = React.useState(null);
    const { delete: deleteForm } = useForm();

    const handleDelete = async (saleId) => {
        if (confirmDelete === saleId) {
            try {
                // Show loading state
                setConfirmDelete(null);
                
                // Delete the sale
                await deleteForm(`/sales/${saleId}`);
                
                // Show success message
                window.dispatchEvent(new Event('refresh'));
            } catch (error) {
                console.error('Error deleting sale:', error);
                // Show error message
                window.dispatchEvent(new Event('error'));
            }
        } else {
            setConfirmDelete(saleId);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Head title="الفواتير المباعة" />

            <div className="container mx-auto px-4 py-8 mt-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">الفواتير المباعة</h1>
                    <Link
                        href={route('sales.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        إنشاء فاتورة جديدة
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاجر</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجمالي</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدفوع</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المتبقي</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sales?.map((sale) => (
                                    <tr key={sale.SaleID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.InvoiceNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.trader.TraderName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(sale.SaleDate).toLocaleDateString('ar-EG')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.TotalAmount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.PaidAmount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ color: sale.RemainingAmount > 0 ? 'red' : 'green' }}>
                                            {sale.RemainingAmount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.Status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    href={route('sales.edit', sale.SaleID)}
                                                    className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                                >
                                                    تعديل
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(sale.SaleID)}
                                                    className={`px-3 py-1 rounded ${
                                                        confirmDelete === sale.SaleID ? 'bg-red-700' : 'bg-red-600'
                                                    } text-white hover:bg-red-700`}
                                                >
                                                    {confirmDelete === sale.SaleID ? 'تأكيد الحذف' : 'حذف'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) || (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-gray-500">
                                            لا توجد فواتير حتى الآن
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

Index.layout = null;
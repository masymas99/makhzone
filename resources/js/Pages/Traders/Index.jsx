import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { FaPlus, FaSearch, FaFilter, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';
import Navbar from '@/Shared/Navbar';

export default function Index() {
    const { props } = usePage();
    const { traders } = props;
    const [search, setSearch] = useState('');
    const [filteredTraders, setFilteredTraders] = useState(traders);
    const [showFilters, setShowFilters] = useState(false);
    const [confirmDelete, setConfirmDelete] = React.useState(null);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = traders.filter(trader =>
            trader.TraderName.toLowerCase().includes(query) ||
            trader.Phone.toLowerCase().includes(query) ||
            trader.Address.toLowerCase().includes(query)
        );
        setFilteredTraders(filtered);
        setSearch(query);
    };

    const handleDelete = async (traderId) => {
        if (confirmDelete === traderId) {
            // Handle delete logic here
            setConfirmDelete(null);
        } else {
            setConfirmDelete(traderId);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="التجار" />
            <Navbar />
            <div className="pt-20 pb-12 px-6 max-w-7xl mx-auto">
                {/* Header and Actions */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <HiOutlineUserGroup className="text-3xl text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-900">قائمة التجار</h1>
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-md shadow-sm hover:bg-indigo-50 transition-colors duration-200"
                        >
                            <FaFilter className="mr-2" />
                            <span>فلترة</span>
                        </button>
                        <Link
                            href={route('traders.create')}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-200"
                        >
                            <FaPlus className="mr-2" />
                            <span>إضافة تاجر</span>
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="بحث عن تاجر..."
                            className="w-full py-3 px-12 text-right bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        />
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {showFilters && (
                        <div className="mt-4 p-6 bg-white border border-gray-200 rounded-md shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">خيارات الفلترة</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                                >
                                    إخفاء
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="الاسم"
                                    className="py-2 px-4 text-right bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="رقم الهاتف"
                                    className="py-2 px-4 text-right bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="العنوان"
                                    className="py-2 px-4 text-right bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Traders Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                                    الاسم
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                                    رقم الهاتف
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                                    العنوان
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                                    الرصيد
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                                    اجمالي مشترياته
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                                    اجمالي مدفوعاته
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTraders.map((trader) => (
                                <tr key={trader.TraderID} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {trader.TraderName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {trader.Phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {trader.Address}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {trader.Balance} ج.م
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {trader.TotalSales} ج.م
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {trader.TotalPayments} ج.م
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Link
                                                href={`/traders/${trader.TraderID}`}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                                            >
                                                <FaEye className="h-4 w-4" />
                                                عرض
                                            </Link>
                                            <Link
                                                href={`/traders/${trader.TraderID}/edit`}
                                                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-1"
                                            >
                                                <FaEdit className="h-4 w-4" />
                                                تعديل
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(trader.TraderID)}
                                                className={`px-3 py-1 rounded flex items-center gap-1 ${
                                                    confirmDelete === trader.TraderID ? 'bg-red-700' : 'bg-red-600'
                                                } text-white hover:bg-red-700`}
                                            >
                                                <FaTrash className="h-4 w-4" />
                                                {confirmDelete === trader.TraderID ? 'تأكيد الحذف' : 'حذف'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
                {/* Header and Actions */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <HiOutlineUserGroup className="text-3xl text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-900">قائمة التجار</h1>
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-full shadow-sm hover:bg-indigo-50 transition-all duration-200"
                        >
                            <FaFilter className="mr-2" />
                            <span>فلترة</span>
                        </button>
                        <Link
                            href={route('traders.create')}
                            className="flex items-center px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200"
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
                            className="w-full py-3 px-12 text-right bg-white border-2 border-gray-300 rounded-xl shadow-sm focus:border-indigo-600 focus:ring-indigo-600 text-gray-900 text-base transition-all duration-200"
                        />
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {showFilters && (
                        <div className="mt-4 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">خيارات الفلترة</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 transition-all duration-200"
                                >
                                    إخفاء
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="الاسم"
                                    className="py-3 px-4 text-right bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 text-base"
                                />
                                <input
                                    type="text"
                                    placeholder="رقم الهاتف"
                                    className="py-3 px-4 text-right bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 text-base"
                                />
                                <input
                                    type="text"
                                    placeholder="العنوان"
                                    className="py-3 px-4 text-right bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 text-base"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Traders Cards */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {filteredTraders.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTraders.map((trader) => (
                                <div
                                    key={trader.TraderID}
                                    className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                                >
                                    <div className="mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{trader.TraderName}</h3>
                                        <p className="text-sm text-gray-500">{trader.Phone}</p>
                                    </div>
                                    <div className="text-gray-700 text-base mb-3">
                                        <p>العنوان: {trader.Address}</p>
                                        <p className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                                            trader.Balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            الرصيد: {trader.Balance >= 0 ? '+' : '-'}
                                            {Math.abs(trader.Balance)} ج.م
                                        </p>
                                        <p>إجمالي المشتريات: {trader.TotalSales} ج.م</p>
                                        <p>إجمالي المدفوعات: {trader.TotalPayments} ج.م</p>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            href={`/traders/${trader.TraderID}`}
                                            className="text-green-600 hover:text-green-800 p-1"
                                        >
                                            <FaEye className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href={`/traders/${trader.TraderID}/edit`}
                                            className="text-yellow-600 hover:text-yellow-800 p-1"
                                        >
                                            <FaEdit className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(trader.TraderID)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                        >
                                            <FaTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-6 6l6-6M5 12h14M12 5v14" />
                            </svg>
                            لا توجد تجار مسجلين حاليًا
                        </div>
                    )}
                </div>

                {/* مودال تأكيد الحذف */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="text-gray-500 hover:text-gray-700 text-xl font-bold focus:outline-none"
                                >
                                    ×
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6 text-center">هل أنت متأكد من حذف هذا التاجر؟</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDelete)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-all duration-200"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
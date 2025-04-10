import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

const Create = () => {
  const { data, setData, post, processing, errors } = useForm({
    TraderName: '',
    Phone: '',
    Address: '',
    IsActive: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('traders.store'));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head title="إضافة تاجر جديد" />
      <Navbar />
      <div className="pt-20 pb-12 px-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <span>إضافة تاجر جديد</span>
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">اسم التاجر</label>
              <input
                type="text"
                value={data.TraderName}
                onChange={(e) => setData('TraderName', e.target.value)}
                className="w-full py-3 px-4 text-right bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
              {errors.TraderName && (
                <p className="text-red-500 text-sm mt-1">{errors.TraderName}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">الهاتف</label>
              <input
                type="text"
                value={data.Phone}
                onChange={(e) => setData('Phone', e.target.value)}
                className="w-full py-3 px-4 text-right bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
              {errors.Phone && (
                <p className="text-red-500 text-sm mt-1">{errors.Phone}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">العنوان</label>
              <textarea
                value={data.Address}
                onChange={(e) => setData('Address', e.target.value)}
                className="w-full py-3 px-4 text-right bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 min-h-[100px]"
              />
              {errors.Address && (
                <p className="text-red-500 text-sm mt-1">{errors.Address}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">الحالة</label>
              <select
                value={data.IsActive}
                onChange={(e) => setData('IsActive', e.target.value === 'true')}
                className="w-full py-3 px-4 text-right bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <option value={true}>نشط</option>
                <option value={false}>غير نشط</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {processing ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Create;
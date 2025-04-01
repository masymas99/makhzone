import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

const Create = () => {
  const { data, setData, post, processing, errors } = useForm({
    TraderName: '',
    Phone: '',
    Address: '',
    IsActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('traders.store'));
  };

  return (
    <>
      <Head title="إضافة تاجر جديد" />
      <Navbar />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <h1 className="text-xl font-semibold mb-6">إضافة تاجر جديد</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">اسم التاجر</label>
                <input
                  type="text"
                  value={data.TraderName}
                  onChange={(e) => setData('TraderName', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                {errors.TraderName && <p className="text-red-500 text-sm mt-1">{errors.TraderName}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2">الهاتف</label>
                <input
                  type="text"
                  value={data.Phone}
                  onChange={(e) => setData('Phone', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                {errors.Phone && <p className="text-red-500 text-sm mt-1">{errors.Phone}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2">العنوان</label>
                <textarea
                  value={data.Address}
                  onChange={(e) => setData('Address', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                {errors.Address && <p className="text-red-500 text-sm mt-1">{errors.Address}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2">الحالة</label>
                <select
                  value={data.IsActive}
                  onChange={(e) => setData('IsActive', e.target.value === 'true')}
                  className="w-full p-2 border rounded"
                >
                  <option value={true}>نشط</option>
                  <option value={false}>غير نشط</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {processing ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Create;
import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

const Edit = ({ trader }) => {
  const [showEditModal, setShowEditModal] = useState(true);
  const { data: formData, setData, put, processing, errors } = useForm({
    TraderName: trader.TraderName,
    Phone: trader.Phone,
    Address: trader.Address,
    IsActive: trader.IsActive
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('traders.update', trader.TraderID));
  };

  return (
    <>
      <Head title="تعديل التاجر" />
      <Navbar />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold mb-4">تعديل بيانات التاجر</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block mb-2">اسم التاجر</label>
                    <input
                      type="text"
                      value={formData.TraderName}
                      onChange={(e) => setData('TraderName', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <label className="block mb-2">الهاتف</label>
                    <input
                      type="text"
                      value={formData.Phone}
                      onChange={(e) => setData('Phone', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <label className="block mb-2">العنوان</label>
                    <textarea
                      value={formData.Address}
                      onChange={(e) => setData('Address', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <label className="block mb-2">الحالة</label>
                    <select
                      value={formData.IsActive}
                      onChange={(e) => setData('IsActive', e.target.value === 'true')}
                      className="w-full p-2 border rounded"
                    >
                      <option value={true}>نشط</option>
                      <option value={false}>غير نشط</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => router.visit(route('traders.index'))}
                      className="px-4 py-2 border rounded"
                    >
                      إلغاء
                    </button>
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
          )}
        </div>
      </div>
    </>
  );
};

export default Edit;
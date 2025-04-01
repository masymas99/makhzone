import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

const Index = ({ traders }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [currentTrader, setCurrentTrader] = useState({
    TraderName: '',
    Phone: '',
    Address: '',
    IsActive: true,
    TraderID: null
  });

  const updateEditData = (newData) => {
    setData({
      ...data,
      ...newData,
      TraderName: newData.TraderName || '',
      Phone: newData.Phone || '',
      Address: newData.Address || ''
    });
  };

  const { data, setData, post, put, processing, errors } = useForm({
    ...currentTrader
  });



  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('traders.store'));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    put(route('traders.update', { trader: data.TraderID }), {
  ...data,
  IsActive: Boolean(data.IsActive)
}, {
      onSuccess: () => {
        setShowEditModal(false);
        router.reload();
      },
      onError: (errors) => {
        alert('حدث خطأ أثناء الحفظ: ' + JSON.stringify(errors));
      }
    });
  };

  return (
  <>
    <Head title="إدارة التجار" />
    <Navbar />
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <h1 className="text-xl font-semibold">إدارة التجار</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              إضافة تاجر جديد
            </button>
            {(showCreateModal || showEditModal) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-96">
                  <h3 className="text-lg font-semibold mb-4">{showCreateModal ? 'إضافة تاجر جديد' : 'تعديل بيانات التاجر'}</h3>
                  <form onSubmit={showCreateModal ? handleSubmit : handleEditSubmit}>
                    <div className="mb-4">
                      <label className="block mb-2">اسم التاجر</label>
                      <input
                        type="text"
                        value={data.TraderName}
                        onChange={(e) => setData('TraderName', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      {errors.Address && <p className="text-red-500 text-sm">{errors.Address}</p>}
                      {errors.Phone && <p className="text-red-500 text-sm">{errors.Phone}</p>}
                      {errors.TraderName && <p className="text-red-500 text-sm">{errors.TraderName}</p>}
                      <label className="block mb-2">الهاتف</label>
                      <input
                        type="text"
                        value={data.Phone}
                        onChange={(e) => setData('Phone', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      {errors.Phone && <p className="text-red-500 text-sm">{errors.Phone}</p>}
                      {errors.TraderName && <p className="text-red-500 text-sm">{errors.TraderName}</p>}
                      <label className="block mb-2">العنوان</label>
                      <textarea
                        value={data.Address}
                        onChange={(e) => showCreateModal ? setData('Address', e.target.value) : updateEditData({ Address: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                      {errors.Address && <p className="text-red-500 text-sm">{errors.Address}</p>}
                      {errors.Phone && <p className="text-red-500 text-sm">{errors.Phone}</p>}
                      {errors.TraderName && <p className="text-red-500 text-sm">{errors.TraderName}</p>}
                      <label className="block mb-2">الحالة</label>
                      <select
                        value={data.IsActive}
                        onChange={(e) => setData('IsActive', e.target.value === 'true')}
                        className="w-full p-2 border rounded"
                      >
                      {errors.IsActive && <p className="text-red-500 text-sm">{errors.IsActive}</p>}
                        <option value={true}>نشط</option>
                        <option value={false}>غير نشط</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
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
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-right">الاسم</th>
                  <th className="px-6 py-3 text-right">الهاتف</th>
                  <th className="px-6 py-3 text-right">العنوان</th>
                  <th className="px-6 py-3 text-right">الحالة</th>
                  <th className="px-6 py-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {traders.map(trader => (
                  <tr key={trader.TraderID} className="border-t">
                    <td className="px-6 py-4">{trader.TraderName}</td>
                    <td className="px-6 py-4">{trader.Phone}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{trader.Address}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded ${trader.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {trader.IsActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => {
                          updateEditData({
                            TraderName: trader.TraderName,
                            Phone: trader.Phone,
                            Address: trader.Address,
                            IsActive: trader.IsActive,
                            TraderID: trader.TraderID
                          });
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        تعديل
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا التاجر؟')) {
                            Inertia.delete(route('traders.destroy', { trader: trader.TraderID }), {
  onSuccess: () => router.reload()
});
                          }
                        }}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </>

);
}

export default Index;
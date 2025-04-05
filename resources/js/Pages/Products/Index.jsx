import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function ProductsIndex() {
  const { products } = usePage().props;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: formData, setData, post, put, delete: destroy, processing, errors } = useForm({
    ProductName: '',
    Category: 'أغذية',
    StockQuantity: 0,
    UnitPrice: 0,
    UnitCost: 0,
    IsActive: true,
    description: ''
  });

  // Initialize form data when editing
  useEffect(() => {
    if (selectedProduct) {
      setData('ProductName', selectedProduct.ProductName);
      setData('Category', selectedProduct.Category);
      setData('StockQuantity', selectedProduct.StockQuantity);
      setData('UnitPrice', selectedProduct.UnitPrice);
      setData('UnitCost', selectedProduct.UnitCost);
      setData('IsActive', selectedProduct.IsActive);
      setData('description', selectedProduct.description || '');
    }
  }, [selectedProduct, setData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    selectedProduct 
      ? put(route('products.update', selectedProduct.ProductID)) 
      : post(route('products.store'));
  };

  return (
    <>
      <Head title="المنتجات" />
      <Navbar />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">قائمة المنتجات</h2>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setSelectedProduct(null);
                  setData({
                    ProductName: '',
                    Category: 'أغذية',
                    StockQuantity: 0,
                    UnitPrice: 0,
                    UnitCost: 0,
                    IsActive: true,
                    description: ''
                  });
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                إضافة منتج جديد
              </button>
            </div>

            <table className="w-full text-right">
              <thead>
                <tr className="border-b">
                  <th className="pb-2">الاسم</th>
                  <th className="pb-2">الفئة</th>
                  <th className="pb-2">الكمية</th>
                  <th className="pb-2">سعر الوحدة</th>
                  <th className="pb-2">تكلفة الوحدة</th>
                  <th className="pb-2">الحالة</th>
                  <th className="pb-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.ProductID} className="border-b">
                    <td className="py-3">{product.ProductName}</td>
                    <td className="py-3">{product.Category}</td>
                    <td className="py-3">{product.StockQuantity}</td>
                    <td className="py-3">{product.UnitPrice}</td>
                    <td className="py-3">{product.UnitCost}</td>
                    <td className="py-3">{product.IsActive ? 'نشط' : 'غير نشط'}</td>
                    <td className="py-3 space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => destroy(route('products.destroy', product.ProductID))}
                        className="text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Modal for Create/Edit */}
            {(showCreateModal || showEditModal) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-96">
                  <h3 className="text-lg font-semibold mb-4">
                    {selectedProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block mb-2">اسم المنتج</label>
                      <input
                        type="text"
                        value={formData.ProductName}
                        onChange={(e) => setData('ProductName', e.target.value)}
                      />
                      <label className="block mb-2">الفئة</label>
                      <select
                        value={formData.Category}
                        onChange={(e) => setData('Category', e.target.value)}
                      >
                        <option value="أغذية">أغذية</option>
                        <option value="مشروبات">مشروبات</option>
                        <option value="مواد تنظيف">مواد تنظيف</option>
                      </select>
                      <label className="block mb-2">الكمية في المخزن</label>
                      <input
                        type="number"
                        value={formData.StockQuantity}
                        onChange={(e) => setData('StockQuantity', e.target.value)}
                      />
                      <label className="block mb-2">سعر الوحدة</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.UnitPrice}
                        onChange={(e) => setData('UnitPrice', e.target.value)}
                      />
                      <label className="block mb-2">تكلفة الوحدة</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.UnitCost}
                        onChange={(e) => setData('UnitCost', e.target.value)}
                      />
                      <label className="block mb-2">الحالة</label>
                      <select
                        value={formData.IsActive}
                        onChange={(e) => setData('IsActive', e.target.value === 'true')}
                      >
                        <option value={true}>نشط</option>
                        <option value={false}>غير نشط</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2">الوصف</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setShowEditModal(false);
                          setSelectedProduct(null);
                        }}
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
      </div>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

export default function ProductsIndex() {
  const { products, links, purchases } = usePage().props;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Calculate total purchases in frontend
  const totalPurchases = purchases.reduce((total, purchase) => {
    return total + parseFloat(purchase.TotalAmount);
  }, 0).toFixed(2);

  const { data: formData, setData, post, put, delete: destroy, processing, errors } = useForm({
    ProductName: '',
    Category: 'أغذية',
    StockQuantity: 0,
    UnitPrice: 0,
    UnitCost: 0,
    IsActive: true,
    description: '',
    product_id: null,
    SupplierName: ''
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
      setData('product_id', selectedProduct.ProductID);
      setData('SupplierName', ''); // Reset supplier name for new quantity
    }
  }, [selectedProduct, setData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      ProductName: formData.ProductName,
      Category: formData.Category,
      StockQuantity: formData.StockQuantity,
      UnitCost: formData.UnitCost,
      UnitPrice: formData.UnitPrice,
      IsActive: formData.IsActive,
      product_id: formData.product_id,
      SupplierName: formData.SupplierName
    };

    if (formData.product_id) {
      post(route('products.store'), data, {
        onSuccess: () => {
          setShowCreateModal(false);
          setSelectedProduct(null);
          setData({ product_id: null });
        },
        onError: (errors) => {
          console.error('Validation errors:', errors);
        }
      });
    } else {
      post(route('products.store'), data, {
        onSuccess: () => {
          setShowCreateModal(false);
          setSelectedProduct(null);
          setData({ product_id: null });
        },
        onError: (errors) => {
          console.error('Validation errors:', errors);
        }
      });
    }
  };

  const handleAddQuantity = (product) => {
    setSelectedProduct(product);
    setShowCreateModal(true);
    setData({
      ProductName: product.ProductName,
      Category: product.Category,
      StockQuantity: 0,
      UnitCost: 0,
      UnitPrice: product.UnitPrice,
      IsActive: product.IsActive,
      description: product.description || '',
      product_id: product.ProductID,
      SupplierName: '' // Reset supplier name for new quantity
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      destroy(route('products.destroy', id), {
        onSuccess: () => {
          console.log('Product deleted successfully');
        },
        onError: (errors) => {
          console.error('Delete error:', errors);
        }
      });
    }
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
              <div className="flex space-x-2">
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
                      description: '',
                      product_id: null,
                      SupplierName: ''
                    });
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  إضافة منتج جديد
                </button>
              </div>
            </div>

            {errors && Object.keys(errors).length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <ul>
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={''}
                  onChange={(e) => {}}
                  placeholder="بحث..."
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold">قائمة المشتريات</h2>
                <p className="text-lg">إجمالي المشتريات: {totalPurchases} ج.م</p>
              </div>
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
                {products && products.map((product) => (
                  <tr key={product.ProductID} className="border-b">
                    <td className="py-3">{product.ProductName}</td>
                    <td className="py-3">{product.Category}</td>
                    <td className="py-3">{product.StockQuantity}</td>
                    <td className="py-3">{product.UnitPrice}</td>
                    <td className="py-3">{product.UnitCost}</td>
                    <td className="py-3">{product.IsActive ? 'نشط' : 'غير نشط'}</td>
                    <td className="py-3 space-x-2">
                      <button
                        onClick={() => handleAddQuantity(product)}
                        className="text-green-600 hover:text-green-800"
                      >
                        إضافة كمية
                      </button>
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
                        onClick={() => handleDelete(product.ProductID)}
                        className="text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <h3 className="text-lg font-semibold mb-4">
                    {formData.product_id ? 'إضافة كمية لمنتج' : 'إضافة/تعديل منتج'}
                  </h3>
                  
                  <form onSubmit={handleSubmit}>
                    {formData.product_id && (
                      <div className="mb-4">
                        <label className="block mb-2">المنتج الحالي</label>
                        <div className="p-2 border rounded bg-gray-50">
                          {selectedProduct?.ProductName}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block mb-2">اسم المنتج</label>
                      <input
                        type="text"
                        value={formData.ProductName}
                        onChange={(e) => setData('ProductName', e.target.value)}
                        disabled={formData.product_id}
                        className="w-full p-2 border rounded"
                      />
                      {errors?.ProductName && (
                        <p className="text-red-500 text-sm mt-1">{errors.ProductName}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">الفئة</label>
                      <select
                        value={formData.Category}
                        onChange={(e) => setData('Category', e.target.value)}
                        disabled={formData.product_id}
                        className="w-full p-2 border rounded"
                      >
                        <option value="أغذية">أغذية</option>
                        <option value="مشروبات">مشروبات</option>
                        <option value="مواد تنظيف">مواد تنظيف</option>
                      </select>
                      {errors?.Category && (
                        <p className="text-red-500 text-sm mt-1">{errors.Category}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">الكمية</label>
                      <input
                        type="number"
                        value={formData.StockQuantity}
                        onChange={(e) => setData('StockQuantity', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      {errors?.StockQuantity && (
                        <p className="text-red-500 text-sm mt-1">{errors.StockQuantity}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">تكلفة الوحدة</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.UnitCost}
                        onChange={(e) => setData('UnitCost', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      {errors?.UnitCost && (
                        <p className="text-red-500 text-sm mt-1">{errors.UnitCost}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">سعر الوحدة</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.UnitPrice}
                        onChange={(e) => setData('UnitPrice', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      {errors?.UnitPrice && (
                        <p className="text-red-500 text-sm mt-1">{errors.UnitPrice}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">اسم المورد</label>
                      <input
                        type="text"
                        value={formData.SupplierName}
                        onChange={(e) => setData('SupplierName', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      {errors?.SupplierName && (
                        <p className="text-red-500 text-sm mt-1">{errors.SupplierName}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">الحالة</label>
                      <select
                        value={formData.IsActive}
                        onChange={(e) => setData('IsActive', e.target.value === 'true')}
                        className="w-full p-2 border rounded"
                      >
                        <option value={true}>نشط</option>
                        <option value={false}>غير نشط</option>
                      </select>
                      {errors?.IsActive && (
                        <p className="text-red-500 text-sm mt-1">{errors.IsActive}</p>
                      )}
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
                          setData({ product_id: null });
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
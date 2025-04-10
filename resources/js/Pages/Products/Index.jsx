import React, { useState, useEffect, useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import { FaPlus, FaSearch } from 'react-icons/fa';

// دالة Debounce مخصصة
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

export default function ProductsIndex() {
  const { products = [], links = [], purchases = [] } = usePage().props;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm) return products;
    return products.filter((product) =>
      product.ProductName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [products, debouncedSearchTerm]);

  const totalPurchases = purchases.reduce((total, purchase) => {
    return total + parseFloat(purchase.TotalAmount);
  }, 0).toFixed(2);

  const { data: formData, setData, post, put, delete: destroy, processing, errors } = useForm({
    ProductName: '',
    StockQuantity: 0,
    UnitPrice: 0,
    UnitCost: 0,
    IsActive: true,
    description: '',
    product_id: null,
    SupplierName: '',
  });

  useEffect(() => {
    if (selectedProduct) {
      setData({
        ProductName: selectedProduct.ProductName,
        StockQuantity: selectedProduct.StockQuantity,
        UnitPrice: selectedProduct.UnitPrice,
        UnitCost: selectedProduct.UnitCost,
        IsActive: selectedProduct.IsActive,
        description: selectedProduct.description || '',
        product_id: selectedProduct.ProductID,
        SupplierName: '',
      });
    }
  }, [selectedProduct, setData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ProductName: formData.ProductName,
      StockQuantity: formData.StockQuantity,
      UnitCost: formData.UnitCost,
      UnitPrice: formData.UnitPrice,
      IsActive: formData.IsActive,
      product_id: formData.product_id,
      SupplierName: formData.SupplierName,
      description: formData.description,
    };

    if (formData.product_id) {
      put(route('products.update', formData.product_id), {
        onSuccess: () => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedProduct(null);
          setData({ product_id: null });
        },
        onError: (errors) => console.error('Validation errors:', errors),
      });
    } else {
      post(route('products.store'), {
        onSuccess: () => {
          setShowCreateModal(false);
          setSelectedProduct(null);
          setData({ product_id: null });
        },
        onError: (errors) => console.error('Validation errors:', errors),
      });
    }
  };

  const handleAddQuantity = (product) => {
    setSelectedProduct(product);
    setShowCreateModal(true);
    setData({
      ProductName: product.ProductName,
      StockQuantity: 0,
      UnitCost: 0,
      UnitPrice: product.UnitPrice,
      IsActive: product.IsActive,
      description: product.description || '',
      product_id: product.ProductID,
      SupplierName: '',
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      destroy(route('products.destroy', id), {
        onSuccess: () => console.log('Product deleted successfully'),
        onError: (errors) => console.error('Delete error:', errors),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head title="المنتجات" />
      <Navbar />
      <div className="pt-20 pb-12 px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">قائمة المنتجات</h2>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setSelectedProduct(null);
                setData({
                  ProductName: '',
                  StockQuantity: 0,
                  UnitPrice: 0,
                  UnitCost: 0,
                  IsActive: true,
                  description: '',
                  product_id: null,
                  SupplierName: '',
                });
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-200"
            >
              <FaPlus className="mr-2" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          {errors && Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              <ul className="list-disc list-inside">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <div className="relative w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث عن منتج..."
                className="w-full py-3 px-4 pr-10 text-right bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">الكمية</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">سعر الوحدة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">تكلفة الوحدة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.ProductID} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{product.ProductName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.StockQuantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.UnitPrice}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.UnitCost}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.IsActive ? 'نشط' : 'غير نشط'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3 space-x-reverse">
                          <button onClick={() => handleAddQuantity(product)} className="text-green-500 hover:text-green-700 transition-colors duration-200">إضافة كمية</button>
                          <button onClick={() => { setSelectedProduct(product); setShowEditModal(true); }} className="text-yellow-500 hover:text-yellow-700 transition-colors duration-200">تعديل</button>
                          <button onClick={() => handleDelete(product.ProductID)} className="text-red-500 hover:text-red-700 transition-colors duration-200">حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">لا توجد منتجات تطابق البحث</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {(showCreateModal || showEditModal) && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl transform transition-all duration-300 ease-out">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {showEditModal ? 'تعديل منتج' : showCreateModal && formData.product_id ? 'إضافة كمية لمنتج' : 'إضافة منتج جديد'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedProduct(null);
                      setData({ product_id: null });
                    }}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {formData.product_id && showCreateModal && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-800 truncate">المنتج الحالي</p>
                          <p className="mt-1 text-sm text-blue-600 truncate">{selectedProduct?.ProductName}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج</label>
                      <input
                        type="text"
                        value={formData.ProductName}
                        onChange={(e) => setData('ProductName', e.target.value)}
                        disabled={formData.product_id && showCreateModal}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="اسم المنتج"
                      />
                      {errors?.ProductName && <p className="mt-2 text-sm text-red-600">{errors.ProductName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الكمية</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.StockQuantity}
                          onChange={(e) => setData('StockQuantity', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                          placeholder="الكمية"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">pcs</span>
                      </div>
                      {errors?.StockQuantity && <p className="mt-2 text-sm text-red-600">{errors.StockQuantity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تكلفة الوحدة</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.UnitCost}
                          onChange={(e) => setData('UnitCost', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                          placeholder="تكلفة الوحدة"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">ج.م</span>
                      </div>
                      {errors?.UnitCost && <p className="mt-2 text-sm text-red-600">{errors.UnitCost}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">سعر الوحدة</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.UnitPrice}
                          onChange={(e) => setData('UnitPrice', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                          placeholder="سعر الوحدة"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">ج.م</span>
                      </div>
                      {errors?.UnitPrice && <p className="mt-2 text-sm text-red-600">{errors.UnitPrice}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم المورد</label>
                    <input
                      type="text"
                      value={formData.SupplierName}
                      onChange={(e) => setData('SupplierName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="اسم المورد"
                    />
                    {errors?.SupplierName && <p className="mt-2 text-sm text-red-600">{errors.SupplierName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                    <select
                      value={formData.IsActive}
                      onChange={(e) => setData('IsActive', e.target.value === 'true')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                    >
                      <option value={true}>نشط</option>
                      <option value={false}>غير نشط</option>
                    </select>
                    {errors?.IsActive && <p className="mt-2 text-sm text-red-600">{errors.IsActive}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setData('description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-right"
                      placeholder="وصف المنتج"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        setSelectedProduct(null);
                        setData({ product_id: null });
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
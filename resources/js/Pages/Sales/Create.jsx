import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';

const Dialog = ({ isOpen, message, type, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center transform transition-all duration-300 scale-100 ${type === 'success' ? 'border-green-500 border-2' : 'border-red-500 border-2'}`}>
        <h3 className={`text-lg font-bold mb-4 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {type === 'success' ? 'نجاح' : 'خطأ'}
        </h3>
        <p className="text-gray-700 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

export default function Create() {
  const { traders, products } = usePage().props;
  const availableProducts = products.filter(p => p.IsActive && p.StockQuantity > 0);

  // Get product details with available quantity
  const getProductDetails = (productID) => {
    if (!productID) return null; // Return null if no product is selected
    const product = availableProducts.find(p => p.ProductID.toString() === productID.toString());
    if (!product) return null;
    return {
      name: product.ProductName,
      price: product.UnitPrice,
      availableQuantity: product.StockQuantity,
      unit: product.Unit || 'قطعة'
    };
  };

  const { data, setData, post, errors: serverErrors, processing } = useForm({
    TraderID: '',
    PaidAmount: 0,
    products: [],
  });

  // Initialize with one empty product
  const [selectedProducts, setSelectedProducts] = useState([{ ProductID: '', Quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'info' });

  // Get available products that are not already selected
  const getAvailableProducts = () => {
    return availableProducts.filter(product => 
      !selectedProducts.some(item => 
        item.ProductID && item.ProductID.toString() === product.ProductID.toString()
      )
    );
  };

  // Handle adding new product
  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { ProductID: '', Quantity: 1 }]);
    setErrors(prev => ({
      ...prev,
      [selectedProducts.length]: ''
    }));
  };

  // Handle removing product
  const removeProduct = (index) => {
    if (selectedProducts.length > 1) {
      const updatedProducts = selectedProducts.filter((_, i) => i !== index);
      setSelectedProducts(updatedProducts);
      setData('products', updatedProducts);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  // Handle product selection and quantity change
  const updateProduct = (index, field, value) => {
    const updatedProducts = selectedProducts.map((item, i) => {
      if (i === index) {
        const newItem = { ...item, [field]: value };
        const product = availableProducts.find(p => p.ProductID.toString() === newItem.ProductID.toString());
        if (field === 'Quantity' && product && parseInt(value) > product.StockQuantity) {
          setErrors(prev => ({
            ...prev,
            [index]: `الكمية المطلوبة (${value}) أكبر من المتاح (${product.StockQuantity})`,
          }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }
        return newItem;
      }
      return item;
    });
    setSelectedProducts(updatedProducts);
    setData('products', updatedProducts);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if trader is selected
    if (!data.TraderID) {
      setDialog({ isOpen: true, message: 'يجب اختيار تاجر', type: 'error' });
      return;
    }

    // Check if at least one product is selected
    if (selectedProducts.every(item => !item.ProductID)) {
      setDialog({ isOpen: true, message: 'يجب إضافة منتج واحد على الأقل', type: 'error' });
      return;
    }

    // Check if paid amount is valid
    if (data.PaidAmount < 0) {
      setDialog({ isOpen: true, message: 'المبلغ المدفوع يجب أن يكون أكبر من أو يساوي صفر', type: 'error' });
      return;
    }

    // Validate quantity for each product
    const validationErrors = {};
    selectedProducts.forEach((item, index) => {
      const product = availableProducts.find(p => p.ProductID.toString() === item.ProductID.toString());
      if (product && parseInt(item.Quantity) > product.StockQuantity) {
        validationErrors[index] = `الكمية المطلوبة ${item.Quantity} أكبر من الكمية المتاحة (${product.StockQuantity})`;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setDialog({ isOpen: true, message: 'يوجد أخطاء في الكمية المدخلة', type: 'error' });
      return;
    }

    // Set the products data
    setData('products', selectedProducts);

    post(route('sales.store'), {
      onSuccess: () => {
        setDialog({ isOpen: true, message: 'تم حفظ الفاتورة بنجاح!', type: 'success' });
        setData('TraderID', '');
        setData('PaidAmount', 0);
        setSelectedProducts([{ ProductID: '', Quantity: 1 }]);
        setErrors({});
      },
      onError: () => {
        setDialog({ isOpen: true, message: 'حدث خطأ أثناء حفظ الفاتورة', type: 'error' });
      },
    });
  };

  const calculateSubTotal = (product) => {
    const item = availableProducts.find((p) => p.ProductID.toString() === product.ProductID.toString());
    return item ? (product.Quantity || 0) * item.UnitPrice : 0;
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => total + calculateSubTotal(item), 0);
  };

  const calculateRemaining = () => {
    const total = calculateTotal();
    const paid = parseFloat(data.PaidAmount) || 0;
    return total - paid;
  };

  return (
    <>
      <Head title="إنشاء فاتورة" />
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 mt-12">
        <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Trader selection */}
            <div className="relative">
              <label className="block text-base font-semibold text-gray-800 mb-2">تاجر</label>
              <select
                value={data.TraderID}
                onChange={(e) => setData('TraderID', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="">اختر تاجر</option>
                {traders.map((trader) => (
                  <option key={trader.TraderID} value={trader.TraderID}>
                    {trader.TraderName}
                  </option>
                ))}
              </select>
            </div>

            {/* Paid amount */}
            <div className="relative">
              <label className="block text-base font-semibold text-gray-800 mb-2">المبلغ المدفوع</label>
              <input
                type="number"
                min="0"
                value={data.PaidAmount}
                onChange={(e) => setData('PaidAmount', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                placeholder="أدخل المبلغ المدفوع"
              />
            </div>

            {/* Products table */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">المنتجات</h3>
                <button
                  type="button"
                  onClick={addProduct}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                >
                  <span>+</span> إضافة منتج
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">المنتج</th>
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">السعر الوحدة</th>
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">الكمية المتاحة</th>
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">الكمية المطلوبة</th>
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">المبلغ الفرعي</th>
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((item, index) => {
                      const product = getProductDetails(item.ProductID);
                      console.log('Product details for ID:', item.ProductID, '=>', product);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-4">
                            <select
                              value={item.ProductID}
                              onChange={(e) => updateProduct(index, 'ProductID', e.target.value)}
                              className="w-full border-2 border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                            >
                              <option value="">اختر منتج</option>
                              {getAvailableProducts().map((p) => (
                                <option key={p.ProductID} value={p.ProductID}>
                                  {p.ProductName} (متوفر: {p.StockQuantity})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="border border-gray-300 p-4 text-gray-800">
                            {product && product.price ? `${product.price} ج.م` : ''}
                          </td>
                          <td className="border border-gray-300 p-4 text-gray-800">
                            {product && product.availableQuantity ? `${product.availableQuantity} ${product.unit}` : ''}
                          </td>
                          <td className="border border-gray-300 p-4">
                            <input
                              type="number"
                              min="1"
                              value={item.Quantity}
                              onChange={(e) => updateProduct(index, 'Quantity', e.target.value)}
                              className="w-full border-2 border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                              placeholder="أدخل الكمية"
                            />
                            {errors[index] && (
                              <span className="text-red-600 text-sm mt-2 block">{errors[index]}</span>
                            )}
                          </td>
                          <td className="border border-gray-300 p-4 font-medium text-center text-gray-800">
                            {product && product.price ? calculateSubTotal(item) : ''}
                          </td>
                          <td className="border border-gray-300 p-4 text-center">
                            <button
                              type="button"
                              onClick={() => removeProduct(index)}
                              className="text-red-600 hover:text-red-800 transition font-semibold"
                              disabled={selectedProducts.length === 1}
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice details */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">تفاصيل الفاتورة</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">المنتج</th>
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">السعر الوحدة</th>
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">الكمية</th>
                      <th className="border border-gray-300 p-4 text-right font-semibold text-gray-800">المبلغ الفرعي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts
                      .filter(item => item.ProductID)
                      .map((item, index) => {
                        const product = getProductDetails(item.ProductID);
                        return product ? (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-4 text-gray-800">{product.name}</td>
                            <td className="border border-gray-300 p-4 text-gray-800">{product.price} ج.م</td>
                            <td className="border border-gray-300 p-4 text-gray-800">{item.Quantity}</td>
                            <td className="border border-gray-300 p-4 font-medium text-center text-gray-800">
                              {calculateSubTotal(item)} ج.م
                            </td>
                          </tr>
                        ) : null;
                      })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100">
                      <td colSpan="3" className="p-4 text-right font-bold text-gray-800">المجموع الإجمالي:</td>
                      <td className="p-4 font-bold text-blue-600 text-center">{calculateTotal()} ج.م</td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td colSpan="3" className="p-4 text-right font-bold text-gray-800">المبلغ المدفوع:</td>
                      <td className="p-4 font-bold text-green-600 text-center">{data.PaidAmount} ج.م</td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td colSpan="3" className="p-4 text-right font-bold text-gray-800">المبلغ المتبقي:</td>
                      <td className="p-4 font-bold text-red-600 text-center">{calculateRemaining()} ج.م</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={processing}
                className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md ${
                  processing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {processing ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Dialog */}
      <Dialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </>
  );
}
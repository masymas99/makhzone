import { useState } from 'react';
import Navbar from '../Shared/Navbar';

export default function Dashboard({ total_sales, cogs, total_expenses, profit, recent_sales, traderDebts }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className=" m-0 ">
<Navbar />
      <h1 className="text-2xl font-bold mb-6">لوحة تحالمستودع</h1>

      {/* بطاقات البيانات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm mb-2">إجمالي المبيعات</h3>
          <p className="text-2xl font-semibold">
            {total_sales ? `$${total_sales?.toLocaleString()}` : 'لا توجد بيانات'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm mb-2">تكلفة البضائع</h3>
          <p className="text-2xl font-semibold">
            {cogs ? `$${cogs?.toLocaleString()}` : 'لا توجد بيانات'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm mb-2">إجمالي المصروفات</h3>
          <p className="text-2xl font-semibold">
            {total_expenses ? `$${total_expenses?.toLocaleString()}` : 'لا توجد بيانات'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm mb-2">صافي الربح</h3>
          <p className="text-2xl font-semibold">
            {profit ? `$${profit?.toLocaleString()}` : 'لا توجد بيانات'}
          </p>
        </div>
      </div>

      {/* المبيعات الحديثة */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">المبيعات الحديثة</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-right text-gray-500 border-b">
                <th className="pb-2">التاريخ</th>
                <th className="pb-2">المبلغ</th>
                <th className="pb-2">رقم الفاتورة</th>
              </tr>
            </thead>
            <tbody>
              {recent_sales?.length > 0 ? (
                recent_sales.map((sale) => (
                  <tr key={sale.id} className="border-b">
                    <td className="py-3 text-right">
                      {new Date(sale.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-3 text-right">
                      ${sale.total_amount?.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">{sale.id}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">
                    لا توجد مبيعات حديثة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trader Debts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Trader Debts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Trader</th>
                <th className="pb-2">Debt</th>
              </tr>
            </thead>
            <tbody>
              {traderDebts?.map((trader) => (
                <tr key={trader.id} className="border-b">
                  <td className="py-3">{trader.name}</td>
                  <td className="py-3">
                    ${trader.total_debt?.toFixed(2)}
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

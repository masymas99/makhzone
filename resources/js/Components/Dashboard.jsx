import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState({
        profits: 0,
        recentSales: [],
        traderDebts: [],
        loading: true,
        error: null
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [sales, expenses, debts] = await Promise.all([
                    router.get('/sales'),
                    router.get('/expenses'),
                    router.get('/payments')
                ]);

                const totalProfit = sales.data.total -
                                 expenses.data.costOfGoodsSold -
                                 expenses.data.operatingCosts;

                setDashboardData({
                    profits: totalProfit,
                    recentSales: sales.data.recent,
                    traderDebts: debts.data.owed,
                    loading: false,
                    error: null
                });
            } catch (err) {
                setDashboardData(prev => ({...prev,
                    loading: false,
                    error: 'Failed to load dashboard data'
                }));
            }
        }

        fetchData();
    }, []);

    if (dashboardData.loading) return (
        <div className="p-6 text-gray-500">Loading dashboard data...</div>
    );

    if (dashboardData.error) return (
        <div className="p-6 text-red-500">{dashboardData.error}</div>
    );

    return (
        <div className="p-6 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-gray-500 text-sm">Total Profits</h3>
                    <div className="text-2xl font-semibold mt-2 text-green-600">
                        ${dashboardData.profits.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">Recent Sales</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trader</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {dashboardData.recentSales.map((sale) => (
                                <tr key={sale.id}>
                                    <td className="px-6 py-4 text-sm">{sale.trader_name}</td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        ${sale.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Trader Debts */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">Outstanding Debts</h2>
                </div>
                <div className="p-6 space-y-4">
                    {dashboardData.traderDebts.map((debt) => (
                        <div key={debt.traderId} className="flex justify-between items-center">
                            <span>{debt.traderName}</span>
                            <span className="font-medium text-red-600">
                                ${debt.amountOwed.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import Navbar from '@/Shared/Navbar';
import Chart from 'react-apexcharts';

export default function Dashboard() {
    const { trader, stats } = usePage().props;

    if (!trader || !stats) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">جاري تحميل البيانات...</h1>
                    </div>
                </div>
            </div>
        );
    }

    // Chart data for sales and payments
    const chartData = {
        options: {
            chart: {
                type: 'line',
                height: 350,
                toolbar: {
                    show: false,
                },
            },
            xaxis: {
                categories: Object.keys(stats.salesByMonth || {}).map(key => key.replace('-', '/')),
                labels: {
                    style: {
                        fontSize: '12px',
                    },
                },
            },
            yaxis: {
                labels: {
                    formatter: function (value) {
                        return value.toLocaleString();
                    },
                },
            },
            colors: ['#4361ee', '#f72585'],
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    gradientToColors: ['#4895ef', '#f72585'],
                    shadeIntensity: 1,
                    type: 'horizontal',
                    opacityFrom: 0.5,
                    opacityTo: 0.5,
                    stops: [0, 100]
                },
            },
            tooltip: {
                y: {
                    formatter: function (value) {
                        return value.toLocaleString() + ' ج.م';
                    }
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
            },
        },
        series: [
            {
                name: 'المبيعات',
                data: Object.values(stats.salesByMonth || {}),
            },
            {
                name: 'المدفوعات',
                data: Object.values(stats.paymentsByMonth || {}),
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Head title={`لوحة التحكم - ${trader.TraderName}`} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
                        <div className="flex items-center gap-4">
                            <p className="text-gray-600">العميل: {trader.TraderName}</p>
                            <Link
                                href={`/traders/${trader.TraderID}`}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                عرض التفاصيل
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">المجمل</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>إجمالي المبيعات</span>
                                <span className="font-bold text-green-600">
                                    {stats.totalSales?.toLocaleString() || '0'} ج.م
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>إجمالي المدفوعات</span>
                                <span className="font-bold text-blue-600">
                                    {stats.totalPayments?.toLocaleString() || '0'} ج.م
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>المبلغ المستحق</span>
                                <span className={`font-bold ${
                                    stats.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {stats.balance?.toLocaleString() || '0'} ج.م
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">المدفوعات</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>إجمالي المدفوعات</span>
                                <span className="font-bold text-blue-600">
                                    {stats.totalPayments?.toLocaleString() || '0'} ج.م
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>المدفوعات المعلقة</span>
                                <span className="font-bold text-orange-600">
                                    {stats.pendingPayments || 0} مدفوعات
                                </span>
                            </div>
                            {stats.lastPayment && (
                                <div className="flex justify-between items-center">
                                    <span>آخر دفعة</span>
                                    <span className="font-bold text-gray-600">
                                        {new Date(stats.lastPayment.PaymentDate).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">تحليلات المبيعات</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>إجمالي المبيعات</span>
                                <span className="font-bold text-green-600">
                                    {stats.totalSales?.toLocaleString() || '0'} ج.م
                                </span>
                            </div>
                            {stats.lastPayment?.purchase && (
                                <div className="flex justify-between items-center">
                                    <span>المشتريات المرتبطة</span>
                                    <span className="font-bold text-gray-600">
                                        {stats.lastPayment.purchase.PurchaseID}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">تحليلات المبيعات والمدفوعات</h2>
                    <div className="w-full h-[350px]">
                        <Chart options={chartData.options} series={chartData.series} type="line" height={350} />
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = null;

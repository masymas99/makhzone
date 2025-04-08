import { Link } from '@inertiajs/react'

export default function Navbar() {
    return (
        <nav className="bg-gray-800 fixed w-full top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => document.querySelector('.mobile-menu').classList.toggle('hidden')}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Desktop links */}
                    <div className="hidden md:flex space-x-4">
                        <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">لوحة التحكم</Link>
                        <Link href="/products" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">المنتجات</Link>
                        <Link href="/traders" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">التجار</Link>
                        <Link href="/sales" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">المبيعات</Link>
                        <Link href="/purchases" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">المشتريات</Link>
                        <Link href="/expenses" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">المصروفات</Link>
                        <Link href="/payments" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">الدفعات</Link>
                    </div>

                    {/* Logout button */}
                    <div className="hidden md:block">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                Link.visit('/logout', { method: 'post' });
                            }}
                            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden hidden mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">لوحة التحكم</Link>
                    <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">المنتجات</Link>
                    <Link href="/traders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">التجار</Link>
                    <Link href="/sales" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">المبيعات</Link>
                    <Link href="/purchases" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">المشتريات</Link>
                    <Link href="/expenses" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">المصروفات</Link>
                    <Link href="/payments" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">الدفعات</Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            Link.visit('/logout', { method: 'post' });
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        تسجيل الخروج
                    </button>
                </div>
            </div>
        </nav>
    )
}
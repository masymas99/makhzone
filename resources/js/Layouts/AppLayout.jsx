import React from 'react';
import { Link } from '@inertiajs/react';

const NavLink = ({ href, active, children }) => (
    <Link
        href={href}
        className={`px-4 py-2 rounded-md ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
    >
        {children}
    </Link>
);

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <NavLink href="/dashboard" active={route().current('dashboard')}>
                                Dashboard
                            </NavLink>
                            <NavLink href="/products" active={route().current('products')}>
                                Products
                            </NavLink>
                            <NavLink href="/traders" active={route().current('traders')}>
                                Traders
                            </NavLink>
                            <NavLink href="/sales" active={route().current('sales')}>
                                Sales
                            </NavLink>
                            <NavLink href="/purchases" active={route().current('purchases')}>
                                Purchases
                            </NavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
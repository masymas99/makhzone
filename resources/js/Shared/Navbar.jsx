import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    // Navigation links configuration
    const links = [
        { name: 'لوحة التحكم', href: '/dashboard' },
        { name: 'المنتجات', href: '/products' },
        { name: 'التجار', href: '/traders' },
        { name: 'المبيعات', href: '/sales' },
        { name: 'المشتريات', href: '/purchases' },
        { name: 'المصروفات', href: '/expenses' },
        { name: 'الدفعات', href: '/payments' },
    ];

    // Update current path on navigation
    useEffect(() => {
        const updatePath = () => setCurrentPath(window.location.pathname);
        window.addEventListener('popstate', updatePath);
        return () => window.removeEventListener('popstate', updatePath);
    }, []);

    // Handle logout
    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <nav className="bg-gray-800 fixed w-full top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Desktop links */}
                    <div className="hidden md:flex space-x-4">
                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    currentPath === link.href
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Logout button */}
                    <div className="hidden md:block">
                        <button
                            onClick={handleLogout}
                            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    currentPath === link.href
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </a>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
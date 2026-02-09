'use client';

import { Bell, Search, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const userInitials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'JD';

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <div className="flex flex-1 items-center">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        placeholder="Search transactions, cards, or team..."
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 focus:outline-none"
                    >
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                            {userInitials}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-slate-700">{user?.name || 'User'}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                <User className="mr-2 h-4 w-4 text-slate-500" />
                                Your Profile
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                <Settings className="mr-2 h-4 w-4 text-slate-500" />
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

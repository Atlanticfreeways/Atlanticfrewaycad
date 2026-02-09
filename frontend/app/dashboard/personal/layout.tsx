import React from 'react';

export default function PersonalDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-green-600">Freeway Personal</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-500 hover:text-gray-700">Wallet</button>
                            <button className="text-gray-500 hover:text-gray-700">Cards</button>
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
                                J
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

'use client';

import React, { useState } from 'react';

export default function PersonalDashboard() {
    const [balance] = useState(1250.00);
    const [transactions] = useState([
        { id: 1, merchant: 'Netflix', amount: 15.99, date: '2023-11-01' },
        { id: 2, merchant: 'Uber', amount: 24.50, date: '2023-10-31' },
        { id: 3, merchant: 'Starbucks', amount: 5.40, date: '2023-10-30' },
    ]);

    return (
        <div className="space-y-6">
            {/* Balance Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-gray-500 text-sm font-medium">Available Balance</h2>
                <div className="mt-2 text-3xl font-bold text-gray-900">${balance.toFixed(2)}</div>
                <div className="mt-4 flex space-x-3">
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Add Funds
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
                        Send Money
                    </button>
                </div>
            </div>

            {/* Virtual Card Preview */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div className="text-lg font-bold">Atlantic Freeway</div>
                    <div className="text-sm opacity-75">Debit</div>
                </div>
                <div className="mt-8 text-2xl font-mono tracking-wider">
                    •••• •••• •••• 4242
                </div>
                <div className="mt-8 flex justify-between items-end">
                    <div>
                        <div className="text-xs opacity-75">Card Holder</div>
                        <div className="font-medium">JOHN DOE</div>
                    </div>
                    <div className="text-xl font-bold italic">VISA</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {transactions.map((tx) => (
                        <li key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                            <div>
                                <div className="text-sm font-medium text-gray-900">{tx.merchant}</div>
                                <div className="text-sm text-gray-500">{tx.date}</div>
                            </div>
                            <div className="text-sm font-bold text-gray-900">-${tx.amount.toFixed(2)}</div>
                        </li>
                    ))}
                </ul>
                <div className="bg-gray-50 px-6 py-3">
                    <button className="text-sm font-medium text-green-600 hover:text-green-500">
                        View all transactions
                    </button>
                </div>
            </div>
        </div>
    );
}

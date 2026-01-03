'use client';

import React, { useEffect, useState } from 'react';


export default function BusinessDashboard() {
    const [stats, setStats] = useState({
        balance: 0,
        employees: 0,
        cards: 0,
        spending: 0
    });

    useEffect(() => {
        // Simulate fetching stats
        setStats({
            balance: 125000.50,
            employees: 24,
            cards: 45,
            spending: 12450.00
        });
    }, []);

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Balance Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                {/* Icon placeholder */}
                                <span className="text-white text-2xl">$</span>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Balance
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            ${stats.balance.toLocaleString()}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employees Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                <span className="text-white text-2xl">U</span>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Active Employees
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {stats.employees}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards Issued */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                                <span className="text-white text-2xl">C</span>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Active Cards
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {stats.cards}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Spending */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                                <span className="text-white text-2xl">S</span>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Monthly Spending
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            ${stats.spending.toLocaleString()}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h2>
                <div className="mt-4 bg-white shadow rounded-lg p-6">
                    <p className="text-gray-500">No recent transactions found.</p>
                </div>
            </div>
        </div>
    );
}

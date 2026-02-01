"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { CreditCard, ArrowUpRight, ArrowDownLeft, Activity, Loader2 } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useRealtimeBalance } from "@/hooks/useSocket";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading: dataLoading, error } = useDashboardData();
  const router = useRouter();

  // Safe default
  const initialBalance = parseFloat(data?.metrics?.availableBalance || 0);
  const liveBalance = useRealtimeBalance(initialBalance);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!user || !data) return null;

  const metrics = data.metrics || {};
  const transactions = data.recentTransactions || [];

  return (
    <DashboardShell>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Balance"
          value={`$${liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change="+0.0%"
          type="neutral"
          icon={CreditCard}
        />
        <StatsCard
          title="Monthly Spending"
          value={`$${metrics.totalSpend?.current?.toLocaleString() || '0.00'}`}
          change={`${metrics.totalSpend?.change || 0}%`}
          type="negative"
          icon={ArrowUpRight}
        />
        <StatsCard
          title="Income"
          value="$0.00"
          change="+0%"
          icon={ArrowDownLeft}
        />
        <StatsCard
          title="Active Cards"
          value={metrics.activeCards?.toString() || "0"}
          change={metrics.activeCards > 0 ? "Active" : "None"}
          type="neutral"
          icon={Activity}
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Spending Chart (Placeholder) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Spending Analysis</h2>
          <div className="h-64 flex items-center justify-center bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
            <span className="text-slate-500">Spending Chart will appear here</span>
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No recent transactions</p>
            ) : (
              transactions.map((tx: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-900 transition-colors">
                      <span className="text-lg">🛒</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{tx.merchant_name || 'Unknown Merchant'}</p>
                      <p className="text-xs text-slate-500">{tx.merchant_category || 'General'}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatsCard({ title, value, change, type = 'positive', icon: Icon }: any) {
  const isPos = type === 'positive';
  const isNeg = type === 'negative';

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all cursor-default">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className="p-2 bg-slate-800 rounded-lg">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isPos ? 'bg-green-500/10 text-green-400' :
          isNeg ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-300'
          }`}>
          {change}
        </span>
      </div>
    </div>
  )
}

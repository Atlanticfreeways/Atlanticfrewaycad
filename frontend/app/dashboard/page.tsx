import { Overview } from '@/components/dashboard/Overview';
import { QuickActions } from '@/components/dashboard/widgets/QuickActions';
import { ActivityFeed } from '@/components/dashboard/widgets/ActivityFeed';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="mt-2 text-slate-600">Welcome to your dashboard overview.</p>
            </div>

            <Overview />

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ActivityFeed />
                </div>
                <div>
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}

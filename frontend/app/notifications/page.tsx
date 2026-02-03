'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CreditCard, Shield, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { NotificationSkeleton } from '@/components/ui/skeleton';
import { ErrorDisplay, EmptyState } from '@/components/ui/error';
import { toast } from '@/lib/toast';

interface Notification {
    id: string;
    type: 'transaction' | 'security' | 'kyc' | 'system';
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
    data?: any;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
            } else {
                setError(data.error || 'Failed to load notifications');
                toast.error('Failed to load notifications');
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setError('Network error - please check your connection');
            toast.error('Failed to load notifications', 'Network error');
        } finally {
            setLoading(false);
        }
    };


    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setNotifications(notifications.map(n =>
                    n.id === id ? { ...n, read_at: new Date().toISOString() } : n
                ));
                toast.success('Marked as read');
            } else {
                toast.error('Failed to mark as read');
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
            toast.error('Failed to mark as read', 'Network error');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/notifications/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setNotifications(notifications.filter(n => n.id !== id));
                toast.success('Notification deleted');
            } else {
                toast.error('Failed to delete notification');
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification', 'Network error');
        }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.read_at);
        if (unread.length === 0) {
            toast.info('No unread notifications');
            return;
        }

        try {
            // Mark all as read optimistically
            setNotifications(notifications.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
            toast.success(`Marked ${unread.length} notifications as read`);

            // Here you would make API calls to mark each as read
            // For now, we're doing it optimistically
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'transaction':
                return <CreditCard className="w-5 h-5 text-blue-400" />;
            case 'security':
                return <Shield className="w-5 h-5 text-red-400" />;
            case 'kyc':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            default:
                return <Bell className="w-5 h-5 text-slate-400" />;
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => n.type === filter);

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <DashboardShell>
            <div className="p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Notifications</h1>
                        <p className="text-slate-400 mt-2">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    <Button variant="secondary" onClick={markAllAsRead}>
                        Mark All as Read
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-6">
                    {['all', 'transaction', 'security', 'kyc', 'system'].map((filterType) => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === filterType
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {loading ? (
                        <NotificationSkeleton />
                    ) : error ? (
                        <ErrorDisplay
                            message={error}
                            onRetry={fetchNotifications}
                        />
                    ) : filteredNotifications.length === 0 ? (
                        <EmptyState
                            icon={<Bell className="w-12 h-12" />}
                            title={filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                            description={filter === 'all' ? "You're all caught up!" : `Try changing your filter to see more notifications`}
                        />
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-xl border transition-all ${notification.read_at
                                    ? 'bg-slate-800/30 border-slate-700'
                                    : 'bg-blue-900/10 border-blue-700/50'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${notification.read_at ? 'bg-slate-700' : 'bg-blue-600/20'}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="font-medium text-white">{notification.title}</h3>
                                            <div className="flex gap-2">
                                                {!notification.read_at && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-xs text-blue-400 hover:text-blue-300"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="text-slate-400 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-2">{notification.message}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}

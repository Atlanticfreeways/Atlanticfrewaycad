'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CreditCard, Shield, CheckCircle, AlertCircle, Trash2, Check } from 'lucide-react';
import { NotificationSkeleton } from '@/components/ui/skeleton';
import { ErrorDisplay, EmptyState } from '@/components/ui/error';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

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
            <div className="p-4 md:p-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
                        <p className="text-slate-400 mt-1 text-sm md:text-base">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    <Button onClick={markAllAsRead} variant="secondary" className="w-full md:w-auto">
                        Mark All as Read
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex overflow-x-auto pb-4 mb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide gap-2 md:gap-3">
                    {['all', 'transaction', 'security', 'kyc', 'system'].map((filterType) => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${filter === filterType
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                                }`}
                        >
                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <NotificationSkeleton />
                    ) : error ? (
                        <ErrorDisplay message={error} onRetry={fetchNotifications} />
                    ) : filteredNotifications.length === 0 ? (
                        <EmptyState
                            icon={<Bell className="w-12 h-12" />}
                            title={filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                            description={filter === 'all' ? "You're all caught up!" : `Try changing your filter to see more notifications`}
                        />
                    ) : (
                        filteredNotifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="relative group"
                            >
                                {/* Swipe Backgrounds */}
                                <div className="absolute inset-0 rounded-2xl flex items-center justify-between px-6">
                                    <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-widest">
                                        <Check className="w-4 h-4" />
                                        Read
                                    </div>
                                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
                                        Delete
                                        <Trash2 className="w-4 h-4" />
                                    </div>
                                </div>

                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.x > 100 && !notification.read_at) {
                                            markAsRead(notification.id);
                                        } else if (info.offset.x < -100) {
                                            deleteNotification(notification.id);
                                        }
                                    }}
                                    className={`relative z-10 p-5 rounded-2xl border transition-colors cursor-grab active:cursor-grabbing ${notification.read_at
                                            ? 'bg-slate-900 border-slate-800 opacity-60'
                                            : 'bg-slate-800 border-slate-700 hover:border-blue-500/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-xl ${notification.read_at ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className={`font-bold truncate pr-2 ${notification.read_at ? 'text-slate-400' : 'text-white'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap pt-1">
                                                    {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm line-clamp-2 md:line-clamp-none leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between md:hidden">
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                                    {notification.type}
                                                </span>
                                                {!notification.read_at && (
                                                    <span className="flex items-center gap-1 text-[10px] text-blue-500 font-black animate-pulse uppercase">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="hidden md:flex flex-col gap-2">
                                            {!notification.read_at && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </DashboardShell>
    );
}

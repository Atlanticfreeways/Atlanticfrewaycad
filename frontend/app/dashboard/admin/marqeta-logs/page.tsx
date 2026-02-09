import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from '@/lib/api';
import { RefreshCw, Search, Code, AlertTriangle } from 'lucide-react';

export default function MarqetaLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const query = filterType ? `?type=${encodeURIComponent(filterType)}` : '';
            const response = await api.get<{ data: any[] }>(`/admin/marqeta-logs${query}`);
            setLogs(response.data || []);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getStatusColor = (payload: any) => {
        const status = payload?.state || payload?.status || 'UNKNOWN';
        if (['COMPLETED', 'CLEARED', 'APPROVED'].includes(status)) return 'bg-green-100 text-green-800';
        if (['DECLINED', 'FAILED', 'ERROR'].includes(status)) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Marqeta Signal Logs</h1>
                    <p className="text-muted-foreground mt-2">
                        Raw ISO 8583-equivalent message stream from the Marqeta Core functionality.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchLogs} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Stream
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Inbound Webhook Stream</CardTitle>
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter by Event Type..."
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-[250px]"
                            />
                        </div>
                    </div>
                    <CardDescription>Real-time capture of all financial authorization attempts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Event Token</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Reason / State</th>
                                    <th className="px-4 py-3">Timestamp</th>
                                    <th className="px-4 py-3 text-right">Payload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center">Loading signal data...</td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            No events captured yet. Waiting for Marqeta webhooks...
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="cursor-pointer hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-xs">{log.event_token || 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="font-mono">
                                                    {log.event_type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.payload)}`}>
                                                    {log.payload?.state || log.payload?.status || 'INFO'}
                                                </span>
                                                {log.payload?.reason_code && (
                                                    <span className="ml-2 text-xs text-muted-foreground font-mono">Code: {log.payload.reason_code}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-sm">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-blue-600 border-blue-200 bg-blue-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/dashboard/admin/jit-visualizer/${log.event_token}`;
                                                    }}
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    Visualize Logic
                                                </Button>
                                                {/* Dialog removed for build fix */}
                                                <Button variant="ghost" size="sm" onClick={() => console.log(log.payload)}>
                                                    <Code className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from '@/lib/api';
import { RefreshCw, Search, Code, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function MarqetaLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filterType, setFilterType] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Assuming basic auth is handled by cookies/session in api client
            const response = await api.get('/admin/marqeta-logs', { params: { type: filterType } });
            setLogs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
            // Fallback for demo if API fails/not-auth
            // setLogs([
            //   { id: '1', event_type: 'transaction.authorization', event_token: 'evt_123', created_at: new Date().toISOString(), payload: { amount: 5000, state: 'DECLINED', reason_code: '51' } }
            // ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getStatusColor = (payload) => {
        const status = payload?.state || payload?.status || 'UNKNOWN';
        if (['COMPLETED', 'CLEARED', 'APPROVED'].includes(status)) return 'bg-green-100 text-green-800';
        if (['DECLINED', 'FAILED', 'ERROR'].includes(status)) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <DashboardLayout>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event Token</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reason / State</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead className="text-right">Payload</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">Loading signal data...</TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No events captured yet. Waiting for Marqeta webhooks...
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(log)}>
                                            <TableCell className="font-mono text-xs">{log.event_token || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {log.event_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.payload)}`}>
                                                    {log.payload?.state || log.payload?.status || 'INFO'}
                                                </span>
                                                {log.payload?.reason_code && (
                                                    <span className="ml-2 text-xs text-muted-foreground font-mono">Code: {log.payload.reason_code}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(log.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-blue-600 border-blue-200 bg-blue-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/admin/jit-visualizer/${log.event_token}`;
                                                    }}
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    Visualize Logic
                                                </Button>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Code className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Raw JSON Payload</DialogTitle>
                                                            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded text-sm mt-2">
                                                                <AlertTriangle className="h-4 w-4" />
                                                                <span>This is the raw data Marqeta translated from the ISO 8583 message.</span>
                                                            </div>
                                                        </DialogHeader>
                                                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs font-mono">
                                                            {JSON.stringify(log.payload, null, 2)}
                                                        </pre>
                                                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                                            <div className="p-3 border rounded">
                                                                <p className="font-semibold text-muted-foreground">Headers (Security)</p>
                                                                <pre className="text-xs mt-1 overflow-hidden text-ellipsis">
                                                                    {JSON.stringify(log.headers, null, 2)}
                                                                </pre>
                                                            </div>
                                                            <div className="p-3 border rounded">
                                                                <p className="font-semibold text-muted-foreground">Quick Diagnostic</p>
                                                                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                                                                    <li><strong>Amount:</strong> {log.payload?.amount || log.payload?.gpad?.amount || 'N/A'}</li>
                                                                    <li><strong>Currency:</strong> {log.payload?.currency_code || 'USD'}</li>
                                                                    <li><strong>Network Ref:</strong> {log.payload?.network_reference_id || 'N/A'}</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from '@/lib/api';
import { Upload, FileSpreadsheet, CheckCircle, AlertOctagon, RefreshCw, FileText } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function ReconciliationPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState<any>(null);

    const fetchHistory = async () => {
        try {
            const response = await api.get<{ data: any[] }>('/admin/reconcile/history');
            setHistory(response.data || []);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const processFile = async () => {
        if (!file || !date) return;
        setProcessing(true);
        setReport(null);

        try {
            const text = await file.text();
            const rows = text.split('\n').filter(row => row.trim() !== '');
            const records = [];

            // Skip header if present (heuristic: "token" or "amount" in first row)
            let startIndex = 0;
            if (rows[0].toLowerCase().includes('token')) startIndex = 1;

            for (let i = startIndex; i < rows.length; i++) {
                const cols = rows[i].split(',');
                if (cols.length >= 3) {
                    records.push({
                        token: cols[0].trim(),
                        amount: parseFloat(cols[1].trim()),
                        currency: cols[2].trim().toUpperCase()
                    });
                }
            }

            if (records.length === 0) {
                alert('No valid records found in CSV');
                setProcessing(false);
                return;
            }

            // Send to Backend with Idempotency Key
            const idempotencyKey = crypto.randomUUID();
            const response = await api.post('/admin/reconcile/run', {
                date,
                records
            }, {
                headers: {
                    'Idempotency-Key': idempotencyKey
                }
            });

            setReport(response.data);
            fetchHistory(); // Refresh table
            setFile(null); // Clear file

        } catch (error: any) {
            console.error('Reconciliation failed', error);
            // alert(error.response?.data?.error || error.message || 'Reconciliation failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <DashboardShell>
            <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                        Settlement Reconciliation
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Upload Daily Settlement Reports (DSR) from Marqeta to match against internal ledgers.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Upload Card */}
                    <Card className="md:col-span-1 shadow-lg border-blue-100">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle>Run New Settlement</CardTitle>
                            <CardDescription>Upload CSV: <code>token,amount,currency</code></CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Settlement Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>DSR File (CSV)</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative">
                                    <Input
                                        type="file"
                                        accept=".csv"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                    {file ? (
                                        <div className="text-center">
                                            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                            <p className="font-medium text-sm text-blue-700 truncate max-w-[200px]">{file.name}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <Upload className="h-8 w-8 mx-auto mb-2" />
                                            <p className="text-xs">Drag or Click to Upload</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                disabled={!file || processing}
                                onClick={processFile}
                            >
                                {processing ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Run Reconciliation
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Report / History Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Reconciliation History</CardTitle>
                            <CardDescription>Archive of past settlement runs and discrepancy reports.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {report && (
                                <div className={`mb-6 p-4 rounded border flex items-start gap-3 ${report.status === 'MATCHED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    {report.status === 'MATCHED' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertOctagon className="h-5 w-5 text-red-600" />}
                                    <div>
                                        <h5 className={`font-medium ${report.status === 'MATCHED' ? 'text-green-800' : 'text-red-800'}`}>
                                            Run Complete: {report.status}
                                        </h5>
                                        <div className="text-sm text-slate-600 mt-1">
                                            Processed {report.settlementId}. Discrepancies found: <strong>{report.discrepancies}</strong>.
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-muted-foreground border-b">
                                        <tr>
                                            <th className="h-12 px-4 align-middle font-medium">Date</th>
                                            <th className="h-12 px-4 align-middle font-medium">Status</th>
                                            <th className="h-12 px-4 align-middle font-medium">Total Settled</th>
                                            <th className="h-12 px-4 align-middle font-medium">Tx Count</th>
                                            <th className="h-12 px-4 align-middle font-medium text-right">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-muted-foreground">Loading history...</td>
                                            </tr>
                                        ) : history.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-muted-foreground">No reconciliation history found.</td>
                                            </tr>
                                        ) : (
                                            history.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-muted/50">
                                                    <td className="p-4 font-medium">
                                                        {new Date(item.settlement_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant={item.status === 'MATCHED' ? 'default' : item.status === 'PROCESSING' ? 'secondary' : 'destructive'}>
                                                            {item.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">${parseFloat(item.total_amount_settled || '0').toFixed(2)}</td>
                                                    <td className="p-4">{item.total_transactions_count}</td>
                                                    <td className="p-4 text-right text-muted-foreground text-xs">
                                                        {new Date(item.updated_at).toLocaleString()}
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
            </div>
        </DashboardShell>
    );
}

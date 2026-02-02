'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from '@/lib/api';
import { Upload, FileSpreadsheet, CheckCircle, AlertOctagon, RefreshCw, FileText } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function ReconciliationPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState<any>(null);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/admin/reconcile/history');
            setHistory(response.data);
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
            alert(error.response?.data?.error || error.message || 'Reconciliation failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <DashboardShell>
            <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
                <div>
                    {/* ... content ... */}
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
                                <Alert className={`mb-6 ${report.status === 'MATCHED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    {report.status === 'MATCHED' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertOctagon className="h-4 w-4 text-red-600" />}
                                    <AlertTitle className={report.status === 'MATCHED' ? 'text-green-800' : 'text-red-800'}>
                                        Run Complete: {report.status}
                                    </AlertTitle>
                                    <AlertDescription className="text-slate-600">
                                        Processed {report.settlementId}. Discrepancies found: <strong>{report.discrepancies}</strong>.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total Settled</TableHead>
                                        <TableHead>Tx Count</TableHead>
                                        <TableHead className="text-right">Last Updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading history...</TableCell>
                                        </TableRow>
                                    ) : history.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No reconciliation history found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        history.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {new Date(item.settlement_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.status === 'MATCHED' ? 'default' : item.status === 'PROCESSING' ? 'secondary' : 'destructive'}>
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>${parseFloat(item.total_amount_settled).toFixed(2)}</TableCell>
                                                <TableCell>{item.total_transactions_count}</TableCell>
                                                <TableCell className="text-right text-muted-foreground text-xs">
                                                    {new Date(item.updated_at).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardShell>
    );
}

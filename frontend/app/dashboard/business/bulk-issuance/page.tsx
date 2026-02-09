'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { api } from '@/lib/api';

export default function BulkIssuancePage() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setReport(null);
            setError(null);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "email,name,spending_limit,role\njohn.doe@example.com,John Doe,1000,employee\nalice.smith@example.com,Alice Smith,5000,manager";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_issuance_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post<any>('/business/bulk-issue', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setReport(response.data.report);
        } catch (err: any) {
            console.error('Upload failed', err);
            setError(err.response?.data?.error || 'Failed to process bulk file. Please check the format and try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bulk Card Issuance</h1>
                <p className="text-muted-foreground mt-2">
                    Upload a CSV file to provision virtual cards for your entire team instantly.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Col: Upload Form */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Employee Roster</CardTitle>
                            <CardDescription>
                                Supported format: CSV (email, name, spending_limit, role)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
                                <Input
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <span className="font-medium text-slate-900">
                                        {file ? (file as File).name : "Click to select CSV file"}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        {file ? `${((file as File).size / 1024).toFixed(1)} KB` : "or drag and drop here"}
                                    </span>
                                </Label>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={downloadTemplate}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Template
                                </Button>
                                <Button onClick={handleUpload} disabled={!file || uploading}>
                                    {uploading ? 'Processing...' : 'Start Issuance'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-destructive/15 text-destructive p-4 rounded-md border border-destructive/20 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 mt-0.5" />
                            <div>
                                <h5 className="font-medium">Error</h5>
                                <div className="text-sm mt-1">{error}</div>
                            </div>
                        </div>
                    )}

                    {report && (
                        <Card className="border-green-100 bg-green-50/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Issuance Report
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded border text-center">
                                        <div className="text-2xl font-bold text-slate-800">{report.total}</div>
                                        <div className="text-xs text-muted-foreground uppercase">Total Rows</div>
                                    </div>
                                    <div className="bg-white p-4 rounded border text-center border-green-200 bg-green-50">
                                        <div className="text-2xl font-bold text-green-700">{report.success}</div>
                                        <div className="text-xs text-green-600 uppercase">Success</div>
                                    </div>
                                    <div className="bg-white p-4 rounded border text-center border-red-200 bg-red-50">
                                        <div className="text-2xl font-bold text-red-700">{report.failed}</div>
                                        <div className="text-xs text-red-600 uppercase">Failed</div>
                                    </div>
                                </div>

                                {report.errors.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm text-red-900">Error Details:</h4>
                                        <div className="bg-white border rounded max-h-40 overflow-y-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 text-xs text-slate-500 font-medium">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Row</th>
                                                        <th className="px-3 py-2 text-left">Email</th>
                                                        <th className="px-3 py-2 text-left">Issue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.errors.map((err: any, i: number) => (
                                                        <tr key={i} className="border-t">
                                                            <td className="px-3 py-2 font-mono text-xs">{err.row}</td>
                                                            <td className="px-3 py-2">{err.email}</td>
                                                            <td className="px-3 py-2 text-red-600">{err.error}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Col: Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-slate-600">
                            <p>1. Download the CSV template.</p>
                            <p>2. Fill in the employee details. Setting a role of 'manager' gives admin access.</p>
                            <p>3. Upload the file to provision accounts.</p>
                            <div className="bg-amber-50 text-amber-800 p-3 rounded border border-amber-200 text-xs">
                                <strong>Note:</strong> Employees will need to reset their password via email (simulated) to access their new dashboard.
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Capabilities</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Instant Virtual Card Issuance</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Batch User Creation</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Spending Limit Controls</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from '@/lib/api';
import { ArrowDown, Check, X, Clock, AlertTriangle, PlayCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function JitVisualizerPage() {
    const { token } = useParams();
    const [trace, setTrace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;

        const fetchTrace = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/admin/jit-traces/${token}`);
                setTrace(response.data);
            } catch (err) {
                console.error('Failed to fetch JIT trace', err);
                setError('Trace not found or transaction was not processed by JIT engine.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrace();
    }, [token]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PASS':
            case 'APPROVED':
            case 'START':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'FAIL':
            case 'DECLINED':
            case 'ERROR':
            case 'CRASH':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'PENDING':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PASS':
            case 'APPROVED':
                return <Check className="h-5 w-5" />;
            case 'FAIL':
            case 'DECLINED':
            case 'ERROR':
            case 'CRASH':
                return <X className="h-5 w-5" />;
            case 'START':
                return <PlayCircle className="h-5 w-5" />;
            default:
                return <Clock className="h-5 w-5" />;
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-slate-200 mb-4"></div>
                        <div className="h-4 w-48 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-8 flex flex-col items-center justify-center h-[50vh]">
                    <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">Trace Not Available</h2>
                    <p className="text-slate-500 mt-2 max-w-md text-center">{error}</p>
                    <Button className="mt-6" variant="outline" onClick={() => window.history.back()}>
                        Go Back to Logs
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            JIT Decision Visualizer
                            <Badge variant={trace.final_decision === 'APPROVED' ? 'success' : 'destructive'}>
                                {trace.final_decision}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-mono text-sm">
                            Trace ID: <span className="bg-slate-100 px-1 py-0.5 rounded">{trace.id}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold font-mono">{trace.total_latency_ms}ms</div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Latency</p>
                    </div>
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {trace.steps && trace.steps.map((step, index) => (
                        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* Icon */}
                            <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2
                ${getStatusColor(step.status)}
              `}>
                                {getStatusIcon(step.status)}
                            </div>

                            {/* Content Card */}
                            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800">{step.step.replace(/_/g, ' ')}</h3>
                                    <span className="text-xs font-mono text-slate-400">
                                        +{step.timestamp - trace.steps[0].timestamp}ms
                                    </span>
                                </div>

                                {step.details && Object.keys(step.details).length > 0 && (
                                    <div className="bg-slate-50 p-3 rounded-md border text-xs font-mono text-slate-600 mt-2">
                                        {Object.entries(step.details).map(([key, value]) => (
                                            <div key={key} className="flex justify-between border-b last:border-0 border-slate-100 py-1">
                                                <span className="text-slate-400">{key}:</span>
                                                <span className="font-medium text-slate-700 truncate max-w-[150px]" title={String(value)}>
                                                    {String(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded inline-block ${getStatusColor(step.status)}`}>
                                    {step.status}
                                </div>
                            </Card>

                        </div>
                    ))}

                    {/* Final Decision Node */}
                    <div className="relative flex items-center justify-center">
                        <div className={`
                flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-lg shrink-0 z-10 bg-white
                ${trace.final_decision === 'APPROVED' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}
             `}>
                            {trace.final_decision === 'APPROVED' ? <Check className="h-8 w-8" /> : <X className="h-8 w-8" />}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}

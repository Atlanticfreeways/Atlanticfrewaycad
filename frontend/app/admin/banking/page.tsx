'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from '@/lib/api';
import { Landmark, ArrowDownLeft, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function BankingSimulatorPage() {
    const [myAccount, setMyAccount] = useState<any>(null);
    const [loadingAccount, setLoadingAccount] = useState(true);

    // Simulation Form
    const [targetAccount, setTargetAccount] = useState('');
    const [amount, setAmount] = useState('1500.00');
    const [employer, setEmployer] = useState('Acme Corp Payroll');
    const [simulating, setSimulating] = useState(false);
    const [result, setResult] = useState<any>(null);

    const fetchMyAccount = async () => {
        try {
            const response = await api.get('/banking/account');
            setMyAccount(response.data);
            // Auto-fill target if empty
            if (!targetAccount) setTargetAccount(response.data.account_number);
        } catch (error) {
            console.error('Failed to fetch account', error);
        } finally {
            setLoadingAccount(false);
        }
    };

    useEffect(() => {
        fetchMyAccount();
    }, []);

    const handleSimulate = async () => {
        setSimulating(true);
        setResult(null);
        try {
            const response = await api.post('/banking/simulate-deposit', {
                account_number: targetAccount,
                amount: parseFloat(amount),
                employer
            });
            setResult({ success: true, ...response.data });
        } catch (error: any) {
            setResult({ success: false, message: error.response?.data?.error || error.message });
        } finally {
            setSimulating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <DashboardShell>
            <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Landmark className="h-8 w-8 text-emerald-600" />
                        Banking Simulator
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Test the GPR (General Purpose Reloadable) engine by simulating ACH Direct Deposits.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* My Account Card */}
                    <Card className="bg-slate-950 text-slate-50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-slate-50">
                                Admin Tester Account
                                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-none">Active</Badge>
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Use these details to receive test deposits.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {loadingAccount ? (
                                <div className="text-slate-500">Loading virtual account details...</div>
                            ) : myAccount ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-wider text-slate-500">Bank Name</label>
                                        <p className="font-mono text-lg font-medium">{myAccount.bank_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-wider text-slate-500">Routing Number</label>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-2xl tracking-widest">{myAccount.routing_number}</p>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => copyToClipboard(myAccount.routing_number)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-wider text-slate-500">Account Number</label>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-2xl tracking-widest text-emerald-400">{myAccount.account_number}</p>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => copyToClipboard(myAccount.account_number)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-red-400">Failed to load account. Are you logged in?</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Simulator Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ACH Deposit Injector</CardTitle>
                            <CardDescription>Simulates an incoming NACHA batch entry from an employer.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target Account Number</Label>
                                <Input
                                    value={targetAccount}
                                    onChange={(e) => setTargetAccount(e.target.value)}
                                    placeholder="1234567890"
                                    className="font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount (USD)</Label>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        startAdornment="$"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Employer / Originator</Label>
                                    <Input
                                        value={employer}
                                        onChange={(e) => setEmployer(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                                onClick={handleSimulate}
                                disabled={simulating || !targetAccount}
                            >
                                {simulating ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Transmitting...
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownLeft className="mr-2 h-4 w-4" /> Inject Deposit
                                    </>
                                )}
                            </Button>

                            {result && (
                                <div className={`p-4 rounded-md mt-4 text-sm ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {result.success ? (
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                                            <div>
                                                <p className="font-semibold">Deposit Successful</p>
                                                <p className="text-xs mt-1 opacity-80">
                                                    Transaction ID: {result.transaction_id || 'N/A'}<br />
                                                    New Balance: ${result.new_balance}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>Error: {result.message}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardShell>
    );
}

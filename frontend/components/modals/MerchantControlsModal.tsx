"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';

const schema = z.object({
    controlType: z.enum(['allow', 'block']),
    targetType: z.enum(['merchantName', 'mcc', 'categoryGroup']),
    value: z.string().min(1, "Value is required")
});

type FormData = z.infer<typeof schema>;

interface Rule {
    id: number;
    control_type: 'allow' | 'block';
    merchant_name?: string;
    mcc?: string;
    category_group?: string;
    type?: string; // backend might return 'allow'/'block' as type or control_type
}

interface MerchantControlsModalProps {
    cardId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function MerchantControlsModal({ cardId, isOpen, onClose }: MerchantControlsModalProps) {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            controlType: 'block',
            targetType: 'merchantName',
            value: ''
        }
    });

    const fetchRules = useCallback(async () => {
        try {
            const res = await api.get<{ rules: Rule[] }>(`/cards/${cardId}/controls/merchant`);
            setRules(res.rules || []);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load rules');
        }
    }, [cardId]);

    useEffect(() => {
        if (isOpen) {
            fetchRules();
        }
    }, [isOpen, fetchRules]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const apiPayload = {
                type: data.controlType,
                ...((data.targetType === 'merchantName') && { merchant_name: data.value }),
                ...((data.targetType === 'mcc') && { mcc: data.value }),
                ...((data.targetType === 'categoryGroup') && { category_group: data.value }),
            };

            await api.post(`/cards/${cardId}/controls/merchant`, apiPayload);
            toast.success('Rule added');
            reset();
            fetchRules();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add rule');
        } finally {
            setLoading(false);
        }
    };

    const deleteRule = async (id: number) => {
        try {
            await api.request(`/cards/controls/merchant/${id}`, { method: 'DELETE' });
            toast.success('Rule deleted');
            setRules(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            console.error(e);
            toast.error('Failed to delete rule');
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Merchant Restrictions"
            className="max-w-xl"
        >
            <div className="space-y-6">
                {/* Add New Rule Form */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h3 className="text-sm font-medium mb-3">Add New Rule</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Action</Label>
                                <select {...register('controlType')} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                    <option value="allow">Whitelist (Allow Only)</option>
                                    <option value="block">Blacklist (Block)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Target</Label>
                                <select {...register('targetType')} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                    <option value="merchantName">Specific Merchant</option>
                                    <option value="mcc">VIsa/Mastercard MCC</option>
                                    <option value="categoryGroup">Category (travel, food)</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Value</Label>
                            <Input {...register('value')} placeholder="e.g. Netflix, 5812, or travel" />
                            {errors.value && <p className="text-xs text-red-500">{errors.value.message}</p>}
                        </div>
                        <Button type="submit" size="sm" className="w-full" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Rule'}
                        </Button>
                    </form>
                </div>

                {/* Existing Rules List */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Active Rules</h3>
                    {rules.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No restrictions set.</p>
                    ) : (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {rules.map(rule => (
                                <li key={rule.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm">
                                    <div className="flex items-center gap-3">
                                        {(rule.control_type === 'allow' || rule.type === 'allow') ? <ShieldCheck className="text-green-500 h-5 w-5" /> : <ShieldAlert className="text-red-500 h-5 w-5" />}
                                        <div>
                                            <p className="text-sm font-medium capitalize">{rule.control_type || rule.type}</p>
                                            <p className="text-xs text-slate-500">
                                                {rule.merchant_name && `Merchant: ${rule.merchant_name}`}
                                                {rule.mcc && `MCC: ${rule.mcc}`}
                                                {rule.category_group && `Category: ${rule.category_group}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Modal>
    );
}

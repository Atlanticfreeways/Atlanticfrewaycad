"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, Globe } from 'lucide-react';

// Common Countries for demo
const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'CN', name: 'China' },
    { code: 'RU', name: 'Russia' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
];

const schema = z.object({
    controlType: z.enum(['allow', 'block']),
    countryCode: z.string().length(2)
});

type FormData = z.infer<typeof schema>;

interface Rule {
    id: number;
    control_type: 'allow' | 'block';
    country_code: string;
}

interface LocationRestrictionsModalProps {
    cardId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function LocationRestrictionsModal({ cardId, isOpen, onClose }: LocationRestrictionsModalProps) {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            controlType: 'block',
            countryCode: 'US'
        }
    });

    const fetchRules = async () => {
        try {
            const res = await api.get<{ rules: Rule[] }>(`/personal/cards/${cardId}/controls/location`);
            setRules(res.rules);
        } catch (e) {
            toast.error('Failed to load rules');
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchRules();
        }
    }, [isOpen, cardId]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            await api.post(`/personal/cards/${cardId}/controls/location`, data);
            toast.success('Location rule added');
            reset();
            fetchRules();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add rule');
        } finally {
            setLoading(false);
        }
    };

    const deleteRule = async (countryCode: string) => {
        try {
            await api.request(`/personal/cards/${cardId}/controls/location/${countryCode}`, { method: 'DELETE' });
            toast.success('Rule deleted');
            setRules(prev => prev.filter(r => r.country_code !== countryCode));
        } catch (e) {
            toast.error('Failed to delete rule');
        }
    }

    const getCountryName = (code: string) => COUNTRIES.find(c => c.code === code)?.name || code;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Location Restrictions"
            className="max-w-xl"
        >
            <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h3 className="text-sm font-medium mb-3">Add Country Rule</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Action</Label>
                                <select {...register('controlType')} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                    <option value="allow">Allow Only (Whitelist)</option>
                                    <option value="block">Block (Blacklist)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Country</Label>
                                <select {...register('countryCode')} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button type="submit" size="sm" className="w-full" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Restriction'}
                        </Button>
                    </form>
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-3">Active Rules</h3>
                    {rules.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No restrictions set.</p>
                    ) : (
                        <ul className="space-y-2">
                            {rules.map(rule => (
                                <li key={rule.id} className="flex items-center justify-between p-3 bg-card border rounded-md shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Globe className="text-blue-500 h-5 w-5" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {rule.control_type === 'allow' ? 'Allowed: ' : 'Blocked: '}
                                                {getCountryName(rule.country_code)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.country_code)} className="text-muted-foreground hover:text-destructive">
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

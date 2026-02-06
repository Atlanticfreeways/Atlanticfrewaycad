"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

const schema = z.object({
    dailyLimit: z.coerce.number().min(0, "Limit must be positive"),
    monthlyLimit: z.coerce.number().min(0, "Limit must be positive"),
    transactionLimit: z.coerce.number().min(0, "Limit must be positive")
});

type FormData = z.infer<typeof schema>;

interface SetLimitsModalProps {
    cardId: string;
    currentLimits?: {
        dailyLimit?: number;
        monthlyLimit?: number;
        transactionLimit?: number;
    };
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function SetLimitsModal({ cardId, currentLimits, isOpen, onClose, onSuccess }: SetLimitsModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            dailyLimit: currentLimits?.dailyLimit || 0,
            monthlyLimit: currentLimits?.monthlyLimit || 0,
            transactionLimit: currentLimits?.transactionLimit || 0
        }
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await api.put(`/personal/cards/${cardId}/limits`, data);
            toast.success('Card limits updated successfully');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update limits');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Set Card Spending Limits"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Limits'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Set maximum spending limits for this card. Enter 0 for no limit.
                </p>

                <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Daily Limit</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input id="dailyLimit" type="number" step="0.01" className="pl-7" {...register('dailyLimit')} />
                    </div>
                    {errors.dailyLimit && <p className="text-sm text-destructive">{errors.dailyLimit.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="monthlyLimit">Monthly Limit</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input id="monthlyLimit" type="number" step="0.01" className="pl-7" {...register('monthlyLimit')} />
                    </div>
                    {errors.monthlyLimit && <p className="text-sm text-destructive">{errors.monthlyLimit.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="transactionLimit">Per-Transaction Limit</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input id="transactionLimit" type="number" step="0.01" className="pl-7" {...register('transactionLimit')} />
                    </div>
                    {errors.transactionLimit && <p className="text-sm text-destructive">{errors.transactionLimit.message}</p>}
                </div>
            </form>
        </Modal>
    );
}

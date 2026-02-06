"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

const schema = z.object({
    reason: z.enum(['fraud', 'duplicate', 'subscription_cancelled', 'product_not_received', 'other']),
    description: z.string().min(10, "Please provide more details (min 10 chars)").max(1000)
});

type FormData = z.infer<typeof schema>;

interface DisputeModalProps {
    transaction: {
        id: number;
        amount: number;
        merchant_name: string;
        created_at: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function DisputeModal({ transaction, isOpen, onClose, onSuccess }: DisputeModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await api.post(`/disputes`, {
                transactionId: transaction.id,
                ...data
            });
            toast.success('Dispute filed successfully');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to file dispute');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="File a Dispute"
            className="max-w-lg"
        >
            <div className="mb-4 p-3 bg-muted/40 rounded-md text-sm border">
                <p><span className="font-semibold">Merchant:</span> {transaction.merchant_name}</p>
                <p><span className="font-semibold">Amount:</span> ${Number(transaction.amount).toFixed(2)}</p>
                <p><span className="font-semibold">Date:</span> {new Date(transaction.created_at).toLocaleDateString()}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Dispute</Label>
                    <select
                        id="reason"
                        {...register('reason')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="fraud">Fraudulent / Unrecognized</option>
                        <option value="duplicate">Duplicate Charge</option>
                        <option value="subscription_cancelled">Subscription Cancelled (Still Charged)</option>
                        <option value="product_not_received">Goods/Service Not Received</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Please describe why you are disputing this transaction..."
                        {...register('description')}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="destructive" disabled={isSubmitting}>
                        {isSubmitting ? 'Filing...' : 'File Dispute'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

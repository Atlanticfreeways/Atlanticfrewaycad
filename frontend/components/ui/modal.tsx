"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from "lucide-react";
import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, className, footer }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Close on click outside
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center isolate">
                    {/* Backdrop */}
                    <motion.div
                        ref={overlayRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleOverlayClick}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "relative z-50 w-full max-w-lg overflow-hidden rounded-xl bg-background shadow-2xl border border-white/10 mx-4",
                            className
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 rounded-full hover:bg-white/10"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

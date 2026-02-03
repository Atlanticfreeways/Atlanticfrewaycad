'use client';
import './globals.css';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrencyProvider } from '@/lib/contexts/CurrencyContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false
      }
    }
  }));

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CurrencyProvider>
              {children}
              <Toaster position="top-right" richColors />
            </CurrencyProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

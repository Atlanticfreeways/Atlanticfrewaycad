"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const setToken = useAuthStore((state) => state.setToken);

    useEffect(() => {
        if (token) {
            // Save token to store (which persists to localStorage)
            setToken(token);

            // Also ensure cookie is set if not already by backend (backend does set HttpOnly for refresh, access token usually client side)
            // But here the token in URL is the Access Token.
            // We can also decode it to get user info if needed, but the store likely handles fetching profile on load.

            // Redirect to dashboard
            router.push('/dashboard');
        } else {
            // Handle error case
            router.push('/auth/login?error=social_auth_failed');
        }
    }, [token, router, setToken]);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-zinc-400 font-medium">Authenticating...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}

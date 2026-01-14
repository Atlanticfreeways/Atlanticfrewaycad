import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath = path === '/auth/login' || path === '/auth/register';

    // Check for auth token (this is a simplified check, in production use proper validation)
    // Since we are using client-side zustand persist for now, 
    // server-side middleware has limited visibility into local storage.
    // Ideally, we would use cookies for auth tokens.
    // For the MVP with Zustand Persist, we will handle protection mainly on client-side
    // or migrate token to cookies later. 

    // However, for demonstration, if we had a cookie:
    const token = request.cookies.get('auth-token')?.value || '';

    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!isPublicPath && !token && path.startsWith('/dashboard')) {
        // For now, we are relying on Client Components to redirect if no user found in store
        // But let's keep the middleware structure ready.
        // return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/auth/:path*'
    ],
};

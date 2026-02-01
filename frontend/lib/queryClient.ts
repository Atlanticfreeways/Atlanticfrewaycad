import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Stale time: how long data is considered fresh
            staleTime: 1000 * 60 * 5, // 5 minutes default

            // Cache time: how long inactive data stays in cache
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)

            // Retry configuration
            retry: (failureCount, error: any) => {
                // Don't retry on 4xx errors (client errors)
                if (error?.response?.status >= 400 && error?.response?.status < 500) {
                    return false;
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },

            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch on window focus (useful for keeping data fresh)
            refetchOnWindowFocus: false,

            // Refetch on reconnect
            refetchOnReconnect: true,

            // Refetch on mount
            refetchOnMount: true,
        },
        mutations: {
            // Retry mutations once on failure
            retry: 1,

            // Retry delay for mutations
            retryDelay: 1000,
        },
    },
});

// Query keys factory for consistent cache keys
export const queryKeys = {
    // Cards
    cards: {
        all: ['cards'] as const,
        lists: () => [...queryKeys.cards.all, 'list'] as const,
        list: (filters: string) => [...queryKeys.cards.lists(), { filters }] as const,
        details: () => [...queryKeys.cards.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.cards.details(), id] as const,
        byUser: (userToken: string) => [...queryKeys.cards.all, 'user', userToken] as const,
    },

    // Transactions
    transactions: {
        all: ['transactions'] as const,
        lists: () => [...queryKeys.transactions.all, 'list'] as const,
        list: (filters: string) => [...queryKeys.transactions.lists(), { filters }] as const,
        details: () => [...queryKeys.transactions.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
        byCard: (cardToken: string) => [...queryKeys.transactions.all, 'card', cardToken] as const,
        byUser: (userToken: string) => [...queryKeys.transactions.all, 'user', userToken] as const,
    },

    // Users
    users: {
        all: ['users'] as const,
        lists: () => [...queryKeys.users.all, 'list'] as const,
        list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
        details: () => [...queryKeys.users.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.users.details(), id] as const,
    },

    // Balances
    balances: {
        all: ['balances'] as const,
        detail: (userToken: string) => [...queryKeys.balances.all, userToken] as const,
    },

    // Dashboard metrics
    dashboard: {
        metrics: (userToken: string) => ['dashboard', 'metrics', userToken] as const,
    },

    // Card products
    cardProducts: {
        all: ['cardProducts'] as const,
        lists: () => [...queryKeys.cardProducts.all, 'list'] as const,
        list: (filters: string) => [...queryKeys.cardProducts.lists(), { filters }] as const,
        details: () => [...queryKeys.cardProducts.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.cardProducts.details(), id] as const,
    },

    // Funding sources
    fundingSources: {
        all: ['fundingSources'] as const,
        lists: () => [...queryKeys.fundingSources.all, 'list'] as const,
        byUser: (userToken: string) => [...queryKeys.fundingSources.all, 'user', userToken] as const,
    },
} as const;

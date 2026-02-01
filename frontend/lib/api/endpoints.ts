/**
 * Marqeta API Endpoints
 * Base URL: https://sandbox-api.marqeta.com/v3
 */

export const ENDPOINTS = {
    // Card Products
    CARD_PRODUCTS: '/cardproducts',
    CARD_PRODUCT_BY_TOKEN: (token: string) => `/cardproducts/${token}`,

    // Cards
    CARDS: '/cards',
    CARD_BY_TOKEN: (token: string) => `/cards/${token}`,
    CARD_TRANSITIONS: (token: string) => `/cards/${token}/transitions`,
    CARD_BY_USER: (userToken: string) => `/cards/user/${userToken}`,

    // Transactions
    TRANSACTIONS: '/transactions',
    TRANSACTION_BY_TOKEN: (token: string) => `/transactions/${token}`,
    TRANSACTIONS_BY_FUNDING_SOURCE: (token: string) => `/transactions/fundingsource/${token}`,
    TRANSACTIONS_BY_CARD: (cardToken: string) => `/transactions/card/${cardToken}`,

    // Users
    USERS: '/users',
    USER_BY_TOKEN: (token: string) => `/users/${token}`,
    USER_NOTES: (userToken: string) => `/users/${userToken}/notes`,

    // Balances
    BALANCES: (token: string) => `/balances/${token}`,

    // Funding Sources
    FUNDING_SOURCES: '/fundingsources',
    FUNDING_SOURCE_BY_TOKEN: (token: string) => `/fundingsources/${token}`,
    FUNDING_SOURCE_BY_USER: (userToken: string) => `/fundingsources/user/${userToken}`,

    // Businesses (for business cards)
    BUSINESSES: '/businesses',
    BUSINESS_BY_TOKEN: (token: string) => `/businesses/${token}`,

    // Card Transitions (Status changes)
    CARD_TRANSITION_BY_TOKEN: (token: string) => `/cardtransitions/${token}`,

    // Webhooks
    WEBHOOKS: '/webhooks',
    WEBHOOK_BY_TOKEN: (token: string) => `/webhooks/${token}`,

    // Velocity Controls (Spending limits)
    VELOCITY_CONTROLS: '/velocitycontrols',
    VELOCITY_CONTROL_BY_TOKEN: (token: string) => `/velocitycontrols/${token}`,

    // Auth Controls
    AUTH_CONTROLS: '/authcontrols',
    AUTH_CONTROL_BY_TOKEN: (token: string) => `/authcontrols/${token}`,
} as const;

/**
 * Query parameter types for filtering
 */
export interface TransactionQueryParams {
    count?: number;
    start_index?: number;
    fields?: string;
    sort_by?: string;
    start_date?: string;
    end_date?: string;
    type?: string;
    user_token?: string;
    business_token?: string;
    card_token?: string;
    state?: 'PENDING' | 'COMPLETION' | 'DECLINED' | 'ERROR' | 'CLEARED';
}

export interface CardQueryParams {
    count?: number;
    start_index?: number;
    fields?: string;
    sort_by?: string;
    user_token?: string;
    state?: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'UNSUPPORTED' | 'UNACTIVATED' | 'LIMITED';
}

export interface UserQueryParams {
    count?: number;
    start_index?: number;
    fields?: string;
    sort_by?: string;
    search_type?: string;
    search_value?: string;
}

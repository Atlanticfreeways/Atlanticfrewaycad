import apiClient from './client';
import { ENDPOINTS, TransactionQueryParams, CardQueryParams, UserQueryParams } from './endpoints';
import type {
    Card,
    CardProduct,
    Transaction,
    User,
    Balance,
    FundingSource,
    CardTransition,
    MarqetaListResponse,
    CreateCardRequest,
    CardTransitionRequest,
} from '@/types/marqeta';

/**
 * Marqeta API Service Functions
 */

// ============================================================================
// Card Products
// ============================================================================

export const getCardProducts = async (params?: {
    count?: number;
    start_index?: number;
    sort_by?: string;
}): Promise<MarqetaListResponse<CardProduct>> => {
    const response = await apiClient.get(ENDPOINTS.CARD_PRODUCTS, { params });
    return response.data;
};

export const getCardProduct = async (token: string): Promise<CardProduct> => {
    const response = await apiClient.get(ENDPOINTS.CARD_PRODUCT_BY_TOKEN(token));
    return response.data;
};

// ============================================================================
// Cards
// ============================================================================

export const getCards = async (params?: CardQueryParams): Promise<MarqetaListResponse<Card>> => {
    const response = await apiClient.get(ENDPOINTS.CARDS, { params });
    return response.data;
};

export const getCard = async (token: string): Promise<Card> => {
    const response = await apiClient.get(ENDPOINTS.CARD_BY_TOKEN(token));
    return response.data;
};

export const getCardsByUser = async (userToken: string): Promise<MarqetaListResponse<Card>> => {
    const response = await apiClient.get(ENDPOINTS.CARD_BY_USER(userToken));
    return response.data;
};

export const createCard = async (data: CreateCardRequest): Promise<Card> => {
    const response = await apiClient.post(ENDPOINTS.CARDS, data);
    return response.data;
};

export const updateCard = async (token: string, data: Partial<Card>): Promise<Card> => {
    const response = await apiClient.put(ENDPOINTS.CARD_BY_TOKEN(token), data);
    return response.data;
};

// ============================================================================
// Card Transitions (Status Changes)
// ============================================================================

export const createCardTransition = async (
    data: CardTransitionRequest
): Promise<CardTransition> => {
    const response = await apiClient.post(ENDPOINTS.CARD_TRANSITIONS(data.card_token), data);
    return response.data;
};

export const activateCard = async (cardToken: string): Promise<CardTransition> => {
    return createCardTransition({
        card_token: cardToken,
        state: 'ACTIVE',
        reason_code: '00',
        reason: 'Card activated by user',
        channel: 'API',
    });
};

export const suspendCard = async (cardToken: string, reason?: string): Promise<CardTransition> => {
    return createCardTransition({
        card_token: cardToken,
        state: 'SUSPENDED',
        reason_code: '01',
        reason: reason || 'Card suspended by user',
        channel: 'API',
    });
};

export const terminateCard = async (cardToken: string, reason?: string): Promise<CardTransition> => {
    return createCardTransition({
        card_token: cardToken,
        state: 'TERMINATED',
        reason_code: '02',
        reason: reason || 'Card terminated by user',
        channel: 'API',
    });
};

// ============================================================================
// Transactions
// ============================================================================

export const getTransactions = async (
    params?: TransactionQueryParams
): Promise<MarqetaListResponse<Transaction>> => {
    const response = await apiClient.get(ENDPOINTS.TRANSACTIONS, { params });
    return response.data;
};

export const getTransaction = async (token: string): Promise<Transaction> => {
    const response = await apiClient.get(ENDPOINTS.TRANSACTION_BY_TOKEN(token));
    return response.data;
};

export const getTransactionsByCard = async (
    cardToken: string,
    params?: TransactionQueryParams
): Promise<MarqetaListResponse<Transaction>> => {
    const response = await apiClient.get(ENDPOINTS.TRANSACTIONS_BY_CARD(cardToken), { params });
    return response.data;
};

export const getTransactionsByUser = async (
    userToken: string,
    params?: Omit<TransactionQueryParams, 'user_token'>
): Promise<MarqetaListResponse<Transaction>> => {
    const response = await apiClient.get(ENDPOINTS.TRANSACTIONS, {
        params: { ...params, user_token: userToken },
    });
    return response.data;
};

// ============================================================================
// Users
// ============================================================================

export const getUsers = async (params?: UserQueryParams): Promise<MarqetaListResponse<User>> => {
    const response = await apiClient.get(ENDPOINTS.USERS, { params });
    return response.data;
};

export const getUser = async (token: string): Promise<User> => {
    const response = await apiClient.get(ENDPOINTS.USER_BY_TOKEN(token));
    return response.data;
};

export const createUser = async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.post(ENDPOINTS.USERS, data);
    return response.data;
};

export const updateUser = async (token: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put(ENDPOINTS.USER_BY_TOKEN(token), data);
    return response.data;
};

// ============================================================================
// Balances
// ============================================================================

export const getBalance = async (token: string): Promise<Balance> => {
    const response = await apiClient.get(ENDPOINTS.BALANCES(token));
    return response.data;
};

// ============================================================================
// Funding Sources
// ============================================================================

export const getFundingSources = async (params?: {
    count?: number;
    start_index?: number;
}): Promise<MarqetaListResponse<FundingSource>> => {
    const response = await apiClient.get(ENDPOINTS.FUNDING_SOURCES, { params });
    return response.data;
};

export const getFundingSource = async (token: string): Promise<FundingSource> => {
    const response = await apiClient.get(ENDPOINTS.FUNDING_SOURCE_BY_TOKEN(token));
    return response.data;
};

export const getFundingSourcesByUser = async (
    userToken: string
): Promise<MarqetaListResponse<FundingSource>> => {
    const response = await apiClient.get(ENDPOINTS.FUNDING_SOURCE_BY_USER(userToken));
    return response.data;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get dashboard metrics aggregated from various endpoints
 */
export const getDashboardMetrics = async (userToken: string) => {
    const [cards, transactions, balance] = await Promise.all([
        getCardsByUser(userToken),
        getTransactionsByUser(userToken, { count: 100, sort_by: '-user_transaction_time' }),
        getBalance(userToken).catch(() => null), // Balance might not exist for all users
    ]);

    // Calculate total spend (sum of completed transactions)
    const totalSpend = transactions.data
        .filter((t) => t.state === 'COMPLETION' || t.state === 'CLEARED')
        .reduce((sum, t) => sum + t.amount, 0);

    // Count active cards
    const activeCards = cards.data.filter((c) => c.state === 'ACTIVE').length;

    // Count pending transactions (could be approvals)
    const pendingApprovals = transactions.data.filter((t) => t.state === 'PENDING').length;

    // Get available balance
    const availableBalance = balance?.gpa?.available_balance || 0;

    return {
        totalSpend,
        activeCards,
        pendingApprovals,
        availableBalance,
        currencyCode: balance?.gpa?.currency_code || 'USD',
    };
};

/**
 * Marqeta API Type Definitions
 */

// Card Product Types
export interface CardProduct {
    token: string;
    name: string;
    active: boolean;
    start_date: string;
    config: {
        fulfillment?: {
            payment_instrument: 'PHYSICAL_MSR' | 'PHYSICAL_CHIP' | 'VIRTUAL_PAN';
        };
        poi?: {
            ecommerce?: boolean;
            atm?: boolean;
        };
        card_life_cycle?: {
            activate_upon_issue?: boolean;
            expiration_offset?: {
                unit: 'YEARS' | 'MONTHS' | 'DAYS';
                value: number;
            };
        };
    };
    created_time: string;
    last_modified_time: string;
}

// Card Types
export interface Card {
    token: string;
    user_token: string;
    card_product_token: string;
    last_four: string;
    pan: string;
    expiration: string;
    expiration_time: string;
    barcode: string;
    pin_is_set: boolean;
    state: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'UNSUPPORTED' | 'UNACTIVATED' | 'LIMITED';
    state_reason: string;
    fulfillment_status: 'ISSUED' | 'ORDERED' | 'REORDERED' | 'REJECTED' | 'SHIPPED' | 'DELIVERED' | 'DIGITALLY_PRESENTED';
    instrument_type: 'PHYSICAL_MSR' | 'PHYSICAL_CHIP' | 'VIRTUAL_PAN';
    expedite: boolean;
    metadata?: Record<string, string>;
    created_time: string;
    last_modified_time: string;
}

// Transaction Types
export interface Transaction {
    token: string;
    type: 'authorization' | 'authorization.advice' | 'authorization.clearing' | 'authorization.reversal' | 'balanceinquiry' | 'billpayment' | 'cashback' | 'cashdeposit' | 'original.credit.authorization' | 'original.credit.authorization.clearing' | 'pindebit.atm.withdrawal' | 'pindebit.balanceinquiry' | 'pindebit.cashback' | 'pindebit.cashdeposit' | 'pindebit.purchase' | 'pindebit.purchase.reversal' | 'pindebit.refund' | 'refund' | 'refund.authorization' | 'refund.authorization.clearing' | 'transfer' | 'transfer.fee' | 'withdrawal';
    state: 'PENDING' | 'COMPLETION' | 'DECLINED' | 'ERROR' | 'CLEARED';
    identifier: string;
    user_token: string;
    acting_user_token?: string;
    card_token: string;
    gpa_order?: {
        token: string;
        amount: number;
        created_time: string;
        last_modified_time: string;
    };
    duration: number;
    created_time: string;
    user_transaction_time: string;
    settlement_date: string;
    request_amount: number;
    amount: number;
    currency_code: string;
    response: {
        code: string;
        memo: string;
    };
    network: string;
    subnetwork?: string;
    acquirer_fee_amount?: number;
    acquirer?: {
        institution_id_code?: string;
        institution_country?: string;
        retrieval_reference_number?: string;
        system_trace_audit_number?: string;
    };
    user: {
        metadata?: Record<string, string>;
    };
    card: {
        last_four: string;
        metadata?: Record<string, string>;
    };
    card_acceptor?: {
        mid: string;
        mcc: string;
        mcc_groups?: string[];
        name: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
    };
    pos?: {
        pin_present: boolean;
        card_presence: boolean;
        cardholder_presence: boolean;
        partial_approval_capable: boolean;
        purchase_amount_only: boolean;
    };
    merchant?: {
        token: string;
    };
}

// User Types
export interface User {
    token: string;
    active: boolean;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    birth_date?: string;
    ssn?: string;
    company?: string;
    uses_parent_account?: boolean;
    parent_token?: string;
    corporate_card_holder?: boolean;
    metadata?: Record<string, string>;
    account_holder_group_token?: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'UNVERIFIED' | 'LIMITED';
    created_time: string;
    last_modified_time: string;
}

// Balance Types
export interface Balance {
    gpa: {
        ledger_balance: number;
        available_balance: number;
        credit_balance: number;
        pending_credits: number;
        impacted_amount?: number;
        currency_code: string;
        balances?: Record<string, number>;
    };
    created_time: string;
    last_modified_time: string;
}

// Funding Source Types
export interface FundingSource {
    token: string;
    name: string;
    active: boolean;
    is_default_account: boolean;
    created_time: string;
    last_modified_time: string;
    type: 'gpa' | 'program_funding' | 'program_gateway_funding';
}

// Card Transition Types
export interface CardTransition {
    token: string;
    card_token: string;
    user_token: string;
    state: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'UNSUPPORTED' | 'UNACTIVATED' | 'LIMITED';
    reason: string;
    reason_code: string;
    channel: 'API' | 'IVR' | 'FRAUD' | 'ADMIN' | 'SYSTEM';
    fulfillment_status?: string;
    type: 'state.activated' | 'state.suspended' | 'state.terminated' | 'state.unsupported' | 'state.limited' | 'fulfillment.issued' | 'fulfillment.ordered' | 'fulfillment.reordered' | 'fulfillment.rejected' | 'fulfillment.shipped' | 'fulfillment.delivered' | 'fulfillment.digitally_presented';
    created_time: string;
}

// API Response Types
export interface MarqetaListResponse<T> {
    count: number;
    start_index: number;
    end_index: number;
    is_more: boolean;
    data: T[];
}

export interface MarqetaError {
    error_message: string;
    error_code: string;
}

// Create Card Request
export interface CreateCardRequest {
    card_product_token: string;
    user_token: string;
    metadata?: Record<string, string>;
    expedite?: boolean;
    fulfillment?: {
        card_personalization?: {
            text?: {
                name_line_1?: {
                    value: string;
                };
            };
        };
    };
}

// Update Card Request
export interface UpdateCardRequest {
    token: string;
    metadata?: Record<string, string>;
}

// Card Transition Request
export interface CardTransitionRequest {
    card_token: string;
    state: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
    reason_code: string;
    reason?: string;
    channel: 'API' | 'IVR' | 'FRAUD' | 'ADMIN';
}

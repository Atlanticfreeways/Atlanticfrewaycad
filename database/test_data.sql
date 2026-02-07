-- Test data for SpendCtrl MVP

-- Insert test company
INSERT INTO companies (id, name, marqeta_business_token) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'SpendCtrl Demo Company', 'demo_business_token')
ON CONFLICT DO NOTHING;

-- Insert test card product
INSERT INTO card_products (id, company_id, marqeta_product_token, name, daily_limit, monthly_limit) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'demo_product_token',
    'Standard Employee Card',
    500.00,
    5000.00
) ON CONFLICT DO NOTHING;

-- Insert test users (passwords are hashed for: admin123, employee123, manager123)
INSERT INTO users (id, email, password_hash, first_name, last_name, marqeta_user_token, company_id, role, status) VALUES
(
    '550e8400-e29b-41d4-a716-446655440010',
    'admin@spendctrl.demo',
    '$2b$10$rOzJqQZ8Qx8Qx8Qx8Qx8QuJ8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Q',
    'Admin',
    'User',
    'demo_admin_user_token',
    '550e8400-e29b-41d4-a716-446655440000',
    'admin',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    'john.doe@spendctrl.demo',
    '$2b$10$rOzJqQZ8Qx8Qx8Qx8Qx8QuJ8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Q',
    'John',
    'Doe',
    'demo_employee_user_token',
    '550e8400-e29b-41d4-a716-446655440000',
    'employee',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440012',
    'manager@spendctrl.demo',
    '$2b$10$rOzJqQZ8Qx8Qx8Qx8Qx8QuJ8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Q',
    'Manager',
    'Smith',
    'demo_manager_user_token',
    '550e8400-e29b-41d4-a716-446655440000',
    'manager',
    'active'
)
ON CONFLICT DO NOTHING;

-- Insert test cards
INSERT INTO cards (id, user_id, marqeta_card_token, card_product_id, card_type, status, daily_limit, monthly_limit) VALUES
(
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440011',
    'demo_card_token_john',
    '550e8400-e29b-41d4-a716-446655440001',
    'virtual',
    'active',
    500.00,
    5000.00
),
(
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440012',
    'demo_card_token_manager',
    '550e8400-e29b-41d4-a716-446655440001',
    'virtual',
    'active',
    1000.00,
    10000.00
)
ON CONFLICT DO NOTHING;

-- Insert test transactions
INSERT INTO transactions (id, marqeta_transaction_token, card_id, user_id, amount, currency, merchant_name, merchant_category, status, authorization_code) VALUES
(
    '550e8400-e29b-41d4-a716-446655440030',
    'demo_txn_001',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440011',
    25.50,
    'USD',
    'Starbucks Coffee',
    '5814',
    'approved',
    'AUTH001'
),
(
    '550e8400-e29b-41d4-a716-446655440031',
    'demo_txn_002',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440011',
    12.75,
    'USD',
    'Uber Technologies',
    '4121',
    'approved',
    'AUTH002'
),
(
    '550e8400-e29b-41d4-a716-446655440032',
    'demo_txn_003',
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440012',
    89.99,
    'USD',
    'Office Depot',
    '5943',
    'approved',
    'AUTH003'
)
ON CONFLICT DO NOTHING;
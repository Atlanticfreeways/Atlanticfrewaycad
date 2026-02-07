-- SpendCtrl MVP Database Schema

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    marqeta_business_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    marqeta_user_token VARCHAR(255) UNIQUE,
    company_id UUID REFERENCES companies(id),
    role VARCHAR(50) DEFAULT 'employee',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Card products table
CREATE TABLE card_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    marqeta_product_token VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    daily_limit DECIMAL(10,2) DEFAULT 500.00,
    monthly_limit DECIMAL(10,2) DEFAULT 5000.00,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cards table
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    marqeta_card_token VARCHAR(255) UNIQUE NOT NULL,
    card_product_id UUID REFERENCES card_products(id),
    card_type VARCHAR(20) DEFAULT 'virtual',
    status VARCHAR(20) DEFAULT 'active',
    daily_limit DECIMAL(10,2),
    monthly_limit DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marqeta_transaction_token VARCHAR(255) UNIQUE NOT NULL,
    card_id UUID REFERENCES cards(id),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    merchant_name VARCHAR(255),
    merchant_category VARCHAR(100),
    status VARCHAR(20),
    authorization_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Insert default company for MVP
INSERT INTO companies (name) VALUES ('SpendCtrl Demo Company');

-- Insert default card product
INSERT INTO card_products (company_id, marqeta_product_token, name) 
SELECT id, 'demo_product_token', 'Standard Employee Card' 
FROM companies WHERE name = 'SpendCtrl Demo Company';
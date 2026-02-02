const { Pool } = require('pg');

async function addMockTransactions() {
    const pool = new Pool({
        user: 'machine',
        host: 'localhost',
        database: 'atlanticfrewaycard',
        port: 5432,
    });

    try {
        const users = await pool.query("SELECT id, email FROM users WHERE email IN ('admin@atlanticesim.com', 'test@example.com')");

        for (const user of users.rows) {
            console.log(`Adding mock transactions for ${user.email}...`);

            const transactions = [
                { merchant: 'Amazon.com', amount: -120.50, category: 'Shopping' },
                { merchant: 'Starbucks', amount: -15.75, category: 'Food & Dining' },
                { merchant: 'Uber', amount: -28.90, category: 'Transportation' },
                { merchant: 'Deposit', amount: 1500.00, category: 'Income' },
                { merchant: 'Netflix', amount: -19.99, category: 'Entertainment' }
            ];

            for (const tx of transactions) {
                await pool.query(
                    `INSERT INTO transactions (id, marqeta_transaction_token, user_id, amount, currency, merchant_name, merchant_category, status, created_at) 
                     VALUES (gen_random_uuid(), $1, $2, $3, 'USD', $4, $5, 'completed', NOW() - (random() * interval '7 days'))`,
                    ['TXN_' + Math.random().toString(36).substr(2, 9), user.id, tx.amount, tx.merchant, tx.category]
                );
            }
        }
        console.log('Mock transactions added successfully.');
    } catch (err) {
        console.error('Error adding mock transactions:', err);
    } finally {
        await pool.end();
    }
}

addMockTransactions();

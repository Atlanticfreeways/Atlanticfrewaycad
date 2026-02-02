const { Pool } = require('pg');
const WalletRepository = require('../src/database/repositories/WalletRepository');

async function fixWallets() {
    const pool = new Pool({
        user: 'machine',
        host: 'localhost',
        database: 'atlanticfrewaycard',
        port: 5432,
    });

    try {
        const walletRepo = new WalletRepository(pool);
        const users = await pool.query('SELECT id, email FROM users');

        for (const user of users.rows) {
            console.log(`Checking/Creating wallet for ${user.email}...`);
            await walletRepo.create(user.id);
            // Also give them some starting balance for testing
            await walletRepo.addFunds(user.id, 5000.00, 'USD');
        }
        console.log('Wallet fix complete.');
    } catch (err) {
        console.error('Error fixing wallets:', err);
    } finally {
        await pool.end();
    }
}

fixWallets();

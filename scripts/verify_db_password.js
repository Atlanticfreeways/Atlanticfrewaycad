const { Pool } = require('pg');
const PasswordService = require('../src/services/auth/PasswordService');
require('dotenv').config();

async function verify() {
    const pool = new Pool({
        user: 'machine',
        host: 'localhost',
        database: 'atlanticfrewaycard',
        port: 5432,
    });

    const email = 'admin@atlanticesim.com';
    const password = 'TestPass123!';

    try {
        const res = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
        if (res.rowCount === 0) {
            console.log('User not found');
            return;
        }
        const hash = res.rows[0].password_hash;
        console.log('Found hash:', hash);
        const valid = await PasswordService.compare(password, hash);
        console.log('Is valid:', valid);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

verify();

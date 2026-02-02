const PasswordService = require('../src/services/auth/PasswordService');
const { Pool } = require('pg');
require('dotenv').config();

async function test() {
    const pool = new Pool({
        user: 'machine',
        host: 'localhost',
        database: 'atlanticfrewaycard',
        port: 5432,
    });

    const email = 'admin@atlanticesim.com';
    const password = 'TestPass123!';

    const res = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
    const hash = res.rows[0].password_hash;

    console.log('Testing password:', password);
    console.log('Against hash:', hash);

    const valid = await PasswordService.compare(password, hash);
    console.log('Result:', valid);

    await pool.end();
}

test();

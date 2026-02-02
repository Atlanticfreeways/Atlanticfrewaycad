const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function reset() {
    const pool = new Pool({
        user: 'machine',
        host: 'localhost',
        database: 'atlanticfrewaycard',
        port: 5432,
    });

    const email = 'admin@atlanticesim.com';
    const password = 'password123';
    const hash = await bcrypt.hash(password, 12);

    try {
        await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
        console.log('Password reset to: password123');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

reset();

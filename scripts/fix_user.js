const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function fixUser() {
    const pool = new Pool({
        user: 'machine',
        host: 'localhost',
        database: 'atlanticfrewaycard',
        port: 5432,
    });

    const email = 'test@example.com';
    const password = 'TestPass123!';
    const hash = await bcrypt.hash(password, 12);

    try {
        const res = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id',
            [hash, email]
        );
        if (res.rowCount === 0) {
            console.log('User not found, creating user...');
            await pool.query(
                `INSERT INTO users (id, email, password_hash, first_name, last_name, account_type, role, status) 
                 VALUES (gen_random_uuid(), $1, $2, 'Test', 'User', 'personal', 'personal', 'active')`,
                [email, hash]
            );
            console.log('User created successfully');
        } else {
            console.log('User password updated successfully');
        }
    } catch (err) {
        console.error('Error fixing user:', err);
    } finally {
        await pool.end();
    }
}

fixUser();

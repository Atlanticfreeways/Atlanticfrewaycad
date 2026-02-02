const PasswordService = require('../src/services/auth/PasswordService');
require('dotenv').config();

async function verify() {
    const password = 'TestPass123!';
    const hash = '$2a$12$K8Fy7QCOALnUgYfiOuW.D.ESTSc6DEmdk.GUbeybqygt04T.pYrb.';
    const valid = await PasswordService.compare(password, hash);
    console.log('Is valid:', valid);
}

verify();

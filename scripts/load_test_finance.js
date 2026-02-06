const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
const CONCURRENCY = 20; // Keep concurrency low to respect rate limits if enabled
const TOTAL_REQUESTS = 100;

async function run() {
    console.log('Starting Load Test on Finance Overview Endpoint...');

    // 1. Register/Login
    const email = `loadtest_${Date.now()}@test.com`;
    const password = 'TestPassword123!';
    let token;

    try {
        console.log(`Registering user ${email}...`);
        const regRes = await axios.post(`${BASE_URL}/auth/register`, {
            email,
            password,
            firstName: 'Load',
            lastName: 'Tester',
            accountType: 'business'
        });
        token = regRes.data.accessToken;
        console.log('User registered and authenticated.');
    } catch (err) {
        console.error('Registration failed:', err.response?.data || err.message);
        // Try login info logic? No, just fail.
        return;
    }

    // 2. Load Test
    console.log(`Sending ${TOTAL_REQUESTS} requests...`);
    const start = Date.now();
    let completed = 0;
    let errors = 0;
    const latencies = [];

    const requests = Array.from({ length: TOTAL_REQUESTS }, async (_, i) => {
        const reqStart = Date.now();
        try {
            await axios.get(`${BASE_URL}/business/finance/overview`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            latencies.push(Date.now() - reqStart);
            completed++;
            if (completed % 10 === 0) process.stdout.write('.');
        } catch (err) {
            errors++;
            // console.error(`Req ${i} failed`, err.message);
        }
    });

    await Promise.all(requests);

    const end = Date.now();
    const duration = (end - start) / 1000;
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log(`\n
    === Load Test Results ===
    Endpoint: GET /business/finance/overview
    Total Requests: ${TOTAL_REQUESTS}
    Concurrency (Async): ${TOTAL_REQUESTS} (Simulated)
    Duration: ${duration.toFixed(2)}s
    RPS: ${(TOTAL_REQUESTS / duration).toFixed(2)}
    Avg Latency: ${avgLatency.toFixed(2)}ms
    Errors: ${errors}
    =========================
    `);
}

run();

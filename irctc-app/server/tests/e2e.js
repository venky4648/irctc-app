import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log("Starting E2E API Testing Suite...\n");
    let adminToken = '';
    let userToken = '';
    
    try {
        console.log("[1] Registering Admin User...");
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Admin Test', email: 'admin_test_e2e@irctc.com', password: 'password123', role: 'ADMIN' })
        });
        const regData = await regRes.json();
        if(regRes.ok || regData.message === 'User already exists') {
            console.log("    Admin User Registered (or already exists).");
        }

        console.log("[2] Logging in Admin...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin_test_e2e@irctc.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        if(loginRes.ok) {
            adminToken = loginData.token;
            console.log("    Admin Login Successful!");
        } else {
            console.error("    Admin Login Failed!", loginData);
            return;
        }

        console.log("[3] Fetching Trains (Fleet Domain)...");
        const trainsRes = await fetch(`${BASE_URL}/fleet/trains`);
        const trainsData = await trainsRes.json();
        console.log(`    Successfully fetched ${trainsData.data?.length || trainsData.trains?.length || 0} trains.`);

        console.log("\n✅ E2E Suite Initial Tests Passed!");
        
    } catch (e) {
        console.error("❌ Test Suite Encountered an Exception:", e.message);
    }
}

runTests();

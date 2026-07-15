import request from 'supertest';
import app from '../server.js'; // Might need to export app from server.js

// Using mock since DB might not have real emails
describe('Notification API', () => {
    let token = '';

    beforeAll(async () => {
        // Authenticate (Mock)
        const res = await request(app).post('/api/auth/login').send({
            email: 'admin@irctc.com', // assuming seed exists
            password: 'password123'
        });
        token = res.body.token;
    });

    it('should generate OTP', async () => {
        const res = await request(app)
            .post('/api/notifications/otp/send')
            .send({ email: 'test@example.com', purpose: 'TEST' });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should get notification history', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should update preferences', async () => {
        const res = await request(app)
            .put('/api/notifications/preferences')
            .set('Authorization', `Bearer ${token}`)
            .send({ email_enabled: false });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.email_enabled).toBe(false);
    });
});

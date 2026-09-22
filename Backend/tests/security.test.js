const request = require('supertest')
const app = require('../src/app')
const { registerAndGetCookie, TEST_USER, TEST_JD } = require('./helpers')

describe('Security & platform', () => {
    describe('GET /api/health', () => {
        it('reports liveness with uptime', async () => {
            const res = await request(app).get('/api/health')

            expect(res.status).toBe(200)
            expect(res.body.status).toBe('ok')
            expect(typeof res.body.uptime).toBe('number')
        })
    })

    describe('security headers', () => {
        it('sets helmet headers on API responses', async () => {
            const res = await request(app).get('/api/health')

            expect(res.headers['x-content-type-options']).toBe('nosniff')
            expect(res.headers['x-frame-options']).toBeTruthy()
        })
    })

    describe('unknown routes', () => {
        it('returns a structured 404', async () => {
            const res = await request(app).get('/api/does-not-exist')

            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toMatch(/route not found/i)
        })
    })

    describe('OpenAPI docs', () => {
        it('serves the swagger spec json', async () => {
            const res = await request(app).get('/api/docs.json')

            expect(res.status).toBe(200)
            expect(res.body.openapi).toBe('3.0.0')
            expect(res.body.paths).toHaveProperty('/api/auth/login')
            expect(res.body.paths).toHaveProperty('/api/interview')
        })
    })

    describe('rate limiting', () => {
        it('applies the tighter AI limit to report generation', async () => {
            const cookie = await registerAndGetCookie(request(app))
            let lastRes

            // aiLimiter allows 10 per window; the first failures are 400/500, not 429
            for (let i = 0; i < 12; i += 1) {
                lastRes = await request(app)
                    .post('/api/interview')
                    .set('Cookie', cookie)
                    .field('jobDescription', TEST_JD)
                    .field('selfDescription', 'backend dev')
            }

            expect(lastRes.status).toBe(429)
        }, 30_000)

        // Runs last: it exhausts the shared 15-minute auth limit for this IP,
        // so anything hitting /api/auth after this test would get 429s.
        it('blocks auth brute-force attempts with 429 after the limit', async () => {
            const target = { email: TEST_USER.email, password: 'wrongPassword1' }
            let lastRes

            // authLimiter allows 20 attempts per window
            for (let i = 0; i < 22; i += 1) {
                lastRes = await request(app).post('/api/auth/login').send(target)
            }

            expect(lastRes.status).toBe(429)
            expect(lastRes.body.success).toBe(false)
        }, 30_000)
    })
})

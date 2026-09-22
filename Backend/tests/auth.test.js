const request = require('supertest')
const app = require('../src/app')
const userModel = require('../src/models/user.model')
const { registerAndGetCookie, TEST_USER } = require('./helpers')

describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        it('registers a new user and sets an httpOnly cookie', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(TEST_USER)

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.user).toMatchObject({ username: TEST_USER.username, email: TEST_USER.email })
            expect(res.body.user).not.toHaveProperty('password')

            const cookie = res.headers['set-cookie'][0]
            expect(cookie).toMatch(/HttpOnly/i)

            const saved = await userModel.findOne({ email: TEST_USER.email })
            expect(saved).toBeTruthy()
            expect(saved.password).not.toBe(TEST_USER.password) // hashed
        })

        it('rejects registration with an existing email (409)', async () => {
            await request(app).post('/api/auth/register').send(TEST_USER)

            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...TEST_USER, username: 'anothername' })

            expect(res.status).toBe(409)
            expect(res.body.success).toBe(false)
        })

        it('rejects invalid payloads with field-level messages (400)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'a', email: 'not-an-email', password: '123' })

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(typeof res.body.message).toBe('string')
        })
    })

    describe('POST /api/auth/login', () => {
        it('logs in with valid credentials', async () => {
            await registerAndGetCookie(request(app))

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: TEST_USER.email, password: TEST_USER.password })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.headers['set-cookie'][0]).toMatch(/token=/)
        })

        it('rejects a wrong password without revealing which field failed (401)', async () => {
            await registerAndGetCookie(request(app))

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: TEST_USER.email, password: 'wrongPassword1' })

            expect(res.status).toBe(401)
            expect(res.body.message).toBe('Invalid email or password')
        })

        it('rejects an unknown email the same way (401)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nobody@example.com', password: 'whatever123' })

            expect(res.status).toBe(401)
            expect(res.body.message).toBe('Invalid email or password')
        })
    })

    describe('GET /api/auth/get-me', () => {
        it('returns the current user for a valid session', async () => {
            const cookie = await registerAndGetCookie(request(app))

            const res = await request(app).get('/api/auth/get-me').set('Cookie', cookie)

            expect(res.status).toBe(200)
            expect(res.body.user.email).toBe(TEST_USER.email)
        })

        it('returns 401 without a token', async () => {
            const res = await request(app).get('/api/auth/get-me')
            expect(res.status).toBe(401)
        })

        it('returns 401 after logout blacklists the token', async () => {
            const cookie = await registerAndGetCookie(request(app))
            await request(app).get('/api/auth/logout').set('Cookie', cookie)

            const res = await request(app).get('/api/auth/get-me').set('Cookie', cookie)
            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/auth/logout', () => {
        it('clears the token cookie', async () => {
            const cookie = await registerAndGetCookie(request(app))

            const res = await request(app).get('/api/auth/logout').set('Cookie', cookie)

            expect(res.status).toBe(200)
            const cleared = res.headers['set-cookie'].find((c) => c.startsWith('token='))
            expect(cleared).toBeTruthy()
        })
    })
})

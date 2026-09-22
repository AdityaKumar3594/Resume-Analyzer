const request = require('supertest')
const app = require('../src/app')
const interviewReportModel = require('../src/models/interviewReport.model')
const aiService = require('../src/services/ai.service')
const { registerAndGetCookie, buildMinimalPdf, mockReportPayload, TEST_JD } = require('./helpers')

jest.mock('../src/services/ai.service')

describe('Interview API', () => {
    let cookie

    beforeEach(async () => {
        cookie = await registerAndGetCookie(request(app))
        aiService.generateInterviewReport.mockResolvedValue(mockReportPayload())
        aiService.generateResumePdf.mockResolvedValue(Buffer.from('%PDF-fake-resume'))
    })

    describe('POST /api/interview', () => {
        it('generates a report from a self description and stores it (201)', async () => {
            const res = await request(app)
                .post('/api/interview')
                .set('Cookie', cookie)
                .field('jobDescription', TEST_JD)
                .field('selfDescription', 'I am a backend developer with 2 years of Express experience.')

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.interviewReport).toMatchObject({
                matchScore: 72,
                title: 'Node.js Developer',
                user: expect.anything()
            })
            expect(aiService.generateInterviewReport).toHaveBeenCalledTimes(1)

            const stored = await interviewReportModel.findOne({ user: res.body.interviewReport.user })
            expect(stored).toBeTruthy()
            expect(stored.title).toBe('Node.js Developer')
        })

        it('extracts resume text from an uploaded PDF', async () => {
            const res = await request(app)
                .post('/api/interview')
                .set('Cookie', cookie)
                .field('jobDescription', TEST_JD)
                .attach('resume', await buildMinimalPdf('Node.js developer with MongoDB experience'), {
                    filename: 'resume.pdf',
                    contentType: 'application/pdf'
                })

            expect(res.status).toBe(201)
            const stored = await interviewReportModel.findOne({})
            expect(stored.resume).toContain('Node.js developer with MongoDB experience')
        })

        it('rejects non-PDF uploads (400)', async () => {
            const res = await request(app)
                .post('/api/interview')
                .set('Cookie', cookie)
                .field('jobDescription', TEST_JD)
                .attach('resume', Buffer.from('not a pdf'), {
                    filename: 'resume.txt',
                    contentType: 'text/plain'
                })

            expect(res.status).toBe(400)
            expect(res.body.message).toMatch(/pdf/i)
        })

        it('rejects an empty submission with no resume and no self description (400)', async () => {
            const res = await request(app)
                .post('/api/interview')
                .set('Cookie', cookie)
                .field('jobDescription', TEST_JD)

            expect(res.status).toBe(400)
            expect(res.body.message).toMatch(/resume or self description/i)
        })

        it('requires authentication (401)', async () => {
            const res = await request(app)
                .post('/api/interview')
                .field('jobDescription', TEST_JD)

            expect(res.status).toBe(401)
        })

        it('propagates AI service failures as a 500 with a clean message', async () => {
            aiService.generateInterviewReport.mockRejectedValue(new Error('quota exceeded'))

            const res = await request(app)
                .post('/api/interview')
                .set('Cookie', cookie)
                .field('jobDescription', TEST_JD)
                .field('selfDescription', 'backend dev')

            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
        })
    })

    describe('GET /api/interview/report/:interviewId', () => {
        it("returns the owner's report", async () => {
            const report = await interviewReportModel.create({
                user: '507f1f77bcf86cd799439011', // replaced below with real user id
                jobDescription: TEST_JD,
                title: 'Node.js Developer',
                matchScore: 80
            })

            const me = await request(app).get('/api/auth/get-me').set('Cookie', cookie)
            report.user = me.body.user.id
            await report.save()

            const res = await request(app)
                .get(`/api/interview/report/${report._id}`)
                .set('Cookie', cookie)

            expect(res.status).toBe(200)
            expect(res.body.interviewReport.title).toBe('Node.js Developer')
        })

        it("hides other users' reports (404)", async () => {
            const otherUserCookie = await registerAndGetCookie(request(app), {
                username: 'otheruser',
                email: 'other@example.com'
            })

            const me = await request(app).get('/api/auth/get-me').set('Cookie', otherUserCookie)
            await interviewReportModel.create({
                user: me.body.user.id,
                jobDescription: TEST_JD,
                title: 'Other Report'
            })

            const res = await request(app)
                .get(`/api/interview/report/${(await interviewReportModel.findOne({}))._id}`)
                .set('Cookie', cookie) // different user

            expect(res.status).toBe(404)
        })

        it('rejects malformed ids (400)', async () => {
            const res = await request(app)
                .get('/api/interview/report/not-an-object-id')
                .set('Cookie', cookie)

            expect(res.status).toBe(400)
        })
    })

    describe('GET /api/interview', () => {
        it('lists the user reports newest first without heavy fields', async () => {
            const me = await request(app).get('/api/auth/get-me').set('Cookie', cookie)
            const userId = me.body.user.id

            await interviewReportModel.create({ user: userId, jobDescription: TEST_JD, title: 'Report A', resume: 'long text', createdAt: new Date(Date.now() - 5_000) })
            await interviewReportModel.create({ user: userId, jobDescription: TEST_JD, title: 'Report B', resume: 'long text', createdAt: new Date() })

            const res = await request(app).get('/api/interview').set('Cookie', cookie)

            expect(res.status).toBe(200)
            expect(res.body.interviewReports).toHaveLength(2)
            expect(res.body.interviewReports[0].title).toBe('Report B')
            expect(res.body.interviewReports[0].resume).toBeUndefined()
            expect(res.body.interviewReports[0].technicalQuestions).toBeUndefined()
        })
    })

    describe('POST /api/interview/resume/pdf/:interviewReportId', () => {
        it('streams a generated PDF for a valid report', async () => {
            const me = await request(app).get('/api/auth/get-me').set('Cookie', cookie)
            const report = await interviewReportModel.create({
                user: me.body.user.id,
                jobDescription: TEST_JD,
                title: 'Node.js Developer'
            })

            const res = await request(app)
                .post(`/api/interview/resume/pdf/${report._id}`)
                .set('Cookie', cookie)

            expect(res.status).toBe(200)
            expect(res.headers['content-type']).toMatch(/application\/pdf/)
            expect(Number(res.headers['content-length'])).toBeGreaterThan(0)
        })

        it('returns 404 for an unknown report id', async () => {
            const res = await request(app)
                .post('/api/interview/resume/pdf/507f1f77bcf86cd799439099')
                .set('Cookie', cookie)

            expect(res.status).toBe(404)
        })
    })
})

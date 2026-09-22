/**
 * Builds a small, spec-valid PDF containing a single line of text using
 * pdf-lib, so tests can exercise the real pdf-parse extraction path
 * without committing a binary fixture file.
 */
async function buildMinimalPdf(text) {
    const { PDFDocument, StandardFonts } = require("pdf-lib")

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const page = pdfDoc.addPage([ 595, 842 ])
    page.drawText(text, {
        x: 60,
        y: 780,
        size: 12,
        font
    })

    const bytes = await pdfDoc.save()
    return Buffer.from(bytes)
}

const TEST_USER = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'superSecret123'
}

const TEST_JD = 'We are hiring a Node.js developer with MongoDB and REST API experience.'

/**
 * Registers a fresh user and returns their auth cookie for authenticated requests.
 */
async function registerAndGetCookie(request, overrides = {}) {
    const payload = { ...TEST_USER, ...overrides }
    const res = await request
        .post('/api/auth/register')
        .send(payload)

    if (res.status !== 201) {
        throw new Error(`Test setup failed to register user: ${JSON.stringify(res.body)}`)
    }

    return res.headers['set-cookie'][0]
}

/**
 * The shape the mocked Gemini client must return for report generation.
 */
function mockReportPayload() {
    return {
        matchScore: 72,
        title: 'Node.js Developer',
        technicalQuestions: [
            {
                question: 'How do you handle error middleware in Express?',
                intention: 'Check understanding of Express error flow',
                answer: 'Use a 4-argument error middleware registered last.'
            }
        ],
        behavioralQuestions: [
            {
                question: 'Tell me about a technical disagreement.',
                intention: 'Communication and openness',
                answer: 'Describe a data-driven resolution.'
            }
        ],
        skillGaps: [
            { skill: 'system design', severity: 'medium' }
        ],
        preparationPlan: [
            { day: 1, focus: 'REST APIs', tasks: [ 'Review Express error handling' ] }
        ]
    }
}

module.exports = { buildMinimalPdf, registerAndGetCookie, mockReportPayload, TEST_USER, TEST_JD }

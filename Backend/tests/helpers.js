/**
 * Builds a tiny but structurally valid PDF containing a single line of text,
 * so tests can exercise the real pdf-parse extraction path without a fixture file.
 */
function buildMinimalPdf(text) {
    const content = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
        `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    ]

    let pdf = '%PDF-1.4\n'
    const offsets = []
    objects.forEach((obj, index) => {
        offsets.push(pdf.length)
        pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`
    })

    const xrefStart = pdf.length
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    offsets.forEach((offset) => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
    })
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

    return Buffer.from(pdf, 'latin1')
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

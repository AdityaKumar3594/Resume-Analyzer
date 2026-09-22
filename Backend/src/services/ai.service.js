const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")

const isProd = process.env.NODE_ENV === "production"
const puppeteer = isProd ? require("puppeteer-core") : require("puppeteer")
const chromium = isProd ? require("@sparticuz/chromium") : null

const REPORT_MODEL = process.env.GEMINI_REPORT_MODEL || "gemini-2.5-flash"
const RESUME_MODEL = process.env.GEMINI_RESUME_MODEL || "gemini-2.5-flash"

if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn("[ai.service] GOOGLE_GENAI_API_KEY is not set — AI endpoints will fail at runtime.")
}

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const questionSchema = z.object({
    question: z.string().describe("The question that can be asked in the interview"),
    intention: z.string().describe("The intention of interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
})

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job described"),
    technicalQuestions: z.array(questionSchema).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(questionSchema).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated")
})

const resumePdfSchema = z.object({
    html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate based on the following details:
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}`

    const response = await ai.models.generateContent({
        model: REPORT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: z.toJSONSchema(interviewReportSchema)
        }
    })

    const parsed = interviewReportSchema.safeParse(JSON.parse(response.text))
    if (!parsed.success) {
        const issue = parsed.error.issues[0]
        throw new Error(`AI report failed schema validation at "${issue.path.join(".")}"`)
    }
    return parsed.data
}

/**
 * Launches headless Chromium for PDF rendering.
 * In production (@sparticuz/chromium) the binary is extracted to /tmp on
 * first use, so the browser is kept alive and reused across requests to
 * avoid paying that cold-start cost on every PDF download.
 */
let cachedBrowser = null
async function getBrowser() {
    if (cachedBrowser) return cachedBrowser

    const launchOptions = isProd
        ? {
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport
        }
        : { headless: "new" }

    cachedBrowser = await puppeteer.launch(launchOptions)

    if (isProd) {
        cachedBrowser.on("disconnected", () => {
            cachedBrowser = null
        })
    }

    return cachedBrowser
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await getBrowser()
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await page.close()
    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: RESUME_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: z.toJSONSchema(resumePdfSchema)
        }
    })

    const jsonContent = resumePdfSchema.parse(JSON.parse(response.text))
    return generatePdfFromHtml(jsonContent.html)
}

module.exports = { generateInterviewReport, generateResumePdf }

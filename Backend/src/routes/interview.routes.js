const express = require("express")
const interviewController = require("../controllers/interview.controller")
const { authUser } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const { aiLimiter } = require("../middlewares/rateLimit.middleware")
const upload = require("../middlewares/file.middleware")
const {
    generateReportSchema,
    interviewIdParamsSchema,
    reportIdParamsSchema
} = require("../validations/interview.validation")

const interviewRouter = express.Router()

/**
 * @openapi
 * /api/interview:
 *   post:
 *     tags: [Interview]
 *     summary: Generate a new AI interview report
 *     description: >
 *       Generates technical/behavioral questions, skill gaps and a preparation
 *       roadmap by analysing the resume (PDF upload) or self description
 *       against the job description using Google Gemini.
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [jobDescription]
 *             properties:
 *               jobDescription:
 *                 type: string
 *                 example: We are looking for a Node.js developer with 2+ years of experience...
 *               selfDescription:
 *                 type: string
 *                 example: I have 2 years of experience building REST APIs with Express and MongoDB.
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume as a PDF file (max 3MB)
 *     responses:
 *       201:
 *         description: Interview report generated
 *       400:
 *         description: Missing job description, non-PDF upload, or no profile source
 *       429:
 *         description: Generation limit reached (10 per 15 minutes)
 */
interviewRouter.post("/", authUser, aiLimiter, upload.single("resume"), validate({ body: generateReportSchema }), interviewController.generateInterViewReportController)

/**
 * @openapi
 * /api/interview/report/{interviewId}:
 *   get:
 *     tags: [Interview]
 *     summary: Get an interview report by id
 *     parameters:
 *       - in: path
 *         name: interviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview report
 *       404:
 *         description: Report not found for this user
 */
interviewRouter.get("/report/:interviewId", authUser, validate({ params: interviewIdParamsSchema }), interviewController.getInterviewReportByIdController)

/**
 * @openapi
 * /api/interview:
 *   get:
 *     tags: [Interview]
 *     summary: List all interview reports of the logged-in user
 *     responses:
 *       200:
 *         description: Reports sorted newest first (summary fields only)
 */
interviewRouter.get("/", authUser, interviewController.getAllInterviewReportsController)

/**
 * @openapi
 * /api/interview/resume/pdf/{interviewReportId}:
 *   post:
 *     tags: [Interview]
 *     summary: Generate a tailored resume PDF for an interview report
 *     parameters:
 *       - in: path
 *         name: interviewReportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: application/pdf stream
 *       404:
 *         description: Report not found
 *       429:
 *         description: Generation limit reached
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authUser, aiLimiter, validate({ params: reportIdParamsSchema }), interviewController.generateResumePdfController)

module.exports = interviewRouter

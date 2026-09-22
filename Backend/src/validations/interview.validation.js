const { z } = require("zod")

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid interview report id")

const generateReportSchema = z.object({
    jobDescription: z.string()
        .trim()
        .min(1, "Job description is required")
        .max(20000, "Job description is too long"),
    selfDescription: z.string()
        .trim()
        .max(20000, "Self description is too long")
        .optional()
        .default("")
})

const interviewIdParamsSchema = z.object({
    interviewId: objectId
})

const reportIdParamsSchema = z.object({
    interviewReportId: objectId
})

module.exports = { generateReportSchema, interviewIdParamsSchema, reportIdParamsSchema }

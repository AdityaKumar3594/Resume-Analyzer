const pdfParse = require("pdf-parse")
const interviewReportModel = require("../models/interviewReport.model")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const { asyncHandler, ApiError } = require("../middlewares/error.middleware")

let cachedPdfParser = null
const getPdfParser = async () => {
    if (cachedPdfParser) return cachedPdfParser

    if (typeof pdfParse === "function") {
        cachedPdfParser = pdfParse
        return cachedPdfParser
    }

    if (pdfParse && typeof pdfParse.default === "function") {
        cachedPdfParser = pdfParse.default
        return cachedPdfParser
    }

    try {
        const mod = await import("pdf-parse")
        if (typeof mod === "function") {
            cachedPdfParser = mod
            return cachedPdfParser
        }
        if (mod && typeof mod.default === "function") {
            cachedPdfParser = mod.default
            return cachedPdfParser
        }
    } catch (err) {
        // ignore and fall through
    }

    return null
}

/**
 * @description Generate an interview report from the user's resume/self-description and a job description.
 * @access Private
 */
const generateInterViewReportController = asyncHandler(async (req, res) => {
    const { selfDescription, jobDescription } = req.body
    let resumeText = ""

    if (req.file?.buffer) {
        const parsePdf = await getPdfParser()
        if (!parsePdf) {
            throw new ApiError(500, "PDF parser is not available on the server.")
        }
        const resumeContent = await parsePdf(req.file.buffer)
        resumeText = resumeContent?.text ?? ""
    }

    if (!resumeText && !selfDescription) {
        throw new ApiError(400, "Either resume or self description is required.")
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        success: true,
        message: "Interview report generated successfully.",
        interviewReport
    })
})

/**
 * @description Get an interview report by interviewId.
 * @access Private
 */
const getInterviewReportByIdController = asyncHandler(async (req, res) => {
    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        throw new ApiError(404, "Interview report not found.")
    }

    res.status(200).json({
        success: true,
        message: "Interview report fetched successfully.",
        interviewReport
    })
})

/**
 * @description Get all interview reports of the logged-in user.
 * @access Private
 */
const getAllInterviewReportsController = asyncHandler(async (req, res) => {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        success: true,
        message: "Interview reports fetched successfully.",
        interviewReports
    })
})

/**
 * @description Generate a tailored resume PDF for a stored interview report.
 * @access Private
 */
const generateResumePdfController = asyncHandler(async (req, res) => {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        throw new ApiError(404, "Interview report not found.")
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
})

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}

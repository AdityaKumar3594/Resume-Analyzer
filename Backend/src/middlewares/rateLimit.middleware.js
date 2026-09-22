const rateLimit = require("express-rate-limit")

/** Basic protection for every API route. */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." }
})

/** Brute-force protection for credential endpoints. */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts, please try again in 15 minutes." }
})

/**
 * Report generation calls Google Gemini on every request — keep it tight
 * so a runaway client cannot burn the API quota.
 */
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Report generation limit reached (10 per 15 minutes). Please try again later." }
})

module.exports = { generalLimiter, authLimiter, aiLimiter }

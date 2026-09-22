/**
 * Centralised error handling for the API.
 * Every error surfaced by the app is normalised into an ApiError and
 * serialised as `{ success, message }` so clients get a consistent shape.
 */

class ApiError extends Error {
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)
    }
}

/**
 * Wrap an async route handler so rejected promises reach the error handler.
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

function notFoundHandler(req, res, next) {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500
    let message = err.message || "Internal server error"

    // Multer: uploaded file too large
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 413
        message = "Resume file is too large. Maximum allowed size is 3MB."
    }

    // Mongoose: duplicate key (unique index race)
    if (err.code === 11000) {
        statusCode = 409
        const field = Object.keys(err.keyValue || {})[0] ?? "field"
        message = `An account already exists with this ${field}`
    }

    // Mongoose: invalid ObjectId
    if (err.name === "CastError") {
        statusCode = 400
        message = `Invalid ${err.path}: ${err.value}`
    }

    // Mongoose: schema validation
    if (err.name === "ValidationError") {
        statusCode = 400
        message = Object.values(err.errors).map((e) => e.message).join(", ")
    }

    // Malformed JSON body
    if (err.type === "entity.parse.failed") {
        statusCode = 400
        message = "Invalid JSON payload."
    }

    if (statusCode >= 500) {
        console.error("[error]", err)
    }

    res.status(statusCode).json({
        success: false,
        message
    })
}

module.exports = { ApiError, asyncHandler, notFoundHandler, errorHandler }

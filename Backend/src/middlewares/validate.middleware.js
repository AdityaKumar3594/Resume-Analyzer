/**
 * Zod-powered request validation middleware.
 * Parses `body`, `query` and `params` against the provided schemas and
 * replaces `req.body` / `req.query` with the coerced, cleaned values
 * (e.g. trimmed + lowercased emails) before the controller runs.
 */
const { ApiError } = require("./error.middleware")

const validate = (schemas) => (req, res, next) => {
    try {
        const parsed = {}
        for (const key of [ "body", "query", "params" ]) {
            if (schemas[key]) {
                parsed[key] = schemas[key].parse(req[key])
            }
        }

        // req.params is read-only in Express 5 — validating it is enough,
        // controllers keep reading the original values.
        if (parsed.body) req.body = parsed.body
        if (parsed.query) req.query = parsed.query

        next()
    } catch (error) {
        const issues = error.issues ?? error.errors ?? []
        const first = issues[0]
        const path = first?.path?.join(".")
        next(new ApiError(400, path ? `${path}: ${first.message}` : first?.message ?? "Invalid request payload."))
    }
}

module.exports = { validate }

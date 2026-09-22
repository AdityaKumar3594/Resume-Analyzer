const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const { asyncHandler, ApiError } = require("../middlewares/error.middleware")

/**
 * @description Verifies the httpOnly JWT cookie, checks the token blacklist
 *              and attaches `{ id, username }` to `req.user`.
 * @access Private routes only
 */
const authUser = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        throw new ApiError(401, "Token not provided.")
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })

    if (isTokenBlacklisted) {
        throw new ApiError(401, "Token is invalid.")
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        throw new ApiError(401, "Invalid token.")
    }
})

module.exports = { authUser }

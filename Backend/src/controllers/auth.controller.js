const userModel = require("../models/user.model")
const tokenBlacklistModel = require("../models/blacklist.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { asyncHandler, ApiError } = require("../middlewares/error.middleware")

function getCookieOptions() {
    return {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production"
    }
}

function signAuthToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
}

/**
 * @description Register a new user, expects username, email and password in the request body.
 * @access Public
 */
const registerUserController = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        throw new ApiError(409, "Account already exists with this email address or username")
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    res.cookie("token", signAuthToken(user), getCookieOptions())

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
})

/**
 * @description Login a user, expects email and password in the request body.
 * @access Public
 */
const loginUserController = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    // Same message for both cases so the endpoint does not leak which accounts exist.
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ApiError(401, "Invalid email or password")
    }

    res.cookie("token", signAuthToken(user), getCookieOptions())

    res.status(200).json({
        success: true,
        message: "User logged in successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
})

/**
 * @description Clear the token cookie and add the token to the blacklist.
 * @access Public
 */
const logoutUserController = asyncHandler(async (req, res) => {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token", getCookieOptions())

    res.status(200).json({
        success: true,
        message: "User logged out successfully"
    })
})

/**
 * @description Get the current logged-in user details.
 * @access Private
 */
const getMeController = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw new ApiError(404, "User not found.")
    }

    res.status(200).json({
        success: true,
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
})

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}

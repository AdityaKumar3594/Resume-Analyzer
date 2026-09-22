const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const { authUser } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const { authLimiter } = require("../middlewares/rateLimit.middleware")
const { registerSchema, loginSchema } = require("../validations/auth.validation")

const authRouter = Router()

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: strongPass123
 *     responses:
 *       201:
 *         description: User registered. Sets an httpOnly JWT cookie.
 *       409:
 *         description: An account already exists with this email or username
 *       400:
 *         description: Invalid payload
 */
authRouter.post("/register", authLimiter, validate({ body: registerSchema }), authController.registerUserController)

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: strongPass123
 *     responses:
 *       200:
 *         description: Logged in. Sets an httpOnly JWT cookie.
 *       401:
 *         description: Invalid email or password
 */
authRouter.post("/login", authLimiter, validate({ body: loginSchema }), authController.loginUserController)

/**
 * @openapi
 * /api/auth/logout:
 *   get:
 *     tags: [Auth]
 *     summary: Logout the current user
 *     description: Blacklists the current JWT and clears the auth cookie.
 *     responses:
 *       200:
 *         description: Logged out
 */
authRouter.get("/logout", authController.logoutUserController)

/**
 * @openapi
 * /api/auth/get-me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current logged-in user
 *     responses:
 *       200:
 *         description: Current user details
 *       401:
 *         description: Missing, blacklisted or invalid token
 */
authRouter.get("/get-me", authUser, authController.getMeController)

module.exports = authRouter

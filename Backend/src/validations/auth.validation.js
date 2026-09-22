const { z } = require("zod")

const registerSchema = z.object({
    username: z.string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    email: z.string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password cannot exceed 72 characters")
})

const loginSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required")
})

module.exports = { registerSchema, loginSchema }

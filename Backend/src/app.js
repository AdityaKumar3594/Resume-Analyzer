const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const swaggerUi = require("swagger-ui-express")

const { generalLimiter } = require("./middlewares/rateLimit.middleware")
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware")
const swaggerSpec = require("./docs/swagger")

const app = express()

app.set("trust proxy", 1)

app.use(helmet())
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))

/* rate limit everything under /api */
app.use("/api", generalLimiter)

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

/* liveness probe for uptime monitors and container orchestrators */
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    })
})

/* interactive API docs */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
})

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app

const swaggerJSDoc = require("swagger-jsdoc")

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Resume Analyzer API",
            version: "1.0.0",
            description:
                "AI interview prep platform. Analyzes a resume and a job description with " +
                "Google Gemini to produce technical/behavioral questions, skill gaps, a " +
                "readiness roadmap and a tailored resume PDF. Authentication uses an httpOnly JWT cookie.",
            license: { name: "MIT" }
        },
        servers: [
            { url: "/", description: "Current host" }
        ],
        tags: [
            { name: "Auth", description: "Registration, login, logout and session endpoints" },
            { name: "Interview", description: "AI report generation and report history" },
            { name: "System", description: "Health and docs endpoints" }
        ]
    },
    apis: [ "./src/routes/*.js" ]
})

module.exports = swaggerSpec

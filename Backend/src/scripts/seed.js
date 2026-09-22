const userModel = require("../src/models/user.model")
const connectDB = require("../src/config/database")

/**
 * Seeds a demo account so reviewers can try the app without registering:
 *   email:    demo@resumeanalyzer.dev
 *   password: demo1234
 *
 * Usage: npm run seed
 * Safe to run repeatedly — upserts rather than duplicating.
 */
const DEMO_USER = {
    username: "demo",
    email: "demo@resumeanalyzer.dev",
    password: "demo1234"
}

async function seed() {
    await connectDB()

    const bcrypt = require("bcryptjs")
    const hash = await bcrypt.hash(DEMO_USER.password, 10)

    const result = await userModel.findOneAndUpdate(
        { email: DEMO_USER.email },
        { $setOnInsert: { ...DEMO_USER, password: hash } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    console.log(`Demo user ready: ${result.email} (password: ${DEMO_USER.password})`)
    await require("mongoose").connection.close()
}

seed().catch((err) => {
    console.error("Seeding failed:", err)
    process.exit(1)
})

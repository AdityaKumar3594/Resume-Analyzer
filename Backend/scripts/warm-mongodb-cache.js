/**
 * Pre-downloads the MongoDB binary used by mongodb-memory-server so the
 * first test run (locally or in CI) does not pay the download cost twice.
 *
 * Usage: node scripts/warm-mongodb-cache.js
 */
const { MongoMemoryServer } = require("mongodb-memory-server")

MongoMemoryServer.create()
    .then(async (mongod) => {
        console.log("MongoDB binary ready at:", mongod.getUri())
        await mongod.stop()
        process.exit(0)
    })
    .catch((err) => {
        console.error("Failed to download MongoDB binary:", err)
        process.exit(1)
    })

require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/config/database')
const mongoose = require('mongoose')

const PORT = process.env.PORT || 3000

async function start() {
    await connectDB()

    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })

    const shutdown = (signal) => {
        console.log(`${signal} received — shutting down gracefully`)
        server.close(async () => {
            await mongoose.connection.close()
            process.exit(0)
        })
        // force exit if connections refuse to drain
        setTimeout(() => process.exit(1), 10_000).unref()
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
}

start()

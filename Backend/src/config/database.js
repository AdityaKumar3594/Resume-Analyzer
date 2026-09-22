const mongoose = require('mongoose')

async function connectDB() {
    const mongoUri = process.env.MONGO_URI

    if (!mongoUri) {
        console.error('MONGO_URI is not set. Set it in Backend/.env (see .env.example).')
        process.exit(1)
    }

    try {
        await mongoose.connect(mongoUri)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message)
        process.exit(1)
    }

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected')
    })
}

module.exports = connectDB

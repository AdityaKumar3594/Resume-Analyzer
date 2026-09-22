process.env.NODE_ENV = process.env.NODE_ENV || 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
process.env.GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || 'test-key'

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongoServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
    if (mongoServer) await mongoServer.stop()
})

afterEach(async () => {
    // keep tests independent of each other
    const { collections } = mongoose.connection
    for (const collection of Object.values(collections)) {
        await collection.deleteMany({})
    }
    jest.restoreAllMocks()
})

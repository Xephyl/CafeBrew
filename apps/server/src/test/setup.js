import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"

const HOOK_TIMEOUT = 120000

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri("cafe_ecommerce_test"))
}, HOOK_TIMEOUT)

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
}, HOOK_TIMEOUT)

// src/_tests_/jest.mongo.setup.ts
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * We start an in-memory MongoDB before the test suite,
 * connect mongoose to it, and clean up afterwards.
 */

let mongo: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory Mongo
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  // Connect mongoose
  await mongoose.connect(uri, {
    dbName: "testdb",
  } as any);
});

afterEach(async () => {
  // Clean every collection between tests for isolation
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) {
    await c.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});

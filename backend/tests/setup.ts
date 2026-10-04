import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { beforeAll, afterEach, afterAll } from "@jest/globals";

let replset: MongoMemoryReplSet;

beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key-1234567890";
    delete process.env.RESEND_API_KEY; // email পাঠানো যাবে না test-এ
    // Redis isolation — default cache-less (DB-fallback); real Redis চাইলে TEST_USE_REDIS=1
    if (process.env.TEST_USE_REDIS !== "1") {
        delete process.env.REDIS_URL;
    }
    // transactions (payment flow) চলে শুধু replica set-এ
    replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(replset.getUri());
}, 180000);

afterEach(async () => {
    // প্রতি test-এর পর সব collection খালি (isolation)
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await replset.stop();
});

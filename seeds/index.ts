import mongoose from "mongoose";
import { env } from "../src/config/env";
import { seedAdmin } from "./admin.seed";

async function main() {
    await mongoose.connect(env.MONGO_URI)

    console.log("Seeding started")

    await seedAdmin()
}

main().then(() => {
    console.log("Seeding completed")
    process.exit(0)
}).catch((err) => {
    console.error(err)
    process.exit(1)
})
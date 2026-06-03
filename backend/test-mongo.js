import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

console.log("Testing connection to:", uri.replace(/:([^:@]{3,})@/, ':***@'));

const run = async () => {
    try {
        await mongoose.connect(uri, {
            family: 4,
            serverSelectionTimeoutMS: 5000,
        });
        console.log("SUCCESS");
        process.exit(0);
    } catch (e) {
        console.error("FAIL:", e.message);
        process.exit(1);
    }
};
run();

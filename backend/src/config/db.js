// backend/config/db.js
// database setup here
// backend/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected! Attempting to reconnect...');
    });

    const connectWithRetry = async () => {
        try {
            console.log("Attempting to connect to MongoDB Atlas...");
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                // Resolves common DNS/IPv6 issues causing querySrv ECONNREFUSED
                family: 4, 
                serverSelectionTimeoutMS: 5000,
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return conn;
        } catch (error) {
            console.error(`MongoDB Connection Error: ${error.message}`);
            console.log("Database connection failed. Retrying in 5 seconds...");
            // Wait for 5 seconds before retrying
            await new Promise(res => setTimeout(res, 5000));
            return connectWithRetry();
        }
    };

    return connectWithRetry();
};

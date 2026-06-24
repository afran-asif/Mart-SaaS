import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            console.error('❌ MONGODB_URI is not defined in .env file');
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoURI);

        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
        console.error(`❌ Error connecting to Database: ${(error as Error).message}`);
        process.exit(1);
    }
};
import mongoose from "mongoose";
import "dotenv/config";
import Thread from "./models/Thread.js";

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");

        await Thread.deleteMany({});

        const sampleThread = await Thread.create({
            threadId: "sample-1",
            title: "Sample Chat",
            messages: [
                {
                    role: "user",
                    content: "Hello"
                },
                {
                    role: "assistant",
                    content: "Hi! How can I help you?"
                }
            ]
        });

        console.log("Sample thread added!", sampleThread);
    } catch(err) {
        console.log("Failed to connect with Db", err);
    } finally {
        await mongoose.disconnect();
    }
}

connectDB();

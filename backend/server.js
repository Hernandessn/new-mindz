import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();


const app = express();
const PORT = 3000;

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB")
    } catch (error){
        console.log("Error trying to connect to MongoDB", error)
        process.exit(1);
    }

}

connectDB();

app.listen(PORT, () => console.log(`The server is running on the port: ${PORT}`))
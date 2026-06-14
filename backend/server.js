import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { router as authRouter } from './routes/authRoutes.js';
import { router as contentRouter} from './routes/contentRoutes.js';
import { router as sessionRouter } from './routes/sessionRoutes.js';
import './jobs/memoryDecay.js';

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

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());



app.use('/auth', authRouter);
app.use('/content', contentRouter);
app.use('/session', sessionRouter);

app.listen(PORT, () => console.log(`The server is running on the port: ${PORT}`));

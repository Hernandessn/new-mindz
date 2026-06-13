import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
        required: true
    },
    currentQuestion: {
        neuronId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Neuron'
        },
        question: String,
        answer: String,
        difficulty: String
    },
    interactions: [
        {
            neuronId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Neuron',
                required: true
            },
            responseTime: {
                type: Number,
                required: true
            },
            correct: {
                type: Boolean,
                required: true
            }
        }
    ],
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    }
})

export default mongoose.model("Session", sessionSchema);
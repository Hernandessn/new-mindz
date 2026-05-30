import mongoose from "mongoose";

const neuronsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
        required: true
    },
    concept: {
        type: String,
        required: true
    },
    performanceStatus: {
        type: String,
        enum: ["red", "orange", "yellow", "green"],
        required: true
    },
    memoryStatus: {
        type: String,
        enum: ["green", "green-fading", "gray", "black"],
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    "lastReviewedAt": {
        type: Date
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Neuron"
    }],
    interactions: [
        {
        timestamp: {
            type: Date,
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
    ]
})

export default mongoose.model("Neuron", neuronsSchema);
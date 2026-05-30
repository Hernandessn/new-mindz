import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    neurons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Neuron"
    }],
    title: {
        type: String,
        required: true
    },
    rawText: {
        type: String
    },
    }, {
    timestamps: true
})

export default mongoose.model("Content", contentSchema);
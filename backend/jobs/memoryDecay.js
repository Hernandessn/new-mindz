import Neuron from '../models/Neurons.js';
import cron from 'node-cron';

const checkMemoryDecay = (neuron) => {
    const daysSinceReview = (Date.now() - neuron.lastReviewedAt) / (1000 * 60 * 60 * 24);

    if (neuron.memoryStatus === 'green' && daysSinceReview >= 14) {
        return 'green-fading';
    }

    else if (neuron.memoryStatus === 'green-fading' && daysSinceReview >= 28) {
        return 'gray';
    }
    else if (neuron.memoryStatus === 'gray' && daysSinceReview >= 42) {
        return 'black';
    }
    return neuron.memoryStatus;
}

const runMemoryDecay = async () => {
    const neurons = await Neuron.find({});

    for (const neuron of neurons){
        const newStatus = checkMemoryDecay(neuron);

        if (newStatus !== neuron.memoryStatus) {
            await Neuron.findByIdAndUpdate(neuron._id, {
                memoryStatus: newStatus
            });
        }
    }
}

cron.schedule('0 0 * * *', () => {
    runMemoryDecay();
});

export { runMemoryDecay }
import Session from '../models/Session.js';
import Neuron from '../models/Neurons.js';

const startSession = async (req, res) => {
    try {
        const { contentId } = req.body;
        const userId = req.user.id;

        if (!contentId) {
            return res.status(400).json({
                msg: "contentId é obrigatório"
            });
        }

        const createdSession = await Session.create({
            userId,
            contentId
        });

        return res.status(201).json({
            msg: "Sessão criada com sucesso!",
            sessionId: createdSession._id,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: "Internal error",
            error: error.message,
        });
    }
};

const getQuestion = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId);

        const { contentId } = session;

        const priority = { red: 0, orange: 1, yellow: 2, green: 3 };


        const neurons = await Neuron.find({ contentId });

        const sorted = neurons.sort((a, b) => {
            const diff = priority[a.performanceStatus] - priority[b.performanceStatus];
            if (diff !== 0) return diff;
            return a.score - b.score;
        });

        const weakest = sorted[0];

        return res.status(200).json(weakest);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: "Internal error",
            error: error.message,
        });
    }

}

export { startSession, getQuestion };
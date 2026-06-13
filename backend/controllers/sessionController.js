import Session from '../models/Session.js';

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

export { startSession };
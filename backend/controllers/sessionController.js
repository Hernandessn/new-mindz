import Session from '../models/Session.js';
import Neuron from '../models/Neurons.js';
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

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
        const prompt = `
Você é um tutor educacional adaptativo.

Gere UMA pergunta sobre o conceito abaixo considerando o desempenho atual do aluno.

Conceito: ${weakest.concept}
Status do aluno neste conceito: ${weakest.performanceStatus}
Últimas interações: ${JSON.stringify(weakest.interactions)}

Retorne APENAS um JSON válido, sem texto adicional:
{
  "question": "texto da pergunta",
  "answer": "resposta correta",
  "difficulty": "easy | medium | hard"
}

Regras:
- Status vermelho ou laranja: perguntas simples de reconhecimento
- Status amarelo: perguntas de compreensão
- Status verde: perguntas de aplicação e conexão com outros conceitos
- Nunca repita uma pergunta já feita nesta sessão
`;
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        const responseText = completion.choices?.[0]?.message?.content || "";
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("No JSON found in the AI response");
        }

        const question = JSON.parse(jsonMatch[0]);


        await Session.findByIdAndUpdate(sessionId, {
            currentQuestion: {
                neuronId: weakest._id,
                question: question.question,
                answer: question.answer,
                difficulty: question.difficulty
            }
        });

        return res.status(200).json({
            neuronId: weakest._id,
            question: question.question,
            difficulty: question.difficulty
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: "Internal error",
            error: error.message,
        });
    }

}

export { startSession, getQuestion };
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
        if (!sorted.length) {
            return res.status(400).json({
                msg: "Este conteúdo não possui neurônios"
            });
        }
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

const submitAnswer = async (req, res) => {
    try {

        const { sessionId } = req.params;
        const { studentAnswer, responseTime } = req.body;
        const session = await Session.findById(sessionId);
        if (!session.currentQuestion) {
            return res.status(400).json({
                msg: "Nenhuma pergunta pendente. Chame GET /session/:id/question primeiro."
            });
        }
        const { currentQuestion } = session;

        const prompt = `
Você é um professor avaliando a resposta de um aluno.

Pergunta: ${currentQuestion.question}
Resposta correta: ${currentQuestion.answer}
Resposta do aluno: ${studentAnswer}

Avalie se a resposta do aluno está correta, considerando equivalência de significado, não apenas correspondência exata de texto.

Retorne APENAS um JSON válido, sem texto adicional:
{
  "correct": true | false,
  "feedback": "breve explicação sobre a avaliação"
}
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

        const answer = JSON.parse(jsonMatch[0]);

        const neuron = await Neuron.findById(currentQuestion.neuronId);


        const statusOrder = ['red', 'orange', 'yellow', 'green'];
        const currentIndex = statusOrder.indexOf(neuron.performanceStatus);
        let newIndex;

        if (neuron.permanentGreen && !answer.correct) {
            newIndex = currentIndex;
        } else {
            newIndex = Math.max(0, Math.min(3, currentIndex + (answer.correct ? 1 : -1)));
        }

        const newStatus = statusOrder[newIndex];

        const points = answer.correct ? (4 - currentIndex) * 5 : 0;

        await Neuron.findByIdAndUpdate(currentQuestion.neuronId, {
            performanceStatus: newStatus,
            lastReviewedAt: Date.now(),
            score: neuron.score + points,
            $push: {
                interactions: {
                    timestamp: Date.now(),
                    responseTime,
                    correct: answer.correct
                }
            }
        });
        if (newStatus === 'green' && answer.correct) {
            const greenSessions = neuron.greenSessions || [];

            if (!greenSessions.some(id => id.equals(sessionId))) {
                greenSessions.push(sessionId);
            }

            await Neuron.findByIdAndUpdate(currentQuestion.neuronId, {
                greenSessions,
                permanentGreen: greenSessions.length >= 3
            });
        }
        await Session.findByIdAndUpdate(sessionId, {
            $push: {
                interactions: {
                    neuronId: currentQuestion.neuronId,
                    responseTime,
                    correct: answer.correct
                }
            },
            $unset: { currentQuestion: "" }
        });
        return res.status(200).json({
            correct: answer.correct,
            feedback: answer.feedback,
            newStatus
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: "Internal error",
            error: error.message,
        });
    }

}
export { startSession, getQuestion, submitAnswer };
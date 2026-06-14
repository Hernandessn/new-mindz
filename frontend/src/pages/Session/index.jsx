import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from '../../services/api';
import { Button, Form, Input } from "./styles";
import { toast } from "react-toastify";

export const Session = () => {
    const { contentId } = useParams();
    const [neuronId, setNeuronId] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        const startSession = async () => {
            try {
                const { data } = await api.post('/session', { contentId });
                setSessionId(data.sessionId);
            } catch (error) {
                console.error(error);
                toast.error('Erro ao iniciar sessão!');
            }
        };


        startSession();
    }, [contentId]);

    const getQuestion = async () => {
        try {
            const { data } = await api.get(`/session/${sessionId}/question`);
            setQuestion(data.question);
            setNeuronId(data.neuronId);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao buscar questão!');
        }
    };
    useEffect(() => {
        if (sessionId) {
            getQuestion();
        }
    }, [sessionId]);
    const handleSubmit = async (e) => {
        try {

            setFeedback(null);
            e.preventDefault();
            const { data } = await api.patch(`/session/${sessionId}`, {
                studentAnswer: answer,
                responseTime: 0
            });
            setAnswer('');
            getQuestion();
            setFeedback({ correct: data.correct, text: data.feedback });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao responder a questão!');
        }
    }
    return (
        <Form onSubmit={handleSubmit}>
            <h2>{question}</h2>
            <Input
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Digite sua resposta"
                required
            />
            <Button type="submit">Responder</Button>
            {feedback && (
                <p style={{ color: feedback.correct ? 'green' : 'red' }}>
                    {feedback.text}
                </p>
            )}
        </Form>
    );
}
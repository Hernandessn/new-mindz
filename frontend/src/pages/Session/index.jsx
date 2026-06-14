import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from '../../services/api';
import { Button, Form, Input } from "./styles";

export const Session = () => {
    const { contentId } = useParams();
    const [neuronId, setNeuronId] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        const startSession = async () => {
            try {
                const { data } = await api.post('/session', { contentId });
                setSessionId(data.sessionId);
            } catch (error) {
                console.error(error)
            }
        };


        startSession();
    }, [contentId]);

    useEffect(() => {
        const getQuestion = async () => {
            try {
                const { data } = await api.get(`/session/${sessionId}/question`);
                setQuestion(data.question);
                setNeuronId(data.neuronId);
            } catch (error) {
                console.error(error);
            }
        };

        if (sessionId) {
            getQuestion();
        }
    }, [sessionId]);
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const { data } = await api.patch(`/session/${sessionId}`, {
                studentAnswer: answer,
                responseTime: 0
            });
        } catch (error) {
            console.error(error);
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
        </Form>
    );
}
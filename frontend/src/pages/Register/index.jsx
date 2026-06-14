import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
    LoginForm,
    Input,
    Container,
    Float,
    FloatLabel,
    Button
} from "./styles";
import { toast } from "react-toastify";

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const { data } = await api.post('/auth/register', { name, email, password });
            toast.success('Conta criada com sucesso!')
            navigate('/login');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar a conta, verifique todos os campos!');

        }

    }

    return (
        <Container>
            <LoginForm onSubmit={handleSubmit}>
                <Float>
                    <Input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder=" "
                        required
                    />
                    <FloatLabel>Nome</FloatLabel>
                </Float>
                <Float>
                    <Input
                        type="email"
                        placeholder=" "
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <FloatLabel>Email</FloatLabel>
                </Float>

                <Float>
                    <Input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder=" "
                        required
                    />
                    <FloatLabel>Senha</FloatLabel>
                </Float>
                <Button type="submit">Criar conta</Button>

            </LoginForm>
        </Container>
    );
};
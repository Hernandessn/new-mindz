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

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }

  }

  return (
    <Container>
      <LoginForm onSubmit={handleSubmit}>

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
        <Button type="submit">Entrar</Button>

      </LoginForm>
    </Container>
  );
};
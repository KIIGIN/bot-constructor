import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../utils/axios';
import Button from '../components/Button';
import { validateEmail } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  flex: 1;
`;

const FormContainer = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  color: var(--color-gray-900);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--color-gray-700);
  font-weight: 500;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 14px;
  margin-top: 4px;
`;

const AuthLink = styled.span`
  display: block;
  text-align: center;
  margin-top: 16px;
  color: var(--color-gray-600);
`;

const StyledLink = styled.a`
  color: var(--color-primary-dark);
  cursor: pointer;
  margin-left: 4px;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email адрес';
    }

    setErrors(newErrors);
    return !newErrors.email;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await api.post('/auth/login', formData);
      await login();
      navigate('/dashboard');
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      setErrors({
        email: detail || 'Неверный email или пароль',
        password: '',
      });
    }
  };

  return (
    <PageContainer>
      <FormContainer onSubmit={handleSubmit}>
        <Title>Вход в аккаунт</Title>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Пароль</Label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••"
          />
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
        </FormGroup>

        <Button type="submit" variant="primary" fullWidth>
          Войти
        </Button>

        <AuthLink>
          Ещё нет аккаунта?
          <StyledLink onClick={() => navigate('/register')}>
            Зарегистрироваться
          </StyledLink>
        </AuthLink>
      </FormContainer>
    </PageContainer>
  );
};

export default LoginPage;
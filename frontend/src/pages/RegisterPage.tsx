import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Button from '../components/Button';
import { Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePassword } from '../utils/validation';

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

const InputWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: var(--color-gray-700);
  }
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

const Toast = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--color-gray-900);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  opacity: ${props => props.$isVisible ? '1' : '0'};
  transform: translateY(${props => props.$isVisible ? '0' : '20px'});
  transition: all 0.3s ease;
`;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      confirm_password: '',
    };

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email адрес';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password && !newErrors.confirm_password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}auth/register`,
        formData
      );

      if (response.data) {
        setToast({ message: 'Аккаунт успешно создан', visible: true });
        setTimeout(() => {
          setToast({ message: '', visible: false });
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      setErrors({
        ...errors,
        email: detail || 'Данный email уже был зарегистрирован ранее',
      });
    }
  };

  return (
    <PageContainer>
      <FormContainer onSubmit={handleSubmit}>
        <Title>Регистрация</Title>
        
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
          <InputWrapper>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputWrapper>
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirm_password">Подтверждение пароля</Label>
          <InputWrapper>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm_password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              placeholder="••••••"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputWrapper>
          {errors.confirm_password && <ErrorMessage>{errors.confirm_password}</ErrorMessage>}
        </FormGroup>

        <Button type="submit" variant="primary" fullWidth>
          Зарегистрироваться
        </Button>

        <AuthLink>
          Уже есть аккаунт?
          <StyledLink onClick={() => navigate('/login')}>
            Войти
          </StyledLink>
        </AuthLink>
      </FormContainer>
      <Toast $isVisible={toast.visible}>{toast.message}</Toast>
    </PageContainer>
  );
};

export default RegisterPage;
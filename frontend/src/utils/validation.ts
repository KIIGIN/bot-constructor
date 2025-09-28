export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/;
  
  if (!pattern.test(password)) {
    return {
      isValid: false,
      message: 'Пароль должен содержать минимум 8 символов, включая заглавную и строчную буквы, цифру и специальный символ'
    };
  }
  
  return { isValid: true, message: '' };
};
// Validadores
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Senha deve ter pelo menos 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Senha deve conter letras maiúsculas');
  if (!/[a-z]/.test(password)) errors.push('Senha deve conter letras minúsculas');
  if (!/[0-9]/.test(password)) errors.push('Senha deve conter números');
  return { valid: errors.length === 0, errors };
};

export const validateProcessNumber = (number: string): boolean => {
  // Formato CNJ brasileiro: 0000000-00.0000.0.00.0000
  const re = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
  return re.test(number);
};

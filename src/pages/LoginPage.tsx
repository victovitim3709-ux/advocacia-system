import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardContent } from '@/components/ui';
import { validateEmail, validatePassword } from '@/utils/validators';
import { toast } from 'sonner';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup, error } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstAdminExists, setFirstAdminExists] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (isSignup) {
      if (!formData.nome.trim()) {
        newErrors.nome = 'Nome é obrigatório';
      }
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors[0];
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não conferem';
      }
    } else {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.nome);
      toast.success('Conta criada com sucesso! Verifique seu email.');
      setIsSignup(false);
      setFormData({ email: '', password: '', nome: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-gray-900">
            ⚖️ Advocacia System
          </h1>
          <p className="text-center text-gray-600 text-sm mt-2">
            Sistema de Cadastros e Recibos
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {!isSignup ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="seu@email.com"
              />
              <Input
                label="Senha"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
              />
              <Button
                type="submit"
                variant="default"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Entrar
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignup(true);
                      setFormData({ email: '', password: '', nome: '', confirmPassword: '' });
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Criar primeiro admin
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Nome Completo"
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                error={errors.nome}
                placeholder="Seu nome"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="seu@email.com"
              />
              <Input
                label="Senha"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
              />
              <Input
                label="Confirmar Senha"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
              />
              <Button
                type="submit"
                variant="default"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Criar Conta
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(false);
                    setFormData({ email: '', password: '', nome: '', confirmPassword: '' });
                  }}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Voltar para login
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

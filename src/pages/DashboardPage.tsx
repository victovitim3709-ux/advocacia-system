import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Users, FileText, AlertCircle, BarChart3 } from 'lucide-react';

export const DashboardPage = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo, <strong>{user?.nome || 'Usuário'}</strong>! {isAdmin() && '🔐 (Administrador)'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Cadastros</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">--</p>
              </div>
              <FileText size={32} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Em Análise</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">--</p>
              </div>
              <AlertCircle size={32} className="text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Concluídos</p>
                <p className="text-3xl font-bold text-green-600 mt-1">--</p>
              </div>
              <BarChart3 size={32} className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        {isAdmin() && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">--</p>
                </div>
                <Users size={32} className="text-purple-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">📈 Cadastros por Mês</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Gráfico em desenvolvimento...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">📂 Cadastros por Grupo</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Distribuição em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

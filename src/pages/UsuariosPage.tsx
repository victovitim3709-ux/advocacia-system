import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardContent, Badge, Dialog, Select, Table, Dropdown } from '@/components/ui';
import { LABEL_PERMISSOES, PERMISSOES_USUARIO } from '@/utils/constants';
import { toast } from 'sonner';
import { Plus, Lock, Trash2 } from 'lucide-react';

export const UsuariosPage = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    role: 'user',
    permissions: [] as string[],
  });

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 font-medium">Apenas administradores podem gerenciar usuários</p>
      </div>
    );
  }

  const handleOpenDialog = (usuário?: any) => {
    if (usuário) {
      setFormData(usuário);
      setEditingUser(usuário.id);
    } else {
      setFormData({
        email: '',
        nome: '',
        role: 'user',
        permissions: [],
      });
      setEditingUser(null);
    }
    setOpenDialog(true);
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">👥 Gerenciamento de Usuários</h1>
        <Button variant="default" onClick={() => handleOpenDialog()} className="gap-2">
          <Plus size={18} /> Novo Usuário
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table
            columns={[
              { key: 'email', label: 'Email', width: '200px' },
              { key: 'nome', label: 'Nome', width: '200px' },
              {
                key: 'role',
                label: 'Papel',
                width: '100px',
                render: (role) => (
                  <Badge variant={role === 'admin' ? 'danger' : 'info'}>
                    {role === 'admin' ? '🔐 Admin' : '👤 Usuário'}
                  </Badge>
                ),
              },
              {
                key: 'permissions',
                label: 'Permissões',
                width: '250px',
                render: (perms) => (
                  <div className="flex flex-wrap gap-1">
                    {perms?.map((perm: string) => (
                      <Badge key={perm} variant="success" className="text-xs">
                        {LABEL_PERMISSOES[perm] || perm}
                      </Badge>
                    ))}
                  </div>
                ),
              },
              {
                key: 'id',
                label: 'Ações',
                width: '100px',
                render: (id, row) => (
                  <Dropdown
                    trigger="⋯"
                    items={[
                      { label: '✏️ Editar', onClick: () => handleOpenDialog(row) },
                      { label: '🔑 Resetar Senha', onClick: () => toast.info('Em desenvolvimento') },
                      { label: '🗑️ Excluir', onClick: () => toast.info('Em desenvolvimento'), danger: true },
                    ]}
                  />
                ),
              },
            ]}
            data={users}
            emptyMessage="Nenhum usuário registrado"
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog} title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}>
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="usuario@email.com"
          />
          <Input
            label="Nome Completo"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Nome completo"
          />
          <Select
            label="Papel"
            options={[
              { value: 'admin', label: '🔐 Administrador' },
              { value: 'user', label: '👤 Usuário' },
            ]}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
          {formData.role === 'user' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissões</label>
              <div className="space-y-2">
                {PERMISSOES_USUARIO.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-gray-700">{LABEL_PERMISSOES[perm]}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="default" onClick={() => toast.info('Em desenvolvimento')}>
            Salvar
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCadastros, useCreateCadastro, useUpdateCadastro, useDeleteCadastro, useBulkImportCadastros } from '@/hooks/useCadastros';
import { Button, Input, Select, Card, CardHeader, CardContent, Dialog, Badge, Table, Dropdown } from '@/components/ui';
import { GRUPOS_TRABALHO, STATUS_CADASTRO, LABEL_STATUS } from '@/utils/constants';
import { formatDateBR } from '@/utils/formatting';
import { toast } from 'sonner';
import { Plus, Download, Upload } from 'lucide-react';

export const CadastrosPage = () => {
  const { user, hasPermission, isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [grupoFilter, setGrupoFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    origem: '',
    n_processo: '',
    nome_cliente: '',
    cpf_cliente: '',
    grupo_trabalho: '',
    status: 'Pendente',
    tema: '',
    observacao: '',
  });

  const { data: cadastrosData, isLoading } = useCadastros(page, 20, search, statusFilter, grupoFilter);
  const createMutation = useCreateCadastro();
  const updateMutation = useUpdateCadastro();
  const deleteMutation = useDeleteCadastro();

  const canView = hasPermission('ver_cadastros') || isAdmin();
  const canEdit = hasPermission('editar_cadastros') || isAdmin();
  const canDelete = hasPermission('excluir_cadastros') || isAdmin();

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 font-medium">Você não tem permissão para ver cadastros</p>
      </div>
    );
  }

  const handleOpenDialog = (cadastro?: any) => {
    if (cadastro) {
      setFormData(cadastro);
      setEditingId(cadastro.id);
    } else {
      setFormData({
        origem: '',
        n_processo: '',
        nome_cliente: '',
        cpf_cliente: '',
        grupo_trabalho: '',
        status: 'Pendente',
        tema: '',
        observacao: '',
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.nome_cliente || !formData.n_processo || !formData.grupo_trabalho) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, updates: formData });
        toast.success('Cadastro atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync(formData as any);
        toast.success('Cadastro criado com sucesso!');
      }
      setOpenDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar cadastro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cadastro?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Cadastro excluído com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir cadastro');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">📋 Cadastros de Processos</h1>
        {canEdit && (
          <Button variant="default" onClick={() => handleOpenDialog()} className="gap-2">
            <Plus size={18} /> Novo Cadastro
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por cliente ou processo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              options={STATUS_CADASTRO.map((s) => ({ value: s, label: LABEL_STATUS[s] || s }))}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            />
            <Select
              options={GRUPOS_TRABALHO.map((g) => ({ value: g, label: g }))}
              value={grupoFilter}
              onChange={(e) => {
                setGrupoFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Table
            columns={[
              { key: 'n_processo', label: 'Processo', width: '120px' },
              { key: 'nome_cliente', label: 'Cliente', width: '200px' },
              { key: 'grupo_trabalho', label: 'Grupo', width: '150px' },
              {
                key: 'status',
                label: 'Status',
                width: '120px',
                render: (status) => <Badge variant={status === 'Concluído' ? 'success' : 'info'}>{LABEL_STATUS[status] || status}</Badge>,
              },
              {
                key: 'cadastrado_em',
                label: 'Data',
                width: '100px',
                render: (date) => formatDateBR(date),
              },
              {
                key: 'id',
                label: 'Ações',
                width: '100px',
                render: (id, row) => (
                  <Dropdown
                    trigger="⋯"
                    items={[
                      ...(canEdit ? [{ label: 'Editar', onClick: () => handleOpenDialog(row) }] : []),
                      ...(canDelete ? [{ label: 'Excluir', onClick: () => handleDelete(id), danger: true }] : []),
                    ]}
                  />
                ),
              },
            ]}
            data={cadastrosData?.items || []}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog} title={editingId ? 'Editar Cadastro' : 'Novo Cadastro'}>
        <div className="space-y-4">
          <Input
            label="Número do Processo"
            value={formData.n_processo}
            onChange={(e) => setFormData({ ...formData, n_processo: e.target.value })}
            placeholder="0000000-00.0000.0.00.0000"
          />
          <Input
            label="Nome do Cliente"
            value={formData.nome_cliente}
            onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
            placeholder="Nome completo"
          />
          <Input
            label="CPF do Cliente"
            value={formData.cpf_cliente}
            onChange={(e) => setFormData({ ...formData, cpf_cliente: e.target.value })}
            placeholder="000.000.000-00"
          />
          <Select
            label="Grupo de Trabalho"
            options={GRUPOS_TRABALHO.map((g) => ({ value: g, label: g }))}
            value={formData.grupo_trabalho}
            onChange={(e) => setFormData({ ...formData, grupo_trabalho: e.target.value })}
          />
          <Select
            label="Status"
            options={STATUS_CADASTRO.map((s) => ({ value: s, label: LABEL_STATUS[s] || s }))}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
          <Input
            label="Tema/Assunto"
            value={formData.tema}
            onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
            placeholder="Assunto jurídico"
          />
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Observações"
            rows={3}
            value={formData.observacao}
            onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
          />
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="default" onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>
            Salvar
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

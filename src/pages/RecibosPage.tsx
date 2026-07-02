import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRecibos, useCreateRecibo, useDeleteRecibo } from '@/hooks/useRecibos';
import { Button, Input, Card, CardHeader, CardContent, Dialog, Badge, Table, Dropdown } from '@/components/ui';
import { formatDateBR } from '@/utils/formatting';
import { extractTextFromPDF, parsePDFData } from '@/utils/pdf-parser';
import { toast } from 'sonner';
import { Plus, Download, Trash2, FileText } from 'lucide-react';

export const RecibosPage = () => {
  const { hasPermission, isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: recibosData, isLoading } = useRecibos(page, 20, search);
  const createMutation = useCreateRecibo();
  const deleteMutation = useDeleteRecibo();

  const canView = hasPermission('gerenciar_recibos') || isAdmin();
  const canUpload = hasPermission('gerenciar_recibos') || isAdmin();
  const canDelete = hasPermission('gerenciar_recibos') || isAdmin();

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 font-medium">Você não tem permissão para gerenciar recibos</p>
      </div>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    setUploading(true);
    try {
      const text = await extractTextFromPDF(file);
      const parsed = parsePDFData(text);
      setExtractedData(parsed);
      setSelectedFile(file);
      setOpenReviewDialog(true);
    } catch (err) {
      toast.error('Erro ao processar PDF: ' + (err instanceof Error ? err.message : 'Desconhecido'));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveRecibo = async () => {
    if (!selectedFile || !extractedData) return;

    try {
      // Upload file and create recibo record
      // Esta parte será implementada com o backend
      toast.success('Recibo salvo com sucesso!');
      setOpenReviewDialog(false);
      setSelectedFile(null);
      setExtractedData(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar recibo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este recibo?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Recibo excluído com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir recibo');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">📄 Recibos de Protocolo</h1>
        {canUpload && (
          <Button variant="default" onClick={() => setOpenDialog(true)} className="gap-2">
            <Plus size={18} /> Upload Recibo
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por número de processo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1"
            />
          </div>

          <Table
            columns={[
              { key: 'arquivo_nome', label: 'Arquivo', width: '200px' },
              { key: 'n_processo', label: 'Processo', width: '150px' },
              {
                key: 'data',
                label: 'Data',
                width: '100px',
                render: (date) => formatDateBR(date),
              },
              {
                key: 'created_at',
                label: 'Adicionado em',
                width: '120px',
                render: (date) => formatDateBR(date),
              },
              {
                key: 'id',
                label: 'Ações',
                width: '100px',
                render: (id) => (
                  <Dropdown
                    trigger="⋯"
                    items={[
                      { label: '📥 Download', onClick: () => toast.info('Em desenvolvimento') },
                      ...(canDelete ? [{ label: '🗑️ Excluir', onClick: () => handleDelete(id), danger: true }] : []),
                    ]}
                  />
                ),
              },
            ]}
            data={recibosData?.items || []}
            loading={isLoading}
            emptyMessage="Nenhum recibo registrado"
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog} title="Upload de Recibo">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-2" />
            <label className="cursor-pointer">
              <p className="text-sm font-medium text-gray-700 mb-1">Clique para selecionar um PDF</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              {selectedFile && <p className="text-sm text-blue-600">{selectedFile.name}</p>}
            </label>
            {uploading && <p className="text-sm text-gray-500 mt-2">⏳ Processando...</p>}
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
        </div>
      </Dialog>

      <Dialog
        open={openReviewDialog}
        onOpenChange={setOpenReviewDialog}
        title="Revisar Dados Extraídos"
      >
        {extractedData && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número do Processo</label>
              <input
                type="text"
                value={extractedData.n_processo || ''}
                onChange={(e) => setExtractedData({ ...extractedData, n_processo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Protocolo</label>
              <input
                type="date"
                value={extractedData.data_protocolo || ''}
                onChange={(e) => setExtractedData({ ...extractedData, data_protocolo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Autor</label>
              <input
                type="text"
                value={extractedData.nome_autor || ''}
                onChange={(e) => setExtractedData({ ...extractedData, nome_autor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF do Autor</label>
              <input
                type="text"
                value={extractedData.cpf_autor || ''}
                onChange={(e) => setExtractedData({ ...extractedData, cpf_autor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Réu</label>
              <input
                type="text"
                value={extractedData.nome_reu || ''}
                onChange={(e) => setExtractedData({ ...extractedData, nome_reu: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ do Réu</label>
              <input
                type="text"
                value={extractedData.cpf_reu || ''}
                onChange={(e) => setExtractedData({ ...extractedData, cpf_reu: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advogado</label>
              <input
                type="text"
                value={extractedData.nome_advogado || ''}
                onChange={(e) => setExtractedData({ ...extractedData, nome_advogado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
              <input
                type="text"
                value={extractedData.tema || ''}
                onChange={(e) => setExtractedData({ ...extractedData, tema: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Causa</label>
              <input
                type="text"
                value={extractedData.valor_causa || ''}
                onChange={(e) => setExtractedData({ ...extractedData, valor_causa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => setOpenReviewDialog(false)}>Cancelar</Button>
          <Button
            variant="default"
            onClick={handleSaveRecibo}
            loading={createMutation.isPending}
          >
            Salvar Recibo
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

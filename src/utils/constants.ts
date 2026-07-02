export const GRUPOS_TRABALHO = [
  'CONSUMIDOR',
  'PREVIDENCIÁRIO',
  'SAÚDE/AUTISMO',
  'SERVIDOR PÚBLICO',
  'DIVERSOS',
] as const;

export const STATUS_CADASTRO = [
  'Pendente',
  'Em Análise',
  'Concluído',
] as const;

export const PERMISSOES_USUARIO = [
  'ver_cadastros',
  'editar_cadastros',
  'excluir_cadastros',
  'gerenciar_recibos',
] as const;

export const LABEL_PERMISSOES: Record<string, string> = {
  ver_cadastros: 'Ver Cadastros',
  editar_cadastros: 'Editar Cadastros',
  excluir_cadastros: 'Excluir Cadastros',
  gerenciar_recibos: 'Gerenciar Recibos',
};

export const LABEL_STATUS: Record<string, string> = {
  'Pendente': '⏳ Pendente',
  'Em Análise': '🔍 Em Análise',
  'Concluído': '✅ Concluído',
};

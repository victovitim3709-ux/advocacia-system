// Tipos do usuário
export type UserRole = 'admin' | 'user';

export type UserPermission = 
  | 'ver_cadastros'
  | 'editar_cadastros'
  | 'excluir_cadastros'
  | 'gerenciar_recibos';

export interface Profile {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserPermissionRecord {
  id: string;
  user_id: string;
  permission: UserPermission;
  created_at: string;
}

// Tipos de cadastro
export type CadastroStatus = 'Pendente' | 'Em Análise' | 'Concluído';

export type GrupoTrabalho = 
  | 'CONSUMIDOR'
  | 'PREVIDENCIÁRIO'
  | 'SAÚDE/AUTISMO'
  | 'SERVIDOR PÚBLICO'
  | 'DIVERSOS';

export interface Cadastro {
  id: string;
  origem?: string;
  agendado_em?: string;
  n_processo: string;
  nome_cliente: string;
  cpf_cliente?: string;
  grupo_trabalho: GrupoTrabalho;
  status: CadastroStatus;
  pj_ficha_processo?: string;
  unidade_cadastrada?: string;
  cadastrado_em: string;
  cadastrado_por?: string;
  observacao?: string;
  tema?: string;
  cadastrado_no_cpj_por?: string;
  reu_nome?: string;
  reu_documento?: string;
  updated_at: string;
}

// Tipos de recibo
export interface Recibo {
  id: string;
  nome: string;
  data: string;
  arquivo_path: string;
  arquivo_nome: string;
  n_processo?: string;
  cadastro_id?: string;
  dados_extraidos?: ReciboDadosExtraidos;
  created_at: string;
  updated_at: string;
}

export interface ReciboDadosExtraidos {
  n_processo?: string;
  data_protocolo?: string;
  nome_autor?: string;
  cpf_autor?: string;
  nome_reu?: string;
  cpf_reu?: string;
  nome_advogado?: string;
  tema?: string;
  valor_causa?: string;
}

// Tipos de contexto de autenticação
export interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nome: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: UserPermission) => boolean;
  isAdmin: () => boolean;
}

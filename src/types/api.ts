// Tipos para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Requisição de criar usuário
export interface CreateUserRequest {
  email: string;
  password: string;
  nome: string;
  role: 'admin' | 'user';
  permissions?: string[];
}

// Requisição de editar usuário
export interface UpdateUserRequest {
  nome?: string;
  role?: 'admin' | 'user';
  permissions?: string[];
}

// Requisição de resetar senha
export interface ResetPasswordRequest {
  password: string;
}

// Importação de cadastros
export interface ImportCadastrosRequest {
  cadastros: any[];
}

// Parser de PDF
export interface ParsePdfResponse {
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

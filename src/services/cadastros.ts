import { supabase } from './supabase';
import { Cadastro } from '@/types';
import { ListResponse } from '@/types/api';

// List cadastros with pagination and filters
export const listCadastros = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  status?: string,
  grupoTrabalho?: string
): Promise<ListResponse<Cadastro>> => {
  let query = supabase
    .from('cadastros')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.or(`nome_cliente.ilike.%${search}%,n_processo.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (grupoTrabalho) {
    query = query.eq('grupo_trabalho', grupoTrabalho);
  }

  const { data, count, error } = await query
    .order('cadastrado_em', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
    page,
    pageSize,
  };
};

// Get single cadastro
export const getCadastro = async (id: string): Promise<Cadastro | null> => {
  const { data, error } = await supabase
    .from('cadastros')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Create cadastro
export const createCadastro = async (cadastro: Omit<Cadastro, 'id' | 'cadastrado_em' | 'updated_at'>): Promise<Cadastro> => {
  const { data, error } = await supabase
    .from('cadastros')
    .insert([cadastro])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update cadastro
export const updateCadastro = async (id: string, updates: Partial<Cadastro>): Promise<Cadastro> => {
  const { data, error } = await supabase
    .from('cadastros')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete cadastro
export const deleteCadastro = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('cadastros')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Bulk insert cadastros
export const bulkInsertCadastros = async (cadastros: any[]): Promise<Cadastro[]> => {
  const { data, error } = await supabase
    .from('cadastros')
    .insert(cadastros)
    .select();

  if (error) throw error;
  return data || [];
};

// Get cadastro statistics
export const getCadastroStats = async (): Promise<any> => {
  const { data, error } = await supabase
    .rpc('get_cadastro_stats');

  if (error) throw error;
  return data;
};

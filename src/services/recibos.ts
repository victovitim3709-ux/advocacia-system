import { supabase } from './supabase';
import { Recibo, ReciboDadosExtraidos } from '@/types';
import { ListResponse } from '@/types/api';

// List recibos
export const listRecibos = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<ListResponse<Recibo>> => {
  let query = supabase
    .from('recibos')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.or(`nome.ilike.%${search}%,n_processo.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
    page,
    pageSize,
  };
};

// Get single recibo
export const getRecibo = async (id: string): Promise<Recibo | null> => {
  const { data, error } = await supabase
    .from('recibos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Upload recibo PDF
export const uploadReciboPDF = async (
  file: File,
  nomeRecibo: string
): Promise<{ path: string; nome: string }> => {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const filePath = `recibos/${fileName}`;

  const { error } = await supabase.storage
    .from('recibos')
    .upload(filePath, file);

  if (error) throw error;

  return {
    path: filePath,
    nome: nomeRecibo || file.name,
  };
};

// Create recibo
export const createRecibo = async (recibo: Omit<Recibo, 'id' | 'created_at' | 'updated_at'>): Promise<Recibo> => {
  const { data, error } = await supabase
    .from('recibos')
    .insert([recibo])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update recibo
export const updateRecibo = async (id: string, updates: Partial<Recibo>): Promise<Recibo> => {
  const { data, error } = await supabase
    .from('recibos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete recibo
export const deleteRecibo = async (id: string): Promise<void> => {
  const recibo = await getRecibo(id);
  if (recibo?.arquivo_path) {
    await supabase.storage.from('recibos').remove([recibo.arquivo_path]);
  }

  const { error } = await supabase
    .from('recibos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Link recibo to cadastro by process number
export const linkReciboCadastro = async (nProcesso: string, reciboId: string): Promise<void> => {
  const { data: cadastro } = await supabase
    .from('cadastros')
    .select('id')
    .eq('n_processo', nProcesso)
    .single();

  if (cadastro) {
    await updateRecibo(reciboId, { cadastro_id: cadastro.id });
  }
};

// Get recibo download URL
export const getReciboDownloadUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('recibos')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

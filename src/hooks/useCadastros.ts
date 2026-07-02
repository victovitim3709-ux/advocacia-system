import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cadastrosService from '@/services/cadastros';
import { Cadastro } from '@/types';

const CADASTROS_KEY = 'cadastros';

export const useCadastros = (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  status?: string,
  grupoTrabalho?: string
) => {
  return useQuery({
    queryKey: [CADASTROS_KEY, page, pageSize, search, status, grupoTrabalho],
    queryFn: () =>
      cadastrosService.listCadastros(page, pageSize, search, status, grupoTrabalho),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCadastro = (id: string | null) => {
  return useQuery({
    queryKey: [CADASTROS_KEY, id],
    queryFn: () => (id ? cadastrosService.getCadastro(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCadastro = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cadastrosService.createCadastro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CADASTROS_KEY] });
    },
  });
};

export const useUpdateCadastro = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Cadastro> }) =>
      cadastrosService.updateCadastro(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CADASTROS_KEY] });
    },
  });
};

export const useDeleteCadastro = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cadastrosService.deleteCadastro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CADASTROS_KEY] });
    },
  });
};

export const useBulkImportCadastros = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cadastrosService.bulkInsertCadastros,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CADASTROS_KEY] });
    },
  });
};

export const useCadastroStats = () => {
  return useQuery({
    queryKey: [CADASTROS_KEY, 'stats'],
    queryFn: cadastrosService.getCadastroStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

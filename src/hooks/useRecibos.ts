import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as recibosService from '@/services/recibos';
import { Recibo, ReciboDadosExtraidos } from '@/types';

const RECIBOS_KEY = 'recibos';

export const useRecibos = (page: number = 1, pageSize: number = 20, search?: string) => {
  return useQuery({
    queryKey: [RECIBOS_KEY, page, pageSize, search],
    queryFn: () => recibosService.listRecibos(page, pageSize, search),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecibo = (id: string | null) => {
  return useQuery({
    queryKey: [RECIBOS_KEY, id],
    queryFn: () => (id ? recibosService.getRecibo(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUploadRecibo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, nome }: { file: File; nome: string }) =>
      recibosService.uploadReciboPDF(file, nome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECIBOS_KEY] });
    },
  });
};

export const useCreateRecibo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recibosService.createRecibo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECIBOS_KEY] });
    },
  });
};

export const useUpdateRecibo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Recibo> }) =>
      recibosService.updateRecibo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECIBOS_KEY] });
    },
  });
};

export const useDeleteRecibo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recibosService.deleteRecibo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECIBOS_KEY] });
    },
  });
};

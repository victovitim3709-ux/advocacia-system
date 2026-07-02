// Formatação de CPF
export const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return cleaned.slice(0, 3) + '.' + cleaned.slice(3);
  if (cleaned.length <= 9) return cleaned.slice(0, 3) + '.' + cleaned.slice(3, 6) + '.' + cleaned.slice(6);
  return cleaned.slice(0, 3) + '.' + cleaned.slice(3, 6) + '.' + cleaned.slice(6, 9) + '-' + cleaned.slice(9, 11);
};

// Remover máscara de CPF
export const cleanCPF = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Validar CPF
export const isValidCPF = (cpf: string): boolean => {
  const clean = cleanCPF(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  return true;
};

// Formatar data para formato brasileiro
export const formatDateBR = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Formatar data e hora
export const formatDateTimeBR = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minute}`;
};

// Formatar moeda BRL
export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Parser de data brasileira para ISO
export const parseDateBR = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
};

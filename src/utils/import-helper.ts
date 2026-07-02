import Papa from 'papaparse';
import { formatCPF } from './formatting';

const COLUMN_MAPPINGS: Record<string, string[]> = {
  origem: ['origem', 'fonte'],
  agendado_em: ['agendado em', 'agendado_em', 'data agendamento'],
  n_processo: ['n processo', 'número processo', 'processo', 'n_processo', 'nº processo'],
  nome_cliente: ['nome cliente', 'cliente', 'nome', 'nome_cliente', 'requerente'],
  cpf_cliente: ['cpf cliente', 'cpf', 'cpf_cliente', 'cpf/cnpj'],
  grupo_trabalho: ['grupo trabalho', 'grupo_trabalho', 'grupo', 'categoria'],
  status: ['status', 'situação'],
  pj_ficha_processo: ['pj ficha', 'ficha processo', 'pj_ficha_processo'],
  unidade_cadastrada: ['unidade', 'unidade_cadastrada', 'setor'],
  observacao: ['observação', 'observacao', 'notas', 'obs'],
  tema: ['tema', 'assunto', 'matéria', 'materia'],
  cadastrado_no_cpj_por: ['cadastrado cpj', 'cpj por', 'cadastrado_no_cpj_por'],
  reu_nome: ['réu nome', 'reu nome', 'reu_nome', 'requerido', 'demandado'],
  reu_documento: ['réu documento', 'reu documento', 'reu_documento', 'cnpj reu'],
};

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentuação
};

const findColumnIndex = (headers: string[], fieldName: string): number => {
  const possibleNames = COLUMN_MAPPINGS[fieldName] || [];
  const normalizedPossible = possibleNames.map(normalizeString);

  return headers.findIndex((header) => {
    const normalized = normalizeString(header);
    return normalizedPossible.includes(normalized);
  });
};

export const parseImportFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          resolve(results.data.filter(row => Object.values(row).some(v => v)));
        },
        error: (error) => reject(error),
      });
    } else if (file.type === 'application/vnd.ms-excel' ||
               file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Para Excel, você pode usar uma biblioteca como xlsx
      // Por enquanto, apenas CSV é suportado
      reject(new Error('Por favor, converter Excel para CSV'));
    } else {
      reject(new Error('Formato de arquivo não suportado'));
    }
  });
};

export const mapImportedData = (rawData: any[], headers: string[]): any[] => {
  return rawData.map((row) => {
    const mapped: any = {};
    const fieldNames = Object.keys(COLUMN_MAPPINGS);

    fieldNames.forEach((fieldName) => {
      const columnIndex = findColumnIndex(headers, fieldName);
      if (columnIndex !== -1) {
        const value = row[headers[columnIndex]];
        if (value) {
          // Aplicar formatações específicas
          if (fieldName === 'cpf_cliente' || fieldName === 'reu_documento') {
            mapped[fieldName] = formatCPF(String(value));
          } else if (fieldName === 'agendado_em') {
            // Converter para ISO date
            mapped[fieldName] = new Date(value).toISOString();
          } else {
            mapped[fieldName] = String(value).trim();
          }
        }
      }
    });

    return mapped;
  });
};

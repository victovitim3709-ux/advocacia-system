import * as pdfjsLib from 'pdfjs-dist';
import { ReciboDadosExtraidos } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ');
    text += '\n';
  }

  return text;
};

const PATTERNS = {
  processNumber: [
    /número[\s:]*(?:do\s)?processo[\s:]*([\d]{7}-[\d]{2}\.[\d]{4}\.[\d]\.[\d]{2}\.[\d]{4})/i,
    /processo[\s:]*([\d]{7}-[\d]{2}\.[\d]{4}\.[\d]\.[\d]{2}\.[\d]{4})/i,
    /nº[\s:]*([\d]{7}-[\d]{2}\.[\d]{4}\.[\d]\.[\d]{2}\.[\d]{4})/i,
  ],
  protocolDate: [
    /data[\s:]*(?:de\s)?(?:protocolo|distribuição)[\s:]*([\d]{1,2})[\s/\-]([\d]{1,2})[\s/\-]([\d]{4})/i,
    /distribuído[\s:]*(?:em[\s:]*)([\d]{1,2})[\s/\-]([\d]{1,2})[\s/\-]([\d]{4})/i,
  ],
  authorName: [
    /(?:requerente|autor|parte[\s]requerente)[\s:]*([A-ZÁÉÍÓÚ][\w\s]+?)(?=CPF|CNPJ|requerido|endereço)/i,
  ],
  cpf: [
    /(?:CPF|CPF/CNPJ)[\s:]*([\d]{3}\.[\d]{3}\.[\d]{3}-[\d]{2})/i,
    /([\d]{3}\.[\d]{3}\.[\d]{3}-[\d]{2})/i,
  ],
  defendantName: [
    /(?:requerido|réu|parte[\s]requerida|demandado)[\s:]*([A-ZÁÉÍÓÚ][\w\s]+?)(?=CPF|CNPJ|endereço|vara)/i,
  ],
  lawyerName: [
    /(?:advogado|procurador|defensor)[\s:]*([A-ZÁÉÍÓÚ][\w\s]+?)(?=OAB|registro|endereço)/i,
  ],
  subject: [
    /(?:assunto|tema|matéria)[\s:]*([^\n]+)/i,
  ],
  caseValue: [
    /(?:valor[\s]?da[\s]?causa|valor[\s]?causa)[\s:]*R\$[\s]*([\d.,]+)/i,
  ],
};

const extractMatches = (text: string, patterns: RegExp[]): string | undefined => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1]?.trim();
  }
  return undefined;
};

export const parsePDFData = (text: string): ReciboDadosExtraidos => {
  const dados: ReciboDadosExtraidos = {};

  // Extrai número do processo
  dados.n_processo = extractMatches(text, PATTERNS.processNumber);

  // Extrai data de protocolo
  const dateMatch = text.match(PATTERNS.protocolDate[0]);
  if (dateMatch) {
    const day = String(dateMatch[1]).padStart(2, '0');
    const month = String(dateMatch[2]).padStart(2, '0');
    const year = dateMatch[3];
    dados.data_protocolo = `${year}-${month}-${day}`;
  }

  // Extrai nomes
  dados.nome_autor = extractMatches(text, PATTERNS.authorName);
  dados.nome_reu = extractMatches(text, PATTERNS.defendantName);
  dados.nome_advogado = extractMatches(text, PATTERNS.lawyerName);

  // Extrai CPF/CNPJ
  const cpfs = text.match(new RegExp(PATTERNS.cpf[1].source, 'g'));
  if (cpfs && cpfs.length >= 1) {
    dados.cpf_autor = cpfs[0];
    if (cpfs.length >= 2) dados.cpf_reu = cpfs[1];
  }

  // Extrai tema
  dados.tema = extractMatches(text, PATTERNS.subject);

  // Extrai valor da causa
  dados.valor_causa = extractMatches(text, PATTERNS.caseValue);

  return dados;
};

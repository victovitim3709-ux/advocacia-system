# Advocacia System

Sistema de Cadastros e Recibos para Escritório de Advocacia

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI Components:** Radix UI + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **State Management:** React Query (TanStack Query)
- **File Handling:** PDF.js para parsing de recibos

## Funcionalidades

- ✅ Autenticação com Supabase Auth
- ✅ Sistema de RBAC (Admin/User com permissões granulares)
- ✅ Gerenciamento de usuários (admin only)
- ✅ CRUD de cadastros de processos
- ✅ Upload e parsing de recibos (PDFs)
- ✅ Importação em massa via Excel/CSV
- ✅ Row Level Security (RLS) no banco

## Setup Inicial

### 1. Clone o repositório

```bash
git clone https://github.com/victovitim3709-ux/advocacia-system.git
cd advocacia-system
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

- Crie uma conta em [supabase.com](https://supabase.com)
- Crie um novo projeto
- Na seção SQL Editor, execute todos os scripts em `supabase/migrations/`
- Copie a URL e chave anônima do seu projeto

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── hooks/              # Custom React hooks
├── services/           # Serviços (Supabase, API)
├── types/              # Tipos TypeScript
├── utils/              # Funções utilitárias
├── App.tsx             # Componente principal
└── main.tsx            # Ponto de entrada

supabase/
├── migrations/         # Scripts SQL de setup
└── schema.sql          # Schema completo do banco
```

## Build para Produção

```bash
npm run build
```

## Deploy

O projeto pode ser deployado em:
- Vercel
- Netlify
- Andere plataformas de hosting estático

## Licença

MIT

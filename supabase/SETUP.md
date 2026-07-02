# Supabase Setup Guide

Este arquivo contém instruções para configurar o Supabase para o projeto Advocacia System.

## 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha os dados:
   - **Name**: advocacia-system
   - **Database Password**: Use uma senha forte
   - **Region**: Escolha a mais próxima de você
4. Aguarde a criação (pode levar alguns minutos)

## 2. Executar o Schema SQL

1. No dashboard do Supabase, abra a aba **SQL Editor**
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `supabase/migrations/001_init.sql`
4. Cole no editor SQL
5. Clique em "Run"

## 3. Copiar Credenciais

1. No dashboard, vá para **Settings** > **API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
3. Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## 4. Configurar Storage

1. Vá para **Storage** no dashboard
2. Verifique se o bucket `recibos` foi criado (deve ter sido criado pelo script SQL)
3. Se não estiver, clique em "New Bucket" e crie com nome `recibos`

## 5. Primeiro Admin

1. Inicie o projeto: `npm run dev`
2. Acesse `http://localhost:5173/auth`
3. Clique em "Criar primeiro admin"
4. Preencha os dados e crie a conta

## Estrutura do Banco

### Tabelas

- **profiles**: Dados de usuários
- **user_permissions**: Permissões granulares de usuários
- **cadastros**: Processos judiciais
- **recibos**: Recibos de protocolo

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas que garantem:
- Admins têm acesso total
- Usuários só podem acessar dados conforme suas permissões
- Storage protegido para recibos

### Triggers

- Auto-atualiza `updated_at` em todas as tabelas
- Cria perfil automaticamente quando novo usuário se registra

## Troubleshooting

### Erro: "Connection refused"
- Verifique se as credenciais no `.env.local` estão corretas
- Teste a conexão no Supabase: **Settings** > **Database** > **Connection String**

### Erro: "Row level security violated"
- Verifique se o usuário está logado
- Confirme que o usuário tem as permissões necessárias

### Erro ao fazer upload de PDFs
- Verifique se o bucket `recibos` existe e é privado
- Confira as Storage Policies

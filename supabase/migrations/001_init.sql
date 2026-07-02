-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table (user data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission)
);

-- Create cadastros table
CREATE TABLE IF NOT EXISTS cadastros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origem TEXT,
  agendado_em TIMESTAMP WITH TIME ZONE,
  n_processo TEXT UNIQUE NOT NULL,
  nome_cliente TEXT NOT NULL,
  cpf_cliente TEXT,
  grupo_trabalho TEXT NOT NULL CHECK (
    grupo_trabalho IN ('CONSUMIDOR', 'PREVIDENCIÁRIO', 'SAÚDE/AUTISMO', 'SERVIDOR PÚBLICO', 'DIVERSOS')
  ),
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Análise', 'Concluído')),
  pj_ficha_processo TEXT,
  unidade_cadastrada TEXT,
  tema TEXT,
  observacao TEXT,
  cadastrado_no_cpj_por TEXT,
  reu_nome TEXT,
  reu_documento TEXT,
  cadastrado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cadastrado_por UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create recibos table
CREATE TABLE IF NOT EXISTS recibos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  data DATE NOT NULL,
  arquivo_path TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  n_processo TEXT,
  cadastro_id UUID REFERENCES cadastros(id) ON DELETE SET NULL,
  dados_extraidos JSONB DEFAULT NULL,
  criado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_cadastros_status ON cadastros(status);
CREATE INDEX idx_cadastros_grupo_trabalho ON cadastros(grupo_trabalho);
CREATE INDEX idx_cadastros_n_processo ON cadastros(n_processo);
CREATE INDEX idx_cadastros_nome_cliente ON cadastros(nome_cliente);
CREATE INDEX idx_cadastros_created_at ON cadastros(cadastrado_em);
CREATE INDEX idx_recibos_n_processo ON recibos(n_processo);
CREATE INDEX idx_recibos_cadastro_id ON recibos(cadastro_id);
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadastros ENABLE ROW LEVEL SECURITY;
ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for user_permissions
CREATE POLICY "Users can view their own permissions"
  ON user_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage permissions"
  ON user_permissions FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Policies for cadastros
CREATE POLICY "Users with permission can view cadastros"
  ON cadastros FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    OR auth.uid() IN (
      SELECT user_id FROM user_permissions WHERE permission = 'ver_cadastros'
    )
  );

CREATE POLICY "Users with permission can insert cadastros"
  ON cadastros FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    OR auth.uid() IN (
      SELECT user_id FROM user_permissions WHERE permission = 'editar_cadastros'
    )
  );

CREATE POLICY "Users with permission can update cadastros"
  ON cadastros FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    OR auth.uid() IN (
      SELECT user_id FROM user_permissions WHERE permission = 'editar_cadastros'
    )
  );

CREATE POLICY "Users with permission can delete cadastros"
  ON cadastros FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    OR auth.uid() IN (
      SELECT user_id FROM user_permissions WHERE permission = 'excluir_cadastros'
    )
  );

-- Policies for recibos
CREATE POLICY "Users with permission can view recibos"
  ON recibos FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    OR auth.uid() IN (
      SELECT user_id FROM user_permissions WHERE permission = 'gerenciar_recibos'
    )
  );

CREATE POLICY "Users with permission can manage recibos"
  ON recibos FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    OR auth.uid() IN (
      SELECT user_id FROM user_permissions WHERE permission = 'gerenciar_recibos'
    )
  );

-- Create storage bucket for recibos
INSERT INTO storage.buckets (id, name, public)
VALUES ('recibos', 'recibos', false)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload recibos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recibos');

CREATE POLICY "Users can read recibos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recibos');

CREATE POLICY "Users can delete recibos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recibos');

-- Triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cadastros_updated_at
BEFORE UPDATE ON cadastros
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recibos_updated_at
BEFORE UPDATE ON recibos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nome', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC function to list all users (admin only)
CREATE OR REPLACE FUNCTION list_all_users()
RETURNS TABLE (id UUID, email TEXT, nome TEXT, role TEXT, created_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only admins can list users';
  END IF;
  
  RETURN QUERY
  SELECT p.id, p.email, p.nome, p.role, p.created_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get cadastro statistics
CREATE OR REPLACE FUNCTION get_cadastro_stats()
RETURNS TABLE (total INT, pendentes INT, em_analise INT, concluidos INT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT as total,
    COUNT(*) FILTER (WHERE status = 'Pendente')::INT as pendentes,
    COUNT(*) FILTER (WHERE status = 'Em Análise')::INT as em_analise,
    COUNT(*) FILTER (WHERE status = 'Concluído')::INT as concluidos
  FROM cadastros;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

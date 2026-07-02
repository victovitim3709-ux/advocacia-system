-- Drop existing objects (execute this if you need to reset the database)
-- WARNING: This will delete all data!

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS list_all_users();
DROP FUNCTION IF EXISTS get_cadastro_stats();
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_cadastros_updated_at ON cadastros;
DROP TRIGGER IF EXISTS update_recibos_updated_at ON recibos;

DROP TABLE IF EXISTS recibos CASCADE;
DROP TABLE IF EXISTS cadastros CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users with permission can view cadastros" ON cadastros;
DROP POLICY IF EXISTS "Users with permission can insert cadastros" ON cadastros;
DROP POLICY IF EXISTS "Users with permission can update cadastros" ON cadastros;
DROP POLICY IF EXISTS "Users with permission can delete cadastros" ON cadastros;
DROP POLICY IF EXISTS "Users with permission can view recibos" ON recibos;
DROP POLICY IF EXISTS "Users with permission can manage recibos" ON recibos;
DROP POLICY IF EXISTS "Users can upload recibos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read recibos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete recibos" ON storage.objects;

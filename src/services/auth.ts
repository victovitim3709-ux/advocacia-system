import { supabase } from './supabase';
import { Profile, UserPermissionRecord } from '@/types';
import { CreateUserRequest, UpdateUserRequest } from '@/types/api';

// Get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Get all user permissions
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(p => p.permission);
};

// Check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const profile = await getUserProfile(userId);
  return profile?.role === 'admin';
};

// List all users (admin only)
export const listUsers = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .rpc('list_all_users');

  if (error) throw error;
  return data || [];
};

// Create new user (admin only)
export const createUser = async (request: CreateUserRequest): Promise<any> => {
  const { data, error } = await supabase
    .rpc('create_user', {
      email: request.email,
      password: request.password,
      nome: request.nome,
      role: request.role,
      permissions: request.permissions || [],
    });

  if (error) throw error;
  return data;
};

// Update user (admin only)
export const updateUser = async (userId: string, request: UpdateUserRequest): Promise<void> => {
  const { error } = await supabase
    .rpc('update_user_access', {
      target_user_id: userId,
      new_role: request.role,
      new_permissions: request.permissions || [],
    });

  if (error) throw error;
};

// Reset user password (admin only)
export const resetUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  const { error } = await supabase
    .rpc('reset_user_password', {
      target_user_id: userId,
      new_password: newPassword,
    });

  if (error) throw error;
};

// Delete user (admin only)
export const deleteUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .rpc('delete_user_account', {
      target_user_id: userId,
    });

  if (error) throw error;
};

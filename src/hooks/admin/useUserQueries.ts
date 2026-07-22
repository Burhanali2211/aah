import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { User } from '@/pages/admin/components/Users/List/types';

export const useUsersQuery = (page: number, pageSize: number, filters: { role?: string; status?: string; searchTerm?: string }) => {
  return useQuery({
    queryKey: ['admin-users', page, pageSize, filters],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.role) query = query.eq('role', filters.role);
      if (filters.status === 'active') query = query.eq('is_active', true);
      if (filters.status === 'inactive') query = query.eq('is_active', false);
      if (filters.searchTerm) {
        query = query.or(`full_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
      }

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      const rows: User[] = (data || []).map((p: any) => ({
        id: p.id,
        email: p.email || '',
        full_name: p.full_name || '',
        role: p.role || 'customer',
        is_active: p.is_active !== false,
        email_verified: true,
        created_at: p.created_at,
        order_count: 0,
        total_spent: '0'
      }));

      const totalItems = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

      return {
        users: rows,
        totalItems,
        totalPages,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, profile }: { id: string; profile: Partial<User> }) => {
      const { error } = await supabase.from('profiles').update(profile).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Deactivate instead of hard delete for profiles
      const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

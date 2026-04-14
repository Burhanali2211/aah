import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// --- Site Settings ---
export const useSiteSettingsQuery = () => {
  return useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateSiteSettingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (setting: any) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert(setting);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
    },
  });
};

// --- Social Media ---
export const useSocialAccountsQuery = () => {
  return useQuery({
    queryKey: ['admin-social-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateSocialAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('social_media_accounts')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-accounts'] });
    },
  });
};

export const useUpsertSocialAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: any) => {
      const { id, ...data } = account;
      if (id) {
        const { error } = await supabase
          .from('social_media_accounts')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('social_media_accounts')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-accounts'] });
    },
  });
};

export const useDeleteSocialAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_media_accounts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-accounts'] });
    },
  });
};

export const useDeleteSocialAccountsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('social_media_accounts')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-accounts'] });
    },
  });
};

// --- Footer Links ---
export const useFooterLinksQuery = () => {
  return useQuery({
    queryKey: ['admin-footer-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

// --- Contact Info ---
export const useContactInfoQuery = () => {
  return useQuery({
    queryKey: ['admin-contact-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_information')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

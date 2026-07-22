import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { mapDbAddressToAppAddress } from '@/utils/shoppingMapper';
import { Address } from '@/types';

export const useCustomerAddresses = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  // Fetch addresses
  const query = useQuery({
    queryKey: ['customer', 'addresses', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbAddressToAppAddress);
    },
    enabled: !!user,
  });

  // Create address
  const createMutation = useMutation({
    mutationFn: async (newAddress: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');

      if (newAddress.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: newAddress.fullName,
          street_address: newAddress.streetAddress,
          city: newAddress.city,
          state: newAddress.state,
          postal_code: newAddress.postalCode,
          country: newAddress.country,
          phone: newAddress.phone,
          is_default: newAddress.isDefault,
          type: newAddress.type,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbAddressToAppAddress(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'addresses', user?.id] });
      showSuccess('Success', 'Address added successfully');
    },
    onError: (err: any) => {
      showError('Error', err.message || 'Failed to add address');
    }
  });

  // Update address
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Address> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      if (updates.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const dbData: any = {};
      if (updates.fullName) dbData.full_name = updates.fullName;
      if (updates.streetAddress) dbData.street_address = updates.streetAddress;
      if (updates.city) dbData.city = updates.city;
      if (updates.state) dbData.state = updates.state;
      if (updates.postalCode) dbData.postal_code = updates.postalCode;
      if (updates.country) dbData.country = updates.country;
      if (updates.phone) dbData.phone = updates.phone;
      if (updates.isDefault !== undefined) dbData.is_default = updates.isDefault;
      if (updates.type) dbData.type = updates.type;

      const { data, error } = await supabase
        .from('addresses')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbAddressToAppAddress(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'addresses', user?.id] });
      showSuccess('Success', 'Address updated successfully');
    },
    onError: (err: any) => {
      showError('Error', err.message || 'Failed to update address');
    }
  });

  // Delete address
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'addresses', user?.id] });
      showSuccess('Success', 'Address deleted successfully');
    },
    onError: (err: any) => {
      showError('Error', err.message || 'Failed to delete address');
    }
  });

  // Set as default
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      // Unset all existing defaults
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);

      // Set target to default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'addresses', user?.id] });
      showSuccess('Success', 'Default address updated');
    },
    onError: (err: any) => {
      showError('Error', err.message || 'Failed to update default address');
    }
  });

  return {
    ...query,
    createAddress: createMutation.mutateAsync,
    updateAddress: updateMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync,
    setDefaultAddress: setDefaultMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending || setDefaultMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

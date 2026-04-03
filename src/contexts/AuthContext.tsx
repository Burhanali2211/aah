import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, AuthContextType, Product } from '../types';
import { supabase } from '../lib/supabase';
import AuthModal from '../components/Auth/AuthModal';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileAuthOpen, setIsMobileAuthOpen] = useState(false);
  const [mobileAuthMode, setMobileAuthMode] = useState<'login' | 'signup' | 'profile'>('login');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'cart' | 'wishlist' | 'compare' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const mapSupabaseUserToAppUser = (sbUser: any, profile: any): User => {
    return {
      id: sbUser.id,
      email: sbUser.email || '',
      name: profile?.full_name || sbUser.user_metadata?.full_name || 'User',
      fullName: profile?.full_name || sbUser.user_metadata?.full_name || 'User',
      role: profile?.role || 'customer',
      avatar: profile?.avatar_url || sbUser.user_metadata?.avatar_url,
      phone: profile?.phone || sbUser.user_metadata?.phone,
      dateOfBirth: profile?.date_of_birth,
      gender: profile?.gender,
      isActive: profile?.is_active ?? true,
      emailVerified: sbUser.email_confirmed_at ? true : false,
      businessName: profile?.business_name,
      businessAddress: profile?.business_address,
      businessPhone: profile?.business_phone,
      taxId: profile?.tax_id,
      preferredLanguage: profile?.preferred_language || 'en',
      newsletterSubscribed: profile?.newsletter_subscribed || false,
      createdAt: new Date(sbUser.created_at),
      updatedAt: profile?.updated_at ? new Date(profile.updated_at) : undefined,
    };
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error) return data;

    if (error.code === 'PGRST116') {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (!sbUser) return null;

      const { error: rpcErr } = await supabase.rpc('ensure_profile_exists', {
        p_user_id:   userId,
        p_email:     sbUser.email || '',
        p_full_name: sbUser.user_metadata?.full_name || 'User',
        p_role:      sbUser.user_metadata?.role || 'customer',
      });

      if (rpcErr) return null;

      const { data: created } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return created || null;
    }
    return null;
  };

  useEffect(() => {
    const nuclearRecovery = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) await r.unregister();
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          for (const k of keys) await caches.delete(k);
        }
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      } catch (e) {
        window.location.reload();
      }
    };

    const initializeAuth = async () => {
      console.log('[AUTH] Starting initialization...');
      
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('[AUTH] Session recovery taking too long, proceeding as guest...');
          setLoading(false);
        }
      }, 5000);

      const recoveryTimeout = setTimeout(() => {
        if (loading) {
          console.error('[AUTH] CRITICAL HANG: Recovery failed after 15s. Nuclear reload required.');
          nuclearRecovery();
        }
      }, 15000);

      try {
        console.log('[AUTH] Getting session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AUTH] Session error:', sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log('[AUTH] Session found, fetching profile for:', session.user.id);
          const profile = await fetchProfile(session.user.id);
          setUser(mapSupabaseUserToAppUser(session.user, profile));
        } else {
          console.log('[AUTH] No active session found.');
          setUser(null);
        }
        
        console.log('[AUTH] Initialization complete.');
        sessionStorage.removeItem('sb_recovery_active');
      } catch (error) {
        console.error('[AUTH] Initialization failed:', error);
        setUser(null);
      } finally {
        clearTimeout(timeoutId);
        clearTimeout(recoveryTimeout);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(mapSupabaseUserToAppUser(session.user, profile));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      setUser(mapSupabaseUserToAppUser(data.user, profile));
    }
  };

  const signUp = async (
    email: string,
    password: string,
    additionalData?: Record<string, unknown>
  ): Promise<void> => {
    let fullName = additionalData?.fullName as string;
    if (!fullName) {
      const firstName = (additionalData?.firstName as string) || '';
      const lastName = (additionalData?.lastName as string) || '';
      fullName = `${firstName} ${lastName}`.trim() || 'User';
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          role: additionalData?.role || 'customer',
        }
      }
    });

    if (error) throw error;

    if (data.user && data.session) {
      const profile = await fetchProfile(data.user.id);
      setUser(mapSupabaseUserToAppUser(data.user, profile));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      await signIn(email, password);
      return null;
    } catch (error: any) {
      return error.message || 'Login failed';
    }
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      await signUp(
        userData.email!,
        userData.password!,
        { fullName: userData.name || userData.fullName || 'User' }
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    await signOut();
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user is currently authenticated');

    if (updates.fullName || updates.name) {
      await supabase.auth.updateUser({
        data: { full_name: updates.fullName || updates.name }
      });
    }

    const profileUpdates: any = {};
    if (updates.fullName || updates.name) profileUpdates.full_name = updates.fullName || updates.name;
    if (updates.avatar) profileUpdates.avatar_url = updates.avatar;
    if (updates.phone) profileUpdates.phone = updates.phone;
    if (updates.dateOfBirth) profileUpdates.date_of_birth = updates.dateOfBirth;
    if (updates.gender) profileUpdates.gender = updates.gender;
    if (updates.preferredLanguage) profileUpdates.preferred_language = updates.preferredLanguage;
    if (updates.newsletterSubscribed !== undefined) profileUpdates.newsletter_subscribed = updates.newsletterSubscribed;

    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      setUser(mapSupabaseUserToAppUser(sbUser, data));
    }
  };

  const refreshUser = async (): Promise<void> => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      const profile = await fetchProfile(sbUser.id);
      setUser(mapSupabaseUserToAppUser(sbUser, profile));
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const resendVerification = async (): Promise<void> => {
    if (!user?.email) throw new Error('No email found');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const openMobileAuth = (mode: 'login' | 'signup' | 'profile' = 'login') => {
    setMobileAuthMode(mode);
    setIsMobileAuthOpen(true);
  };

  const closeMobileAuth = () => {
    setIsMobileAuthOpen(false);
  };

  const showAuthModal = (product: Product, action: 'cart' | 'wishlist' | 'compare') => {
    setSelectedProduct(product);
    setModalAction(action);
    setIsModalOpen(true);
  };

  const hideAuthModal = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setSelectedProduct(null);
  };

  const value: AuthContextType = {
    user, loading, login, logout, register, signIn, signUp, signOut,
    resetPassword, updatePassword, resendVerification, updateProfile, refreshUser,
    openMobileAuth, closeMobileAuth, isMobileAuthOpen, mobileAuthMode,
    showAuthModal, hideAuthModal, isModalOpen, modalAction, selectedProduct
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isModalOpen && createPortal(
        <AuthModal
          isOpen={isModalOpen}
          onClose={hideAuthModal}
          initialMode="login"
          action={modalAction}
          product={selectedProduct}
        />,
        document.body
      )}
    </AuthContext.Provider>
  );
};

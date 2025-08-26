import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useAuth } from './AuthContext';
import type { User } from '@/types/domains/auth';

interface UserProfile extends User {
  must_change_password?: boolean;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

interface UserProfileProviderProps {
  children: React.ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      logger.info('Fetching user profile', { userId });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching profile', { error: error.message, userId });
        return;
      }

      if (data) {
        // Check if user must change password
        const { data: passwordCheck } = await supabase
          .rpc('user_must_change_password', { user_uuid: userId });

        const profileData: UserProfile = {
          ...data,
          role: data.role as UserProfile['role'],
          must_change_password: passwordCheck || false
        };

        logger.info('Profile fetched successfully', { userId, role: data.role });
        setProfile(profileData);
      } else {
        // Create profile if it doesn't exist
        logger.info('Profile not found, creating new profile', { userId });
        
        const { error: createError } = await supabase
          .rpc('create_franchisee_profile', {
            user_id: userId,
            user_email: user?.email || '',
            user_full_name: user?.user_metadata?.full_name || ''
          });

        if (!createError) {
          // Fetch the newly created profile
          await fetchProfile(userId);
        } else {
          logger.error('Error creating profile', { error: createError.message });
        }
      }
    } catch (error) {
      logger.error('Unexpected error fetching profile', { error, userId });
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (!user?.id) {
      return { error: 'No user logged in' };
    }

    try {
      logger.info('Updating user profile', { userId: user.id, updates });

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        logger.error('Error updating profile', { error: error.message });
        return { error: error.message };
      }

      // Refresh profile data
      await refreshProfile();
      return {};
    } catch (error) {
      logger.error('Unexpected error updating profile', { error });
      return { error: 'Error inesperado al actualizar perfil' };
    }
  };

  // Fetch profile when user changes
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user?.id]);

  const value: UserProfileContextType = {
    profile,
    loading,
    refreshProfile,
    updateProfile
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
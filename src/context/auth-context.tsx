
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/data/users';
import { findUserById, updateUserProfile } from '@/data/users';
import { supabase } from '@/lib/db';
import type { AuthError, Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { isAfter } from 'date-fns';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectPath?: string | null) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (profileData: Partial<User>) => Promise<User | null>;
  signInWithGoogle: (redirectPath?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleRedirect = (userProfile: User, redirectPath?: string | null) => {
    const isProfileComplete = userProfile.name && userProfile.state && userProfile.gender && userProfile.age;

    if (!isProfileComplete) {
      router.push('/account-settings?incomplete=true');
    } else if (redirectPath) {
      router.push(redirectPath);
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          if (user) {
            setLoading(false);
            return;
          }
          setLoading(true);
          let userProfile = await findUserById(session.user.id);

          if (!userProfile) {
            const { error: rpcError } = await supabase.rpc('ensure_user_profile_exists');
            if (rpcError) {
              console.error("Auth state change: Error ensuring profile exists", rpcError);
              await supabase.auth.signOut();
              setUser(null);
              setLoading(false);
              return;
            }
            userProfile = await findUserById(session.user.id);
          }

          if (userProfile && !userProfile.isBlocked) {
            setUser(userProfile);
            const redirectPath = new URL(window.location.href).searchParams.get('redirect');
            handleRedirect(userProfile, redirectPath);
          } else {
            await supabase.auth.signOut();
            setUser(null);
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (!session?.user) {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
  
  const login = async (email: string, password: string, redirectPath?: string | null) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      throw authError;
    }
    
    if (authData.user) {
      let userProfile = await findUserById(authData.user.id);

      // If profile doesn't exist, it's likely an old account before the trigger was added.
      // We'll try to create it now.
      if (!userProfile) {
        // Call the RPC function to create the profile on the DB side.
        const { error: rpcError } = await supabase.rpc('ensure_user_profile_exists');
        
        if (rpcError) {
          await supabase.auth.signOut();
          console.error("Error ensuring user profile exists:", rpcError);
          throw new Error("Login successful, but your profile could not be created. Please contact support.");
        }
        
        // Fetch the newly created profile again.
        userProfile = await findUserById(authData.user.id);
      }

      // Check for block status AFTER ensuring profile exists
      if (userProfile?.isBlocked) {
         if (userProfile.blockedUntil && isAfter(new Date(), new Date(userProfile.blockedUntil))) {
            await supabase.auth.signOut();
            throw new Error(`Your temporary block has expired, but needs to be cleared by an administrator. Please contact support.`);
         }
        await supabase.auth.signOut();
        throw new Error(`BLOCKED::${userProfile.blockReason}::${userProfile.blockedUntil}`);
      }

      if (userProfile) {
        setUser(userProfile); // Set state BEFORE redirecting
        handleRedirect(userProfile, redirectPath);
      } else {
        await supabase.auth.signOut();
        throw new Error("Login successful, but your profile could not be found or created. Please contact support.");
      }
    } else {
      throw new Error("Login failed. Please check your credentials.");
    }
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: email.split('@')[0],
        },
      },
    });

    if (error) {
       if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists.');
      }
      throw error;
    }
    // Redirect to login with a success message
    router.push('/login?message=Account+created!+Please+log+in.');
  };

  const signInWithGoogle = async (redirectPath?: string | null) => {
    // Google Sign-In is a redirect flow. It doesn't return a user directly.
    // The onAuthStateChange listener will pick up the session after the redirect.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + (redirectPath || '/'),
      },
    });
     if (error) {
        throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const updateUser = async (profileData: Partial<User>) => {
    if (!user) throw new Error("User not authenticated");
    
    const updatedUser = await updateUserProfile(user.id, profileData);
    if (updatedUser) {
      setUser(updatedUser);
    }
    return updatedUser;
  };

  const value = { user, loading, isAuthenticated: !!user, login, signup, logout, updateUser, signInWithGoogle };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

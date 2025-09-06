import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  role: 'doctor' | 'patient';
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'doctor' | 'patient') => Promise<void>;
  loginWithGoogle: (role: 'doctor' | 'patient') => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'doctor' | 'patient') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  signup: async () => {},
  logout: () => {},
  isLoading: false,
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [intendedRole, setIntendedRole] = useState<'doctor' | 'patient' | null>(null);

  // Derive isAuthenticated from user state
  const isAuthenticated = user !== null;

  // Helper to fetch user profile from Supabase users table
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    if (!supabaseUser) return null;
    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar, email, role')
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: data.id,
      email: supabaseUser.email || '',
      role: data.role,
      name: data.name || '',
      avatar: data.avatar || '',
    };
  };

  const login = async (email: string, password: string, role: 'doctor' | 'patient') => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', email, role);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Login error:', error);
        // Handle specific Supabase errors
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before logging in.');
        } else {
          throw new Error(`Login failed: ${error.message}`);
        }
      }
      if (data.user) {
        console.log('Auth successful, fetching profile for user:', data.user.id);
        const userProfile = await fetchUserProfile(data.user);
        console.log('User profile:', userProfile);
        if (!userProfile) {
          throw new Error('User profile not found. Please contact support.');
        }
        if (userProfile.role !== role) {
          throw new Error(`Account role mismatch. This account is registered as ${userProfile.role}, but you're trying to log in as ${role}.`);
        }
        setUser(userProfile);
        console.log('Login successful');
      } else {
        throw new Error('No user data returned from authentication service');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (role: 'doctor' | 'patient') => {
    setIntendedRole(role);
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'your-app-scheme://auth/callback' // Replace with your app's deep link
      }
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // Note: User data will be handled in the auth state change listener
    setIsLoading(false);
  };

  // Test connection function
// const testSupabaseConnection = async () => {
//   console.log('🧪 Testing basic Supabase connection...');
//   try {
//     // Test 1: Simple session check
//     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
//     console.log('Session test:', { sessionData, sessionError });
    
//     // Test 2: Try to get user (should work even if no user)
//     const { data: userData, error: userError } = await supabase.auth.getUser();
//     console.log('User test:', { userData, userError });
    
//     console.log('✅ Basic Supabase connection working');
//     return true;
//   } catch (err) {
//     console.error('❌ Basic connection failed:', err);
//     return false;
//   }
// };



const signup = async (email: string, password: string, uname: string, urole: 'doctor' | 'patient') => {
  setIsLoading(true);
  try {
    console.log('Attempting signup with:', email, uname, urole);
    console.log('About to call supabase.auth.signUp...');
    
    // Test connection first
    console.log('Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase.auth.getSession();
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      throw new Error('Cannot connect to Supabase');
    }
    console.log('✅ Connection test passed, proceeding with signup...');
    
    // Call signup with the options parameter (this is crucial!)
    console.log('Calling supabase.auth.signUp...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: uname,
          role: urole,
        }
      }
    });
    
    console.log('✅ Supabase signUp completed!');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.error('Signup auth error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw error;
    }
    
    if (!data.user) {
      throw new Error('Signup failed - no user data returned');
    }

    const userId = data.user.id;
    console.log('User created with ID:', userId);

    // RPC call for user profile creation
    try {
      console.log('Calling handle_new_user RPC with:', { id: userId, role: urole });
      const { error: rpcError } = await supabase.rpc('handle_new_user', { 
        id: userId, 
        role: urole,
        name: uname  // Add name parameter if your RPC function expects it
      });
      
      if (rpcError) {
        console.error('RPC error:', rpcError);
        console.warn('User profile creation failed, but auth signup succeeded');
      } else {
        console.log('User profile created successfully');
      }
    } catch (rpcError) {
      console.error('Error calling handle_new_user:', rpcError);
    }
    
  } catch (error: any) {
    console.error('❌ Signup failed:', error);
    console.error('Full error object:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    throw error;
  } finally {
    console.log('🏁 Finally block reached');
    setIsLoading(false);
  }
};

  // In your AuthContext
// Improved logout function
const logout = async () => {
  setIsLoading(true);
  try {
    console.log('Logging out user...');
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase logout error:', error);
      throw error;
    }
    
    console.log('Supabase logout successful');
    
    // Clear all auth-related state
    setUser(null);
    setIntendedRole(null);
    
    // Clear any additional stored data if needed
    // Example: Clear AsyncStorage, localStorage, etc.
    // await AsyncStorage.removeItem('user');
    // await AsyncStorage.removeItem('session');
    // localStorage.clear(); // For web apps
    
    console.log('Logout completed successfully');
    
  } catch (error: any) {
    console.error('Logout failed:', error);
    
    // Even if Supabase logout fails, clear local state
    // to prevent user from being stuck in a logged-in state
    setUser(null);
    setIntendedRole(null);
    
    // Optionally, you could show a warning to user but still log them out locally
    console.warn('Logout had issues but local state cleared');
    
    // You might want to handle this differently - either throw or not
    // throw error; // Uncomment if you want calling code to handle the error
    
  } finally {
    setIsLoading(false);
  }
};

// Alternative: Silent logout that never throws
const logoutSilent = async () => {
  setIsLoading(true);
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Silent logout error (ignored):', error);
  } finally {
    // Always clear state regardless of Supabase response
    setUser(null);
    setIntendedRole(null);
    setIsLoading(false);
  }
};

// Enhanced auth state change listener
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session: Session | null) => {
    console.log('Auth state changed:', event, session?.user?.id);
    
    if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      setUser(null);
      setIntendedRole(null);
      return;
    }
    
    if (session?.user) {
      console.log('User session active, fetching profile...');
      try {
        const userProfile = await fetchUserProfile(session.user);
        if (userProfile) {
          console.log('User profile loaded:', userProfile.role);
          setUser(userProfile);
        } else {
          console.warn('No user profile found, signing out...');
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error fetching user profile during auth change:', error);
        await supabase.auth.signOut();
      }
      setIntendedRole(null);
    } else {
      console.log('No active session');
      setUser(null);
      setIntendedRole(null);
    }
  });

  return () => {
    authListener?.subscription.unsubscribe();
  };
}, []); // Remove intendedRole dependency since we handle it directly in the listener

  useEffect(() => {
    // Test Supabase connection on mount
    

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session: Session | null) => {
      if (session?.user) {
        // Use intendedRole if set, otherwise default to patient
        const userProfile = await fetchUserProfile(session.user);
        setUser(userProfile);
        setIntendedRole(null);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [intendedRole]);

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

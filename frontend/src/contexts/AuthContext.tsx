'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  updatePassword,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { configureAmplify } from '@/lib/amplify';
import { graphqlClient } from '@/lib/graphql';

import { ENSURE_PROFILE } from '@/graphql';

import { GET_MY_PROFILE } from '@/graphql/queries';

// GraphQL response types
interface GetMyProfileResponse {
  data?: {
    getMyProfile?: {
      displayName?: string;
    };
  };
}

interface EnsureProfileResponse {
  data?: {
    ensureProfile?: {
      displayName?: string;
    };
  };
}

// Ensure Amplify is configured before any auth operations
if (typeof window !== 'undefined') {
  configureAmplify();
}

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, screenName?: string) => Promise<{ isSignUpComplete: boolean; userId?: string }>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      // Get or derive display name for ensuring profile
      // Note: attributes.name from Cognito can be the Cognito username (not a display name)
      // So we prefer given_name (for Google OAuth) or email-based fallback
      const fallbackDisplayName = attributes.given_name || attributes.email?.split('@')[0] || 'Player';

      // First, try to get existing profile
      let profileDisplayName: string | undefined;
      try {
        const profileResult = await graphqlClient.graphql({
          query: GET_MY_PROFILE,
        });
        profileDisplayName = (profileResult as GetMyProfileResponse).data?.getMyProfile?.displayName;
      } catch {
        // Profile doesn't exist yet, will create below
      }

      // If no profile exists, create one
      if (!profileDisplayName) {
        try {
          const result = await graphqlClient.graphql({
            query: ENSURE_PROFILE,
            variables: { displayName: fallbackDisplayName },
          });
          profileDisplayName = (result as EnsureProfileResponse).data?.ensureProfile?.displayName;
        } catch {
          // Failed to create profile, will use fallback
        }
      }

      // Use profile displayName, or fallback
      setUser({
        userId: currentUser.userId,
        username: currentUser.username,
        email: attributes.email || '',
        name: profileDisplayName || fallbackDisplayName,
        picture: attributes.picture || undefined,
      });
    } catch {
      // User not logged in
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Listen for OAuth sign-in events (e.g., after Google redirect)
    const hubListener = Hub.listen('auth', async ({ payload }) => {
      if (payload.event === 'signInWithRedirect') {
        await loadUser();
      } else if (payload.event === 'signInWithRedirect_failure') {
        setUser(null);
        setIsLoading(false);
      } else if (payload.event === 'signedIn') {
        await loadUser();
      } else if (payload.event === 'signedOut') {
        setUser(null);
      }
    });

    // Initial load - this also handles OAuth redirect completion
    loadUser();

    return () => hubListener();
  }, [loadUser]);

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn({ username: email, password });

    if (result.isSignedIn) {
      await loadUser();
    } else if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
      throw new Error('CONFIRM_SIGN_UP_REQUIRED');
    }
  };

  const handleSignUp = async (email: string, password: string, screenName?: string) => {
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          ...(screenName && { preferred_username: screenName }),
        },
      },
    });

    return {
      isSignUpComplete: result.isSignUpComplete,
      userId: result.userId,
    };
  };

  const handleConfirmSignUp = async (email: string, code: string) => {
    await confirmSignUp({ username: email, confirmationCode: code });
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const handleResendConfirmationCode = async (email: string) => {
    await resendSignUpCode({ username: email });
  };

  const handleForgotPassword = async (email: string) => {
    await resetPassword({ username: email });
  };

  const handleConfirmForgotPassword = async (email: string, code: string, newPassword: string) => {
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    await updatePassword({ oldPassword, newPassword });
  };

  const getIdToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch {
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut,
    resendConfirmationCode: handleResendConfirmationCode,
    forgotPassword: handleForgotPassword,
    confirmForgotPassword: handleConfirmForgotPassword,
    changePassword: handleChangePassword,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

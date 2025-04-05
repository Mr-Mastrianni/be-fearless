import { ReactNode } from 'react';
import { AuthProvider as AuthContextProvider } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component wraps the application with the AuthContext
 * providing authentication state and functions to all child components
 */
const AuthProvider = ({ children }: AuthProviderProps) => {
  return <AuthContextProvider>{children}</AuthContextProvider>;
};

export default AuthProvider;

"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import api from '../services/api';

// Interfaz para el usuario decodificado
interface User {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  // Añade otros campos según tu payload
  groups?: string[];
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Al cargar la app, verificar el usuario desde la cookie
  useEffect(() => {
    if (pathname?.startsWith('/auth')) {
      setLoading(false);
      return;
    }
    const loadUser = async () => {
      try {
        const response = await api.get('usuarios/me/');
        // Aseguramos que `groups` sea un array
        const data = response.data || {};
        data.groups = Array.isArray(data.groups) ? data.groups : [];
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [pathname]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('auth/logout/');
    } catch (error) {
      // Ignorar errores de logout
    } finally {
      setUser(null);
      window.location.href = '/auth/signin';
    }
  };

  return (
    <AuthContext.Provider value={{user, loading, login, logout, hasRole: (r: string) => !!(user && user.groups && user.groups.includes(r)), hasAnyRole: (roles: string[]) => !!(user && user.groups && roles.some((rr) => user.groups!.includes(rr)))}}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

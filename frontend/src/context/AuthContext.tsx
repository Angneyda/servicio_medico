import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import {createContext, ReactNode, useContext, useEffect, useState} from 'react';

import api from '../services/api';

// Interfaz para el usuario decodificado
interface User {
  id: number;
  username: string;
  email: string;
  // Añade otros campos según tu payload
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refresh: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificar tokens y usuario
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        setUser(decoded);
      } catch (error) {
        console.error('Token invalido', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    const decoded = jwtDecode<User>(accessToken);
    setUser(decoded);
    // Configurar header por defecto
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/auth/signin';
  };

  return (
    <AuthContext.Provider value={{user, loading, login, logout}}>
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

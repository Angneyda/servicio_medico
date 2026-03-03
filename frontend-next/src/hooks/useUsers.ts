import { useState, useEffect } from 'react';
import api from '../services/api';

export interface UserRow {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  rol: string;
}

const useUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Llama al endpoint GET /api/usuarios/listar/
        const response = await api.get('/usuarios/listar/');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar usuarios');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};

export default useUsers;
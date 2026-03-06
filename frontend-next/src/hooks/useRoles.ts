import { useState, useEffect } from 'react';
import api from '../services/api';

export interface RoleRow {
  id: number;
  name: string;
  permissions: number[];
}

const useRoles = () => {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true); // Loading state for roles
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/usuarios/roles/'); // Fetch roles from API
        // API retorna grupos con campos: id, name, permissions (read nested)
        setRoles(response.data); // Set roles state with fetched data
      } catch (err) {
        setError('Error al cargar roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, setRoles, loading, error };
};

export default useRoles;

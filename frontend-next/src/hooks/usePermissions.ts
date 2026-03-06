import { useState, useEffect } from 'react';
import api from '../services/api';

export interface PermissionRow {
  id: number;
  codename: string;
  name: string;
}

const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await api.get('/usuarios/permissions/');
        setPermissions(resp.data || []);
      } catch (err) {
        setError('Error al cargar permisos');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { permissions, setPermissions, loading, error };
};

export default usePermissions;

import { useState, useEffect } from 'react';
import api from '../services/api';

interface MedicalStaff {
  id: number;
  nombre: string;
  especialidad: string;
  // Agrega otros campos aquí si es necesario
}

const useMedicalStaff = () => {
  const [staff, setStaff] = useState<MedicalStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get('/medical_staff/');
        setStaff(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar personal medico');
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  return { staff, loading, error };
};

export default useMedicalStaff;

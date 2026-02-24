export {}; // Ensure this is a module.
import { useState, useEffect } from 'react';
import api from '../services/api';

interface MedicalHistory {
  id: number;
  paciente_nombre: string;
  fecha_consulta: string;
  diagnostico: string;
  // Agrega otros campos aquí si es necesario
}

const useMedicalHistory = () => {
  const [history, setHistory] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/medical_history/'); // Ajusta la ruta a tu endpoint real
        setHistory(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar historias medicas');
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return { history, loading, error };
};

export default useMedicalHistory;

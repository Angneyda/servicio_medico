"use client";

import { useEffect, useState } from 'react';
import api from '@/services/api';
import ModalButton from '@/components/ModalButton';

interface Props {
  userPersonaId: number | null;
  open: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

interface Role {
  id: number;
  name: string;
  permissions?: number[];
}

const AssignRolesModal = ({ userPersonaId, open, onClose, onAssigned }: Props) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const [rResp, uResp] = await Promise.all([
          api.get('/usuarios/roles/'),
          userPersonaId ? api.get(`/usuarios/editar/${userPersonaId}/`) : Promise.resolve({ data: {} }),
        ]);

        setRoles(rResp.data || []);
        const gids = uResp.data?.group_ids || [];
        setSelected(Array.isArray(gids) ? gids : []);
      } catch (err) {
        setError('Error al cargar roles o usuario');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, userPersonaId]);

  const toggle = (id: number) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleSubmit = async () => {
    if (!userPersonaId) return;
    setLoading(true);
    try {
      await api.post(`/usuarios/roles/assign/${userPersonaId}/`, { group_ids: selected });
      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      setError('Error al asignar roles');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded bg-white p-6 dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold">Asignar Roles</h3>

        {loading ? (
          <div>Cargando...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="max-h-80 overflow-auto">
            {roles.map((r) => (
              <label key={r.id} className="flex items-center gap-2 p-2">
                <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                <span className="font-medium">{r.name}</span>
              </label>
            ))}
            {roles.length === 0 && <div>No hay roles disponibles.</div>}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <ModalButton outline variant="danger" size="sm" onClick={onClose}>Cancelar</ModalButton>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-success py-4 px-10 text-center font-medium text-success hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignRolesModal;

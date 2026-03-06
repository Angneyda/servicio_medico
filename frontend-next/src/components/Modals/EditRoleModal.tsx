"use client";

import { useEffect, useState } from 'react';
import api from '@/services/api';
import ModalButton from '@/components/ModalButton';

interface Props {
  roleId: number | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const EditRoleModal = ({ roleId, open, onClose, onSaved }: Props) => {
  const [name, setName] = useState('');
  const [permIds, setPermIds] = useState<number[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const [pResp, rResp] = await Promise.all([
          api.get('/usuarios/permissions/'),
          roleId ? api.get(`/usuarios/roles/${roleId}/`) : Promise.resolve({ data: {} }),
        ]);
        setPermissions(pResp.data || []);
        const role = rResp.data;
        setName(role?.name || '');
        setPermIds(role?.permissions?.map((p: any) => p.id) || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, roleId]);

  const toggle = (id: number) => {
    setPermIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const save = async () => {
    if (!roleId) return;
    setLoading(true);
    try {
      await api.put(`/usuarios/roles/${roleId}/`, { name, permission_ids: permIds });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded bg-white p-6 dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold">Editar Rol</h3>

        {loading ? (
          <div>Cargando...</div>
        ) : (
          <div>
            <input className="w-full rounded border px-2 py-1 mb-3" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="mb-3">
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Buscar permisos (ej. user, agenda, cita)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="max-h-60 overflow-auto space-y-3">
              {/* Agrupar permisos por modelo derivado del codename: 'add_logentry' -> 'logentry' */}
              {Object.entries(
                permissions
                  .filter((p: any) => p.codename.toLowerCase().includes(search.toLowerCase()))
                  .reduce((acc: any, p: any) => {
                    const parts = p.codename.split('_');
                    const model = parts.slice(1).join('_') || parts[0];
                    acc[model] = acc[model] || [];
                    acc[model].push(p);
                    return acc;
                  }, {})
              ).map(([model, perms]: any) => (
                <div key={model} className="border rounded p-2">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="capitalize">{model.replace(/_/g, ' ')}</strong>
                    <div className="flex gap-2">
                      <button
                        className="text-sm text-primary"
                        onClick={() => {
                          // seleccionar todos del grupo
                          const ids = (perms as any[]).map((x) => x.id);
                          setPermIds((s) => Array.from(new Set([...s, ...ids])));
                        }}
                      >
                        Seleccionar todo
                      </button>
                      <button
                        className="text-sm text-muted"
                        onClick={() => {
                          const ids = (perms as any[]).map((x) => x.id);
                          setPermIds((s) => s.filter((id) => !ids.includes(id)));
                        }}
                      >
                        Deseleccionar
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(perms as any[]).map((p: any) => (
                      <label key={p.id} className="inline-flex items-center gap-2 mr-2 mb-1">
                        <input type="checkbox" checked={permIds.includes(p.id)} onChange={() => toggle(p.id)} />
                        <span className="text-sm">{p.codename}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <ModalButton outline variant="danger" size="sm" onClick={onClose}>Cancelar</ModalButton>
          <ModalButton outline variant="success" size="sm" onClick={save} disabled={loading}>Guardar</ModalButton>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;

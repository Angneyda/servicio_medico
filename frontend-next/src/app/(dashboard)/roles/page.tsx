"use client";

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import useRoles from '@/hooks/useRoles';
import { useState } from 'react';
import api from '@/services/api';
import EditRoleModal from '@/components/Modals/EditRoleModal';

const RolesPage = () => {
  const { roles, loading, error, setRoles } = useRoles();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(roles.length / itemsPerPage));
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  
  const [editOpen, setEditOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  const createRole = async () => {
    if (!name) return;
    setCreating(true);
    try {
    const resp = await api.post('/usuarios/roles/', { name });
    // añadir al listado
    setRoles((prev) => [...prev, resp.data]);
      setName('');
      // Nota: los permisos se editan desde el modal "Editar"
    } catch {
      // Ignorar por ahora
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (id: number) => {
    setEditingRoleId(id);
    setEditOpen(true);
  };

  return (
    <div>
      <Breadcrumb pageName="Roles del sistema" />

      <div className="mt-4 rounded-sm border-2 border-gray-300 bg-white p-6 shadow-default dark:border-gray-600 dark:bg-boxdark">
        <h3 className="mb-4 text-xl font-semibold">Roles (Groups)</h3>

        <div className="mb-6">
          <h4 className="mb-2 font-semibold text-base">Crear nuevo rol</h4>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border px-2 py-1" placeholder="Nombre del rol" />
            <button onClick={createRole} className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 text-sm" disabled={creating}>Crear</button>
          </div>
          <div className="mt-2 text-base text-muted font-medium">Los permisos se asignan al rol desde el botón <strong>Editar</strong>.</div>
        </div>

        {loading ? (
          <div className="p-4">Cargando roles...</div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : roles.length === 0 ? (
          <div className="p-4">No hay roles definidos.</div>
        ) : (
          <>
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left border-b-2 border-gray-300 dark:border-gray-600">
                <th className="p-2 font-semibold text-base">ID</th>
                <th className="p-2 font-semibold text-base">Nombre</th>
                <th className="p-2 font-semibold text-base">Permisos</th>
              </tr>
            </thead>
            <tbody>
              {roles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((r) => (
                <tr key={r.id} className="border-t-2 border-gray-200 dark:border-gray-700">
                  <td className="p-2 font-medium text-base">{r.id}</td>
                  <td className="p-2 font-medium text-base">{r.name}</td>
                  <td className="p-2 font-medium text-base">{(r.permissions || []).length}</td>
                  <td className="p-2 text-right">
                    <button className="inline-flex items-center justify-center rounded-md border border-success py-2 px-4 text-center font-medium text-success hover:bg-opacity-90 text-sm" onClick={() => openEdit(r.id)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-center items-center gap-2">
            <button
              className="inline-flex items-center justify-center rounded-md border border-primary py-2 px-3 text-center font-medium text-primary hover:bg-opacity-90 text-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>

            {(() => {
              const delta = 1;
              const pages: Array<number | string> = [];
              if (totalPages <= 1) return null;
              pages.push(1);
              const left = Math.max(2, currentPage - delta);
              const right = Math.min(totalPages - 1, currentPage + delta);
              if (left > 2) pages.push('left-ellipsis');
              for (let i = left; i <= right; i++) pages.push(i);
              if (right < totalPages - 1) pages.push('right-ellipsis');
              if (totalPages > 1) pages.push(totalPages);

              return pages.map((p, idx) => {
                if (typeof p === 'string') return (
                  <span key={`e-${idx}`} className="px-2">...</span>
                );
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`inline-flex items-center justify-center rounded-md border ${p === currentPage ? 'border-primary bg-primary text-white' : 'border-primary text-primary bg-transparent'} py-2 px-3 text-center font-medium text-sm`}
                  >
                    {p}
                  </button>
                );
              });
            })()}

            <button
              className="inline-flex items-center justify-center rounded-md border border-primary py-2 px-3 text-center font-medium text-primary hover:bg-opacity-90 text-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
          </>
        )}
      </div>
      <EditRoleModal roleId={editingRoleId} open={editOpen} onClose={() => setEditOpen(false)} onSaved={() => window.location.reload()} />
    </div>
  );
};

export default RolesPage;

"use client";

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import usePermissions from '@/hooks/usePermissions';
import { useState } from 'react';
import api from '@/services/api';

import type { PermissionRow } from '@/hooks/usePermissions';

const PermissionsPage = () => {
  const { permissions, loading, error, setPermissions } = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(permissions.length / itemsPerPage));
  const [codename, setCodename] = useState('');
  const [name, setName] = useState('');
  const [route, setRoute] = useState('');
  const [creating, setCreating] = useState(false);

  const normalizeCodename = (r: string) => {
    if (!r) return '';
    // Mantener esta lógica alineada con el backend (RoutePermission.normalize_codename)
    let s = r.trim();
    if (s.startsWith('/')) s = s.slice(1);
    s = s.split('?')[0];
    s = s.replace(/\//g, '_');
    s = s.replace(/[^a-zA-Z0-9_]/g, '');
    s = s.replace(/_+/g, '_');
    s = s.replace(/^_+|_+$/g, '');
    return s ? `access_${s}` : 'access_root';
  };

  const createPermission = async () => {
    if (!name || (!codename && !route)) return;
    setCreating(true);
    try {
      const finalCodename = codename || normalizeCodename(route);
      const resp = await api.post('/usuarios/permissions/', { codename: finalCodename, name });
      const created = resp.data as PermissionRow;
      setPermissions((prev) => [...prev, created]);
      setCodename('');
      setName('');
      setRoute('');
    } catch {
      // ignore for now
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/usuarios/permissions/${id}/`);
      setPermissions((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Permisos del sistema" />

      <div className="mt-4 rounded-sm border-2 border-gray-300 bg-white p-6 shadow-default dark:border-gray-600 dark:bg-boxdark">
        <h3 className="mb-4 text-xl font-semibold">Permisos</h3>

        <div className="mb-4">
          <h4 className="mb-2 font-semibold text-base">Crear permiso (opcional: mapear ruta)</h4>
          <div className="flex gap-2 mb-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre legible" className="rounded border px-2 py-1" />
            <input value={codename} onChange={(e) => setCodename(e.target.value)} placeholder="Codename (opcional)" className="rounded border px-2 py-1" />
            <input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="Ruta (opcional) /users" className="rounded border px-2 py-1" />
            <button onClick={createPermission} disabled={creating} className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 text-sm">Crear</button>
          </div>
          <p className="text-base text-gray-500 font-medium">Si proporciona una ruta, se generará un codename a partir de ella (ej: <em>access_users</em>).</p>
        </div>

        {loading ? (
          <div>Cargando permisos...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left border-b-2 border-gray-300 dark:border-gray-600">
                <th className="p-2 font-semibold text-base">ID</th>
                <th className="p-2 font-semibold text-base">Codename</th>
                <th className="p-2 font-semibold text-base">Nombre</th>
                <th className="p-2 font-semibold text-base">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {permissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((p) => (
                <tr key={p.id} className="border-t-2 border-gray-200 dark:border-gray-700">
                  <td className="p-2 font-medium text-base">{p.id}</td>
                  <td className="p-2 font-medium text-base">{p.codename}</td>
                  <td className="p-2 font-medium text-base">{p.name}</td>
                  <td className="p-2">
                    <button className="mr-2 inline-flex items-center justify-center rounded-md border border-danger py-2 px-3 text-center font-medium text-danger hover:bg-opacity-90 text-sm" onClick={() => remove(p.id)}>Eliminar</button>
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
              const delta = 1; // pages around current
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
    </div>
  );
};

export default PermissionsPage;

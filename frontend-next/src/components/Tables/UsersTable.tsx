"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import { UserRow } from '../../hooks/useUsers';

interface UsersTableProps {
  users: UserRow[];
}

const UsersTable = ({ users }: UsersTableProps) => {
  const router = useRouter();

  // filtros por columna
  const [filterCedula, setFilterCedula] = useState('');
  const [filterNombre, setFilterNombre] = useState('');
  const [filterApellido, setFilterApellido] = useState('');
  const [filterRol, setFilterRol] = useState('');
  // paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      await api.delete(`/usuarios/eliminar/${id}/`);
      // Recargamos la página para refrescar la lista y mostrar mensaje
      window.location.href = '/users?deleted=1';
    } catch {
      alert('Ocurrió un error al intentar eliminar el usuario.');
    }
  };

  const filteredUsers = useMemo(() => {
    const fc = filterCedula.trim().toLowerCase();
    const fn = filterNombre.trim().toLowerCase();
    const fa = filterApellido.trim().toLowerCase();
    const fr = filterRol.trim().toLowerCase();

    return users.filter((u) => {
      return (
        (fc === '' || (u.cedula || '').toLowerCase().includes(fc)) &&
        (fn === '' || (u.nombre || '').toLowerCase().includes(fn)) &&
        (fa === '' || (u.apellido || '').toLowerCase().includes(fa)) &&
        (fr === '' || (u.rol || '').toLowerCase().includes(fr))
      );
    });
  }, [users, filterCedula, filterNombre, filterApellido, filterRol]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  // Avoid calling setState synchronously inside effects — derive an effective page
  const effectivePage = Math.min(Math.max(1, currentPage), totalPages);
  const pageItems = filteredUsers.slice((effectivePage - 1) * pageSize, effectivePage * pageSize);

  return (
    <div className="rounded-sm border-2 border-gray-300 bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-600 dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-4 text-center text-xl font-semibold text-black dark:text-white">
         Lista de Usuarios del Sistema
      </h4>

      <div className="flex flex-col">
        {/* Encabezados */}
        <div className="grid grid-cols-5 rounded-sm border-b border-gray-400 bg-gray-2 dark:border-gray-500 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-semibold uppercase xsm:text-base">Cédula</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-semibold uppercase xsm:text-base">Nombre</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-semibold uppercase xsm:text-base">Apellido</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-semibold uppercase xsm:text-base">Rol</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-semibold uppercase xsm:text-base">Acciones</h5>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-5 gap-0 border-b border-gray-200 bg-white/50 dark:border-gray-700">
          <div className="p-2.5 xl:p-3">
            <input
              value={filterCedula}
              onChange={(e) => {
                setFilterCedula(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filtrar cédula"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="p-2.5 xl:p-3">
            <input
              value={filterNombre}
              onChange={(e) => {
                setFilterNombre(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filtrar nombre"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="p-2.5 xl:p-3">
            <input
              value={filterApellido}
              onChange={(e) => {
                setFilterApellido(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filtrar apellido"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="p-2.5 xl:p-3">
            <input
              value={filterRol}
              onChange={(e) => {
                setFilterRol(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filtrar rol"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="p-2.5 xl:p-3 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setFilterCedula('');
                setFilterNombre('');
                setFilterApellido('');
                setFilterRol('');
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Filas */}
        {filteredUsers.length === 0 ? (
          <div className="p-5 text-center font-semibold text-gray-700 dark:text-gray-200">
            No hay usuarios registrados.
          </div>
        ) : (
          pageItems.map((user, index) => (
            <div
              key={user.id}
              className={`grid grid-cols-5 items-center ${
                index === pageItems.length - 1
                  ? ''
                  : 'border-b border-gray-300 dark:border-gray-500'
              }`}
            >
              <div className="p-2.5 xl:p-5">
                <p className="font-semibold text-black dark:text-white">{user.cedula}</p>
              </div>
              <div className="p-2.5 xl:p-5">
                <p className="font-semibold text-black dark:text-white">{user.nombre}</p>
              </div>
              <div className="p-2.5 xl:p-5">
                <p className="font-semibold text-black dark:text-white">{user.apellido}</p>
              </div>
              <div className="p-2.5 xl:p-5">
                <p className="font-semibold text-black dark:text-white">{user.rol}</p>
              </div>
              <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5">
                <button
                  type="button"
                  onClick={() => router.push(`/users/${user.id}/edit`)}
                  className="inline-flex items-center justify-center rounded-md border border-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(user.id)}
                  className="inline-flex items-center justify-center rounded-md border border-red-500 px-4 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))
        )}
        {/* Paginación centrada */}
        {filteredUsers.length > pageSize && (
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="mx-2 inline-flex items-center justify-center rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
            >
              Anterior
            </button>

            <div className="mx-2 flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1 rounded text-sm ${
                    p === currentPage
                      ? 'bg-primary text-white'
                      : 'border border-gray-300 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="mx-2 inline-flex items-center justify-center rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTable;

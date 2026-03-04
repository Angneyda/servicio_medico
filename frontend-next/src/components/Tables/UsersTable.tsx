"use client";

import { useRouter } from 'next/navigation';
import { UserRow } from '../../hooks/useUsers';

interface UsersTableProps {
  users: UserRow[];
}

const UsersTable = ({ users }: UsersTableProps) => {
  const router = useRouter();

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-4 text-center text-xl font-semibold text-black dark:text-white">
        Usuarios del sistema
      </h4>

      <div className="flex flex-col">
        {/* Encabezados */}
        <div className="grid grid-cols-5 rounded-sm border-b-2 border-gray-300 bg-gray-2 dark:border-gray-600 dark:bg-meta-4">
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

        {/* Filas */}
        {users.length === 0 ? (
          <div className="p-5 text-center font-semibold text-gray-700 dark:text-gray-200">
            No hay usuarios registrados.
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className={`grid grid-cols-5 items-center ${
                index === users.length - 1
                  ? ''
                  : 'border-b-2 border-gray-300 dark:border-gray-600'
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
                  className="rounded border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded border border-red-500 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UsersTable;

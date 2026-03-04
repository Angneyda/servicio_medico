"use client";

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import UsersTable from '@/components/Tables/UsersTable';
import useUsers from '@/hooks/useUsers';
import { useRouter, useSearchParams } from 'next/navigation';

const UsersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const created = searchParams.get('created');
  const updated = searchParams.get('updated');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { users, loading, error } = useUsers();

  useEffect(() => {
    if (created === '1') {
      setSuccessMessage('Usuario registrado correctamente.');
      return;
    }

    if (updated === '1') {
      setSuccessMessage('Usuario actualizado correctamente.');
      return;
    }

    setSuccessMessage(null);
  }, [created, updated]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  return (
    <>
      <Breadcrumb pageName="Usuarios" />

      {successMessage && (
        <div className="mb-4 flex items-center justify-between rounded border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-200">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="ml-4 text-xs font-bold text-emerald-700 underline hover:text-emerald-900 dark:text-emerald-200 dark:hover:text-emerald-50"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="mb-4 flex items-start justify-between gap-4">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-opacity-90"
          onClick={() => router.push('/users/new')}
        >
          Nuevo usuario
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="p-5 text-center font-semibold text-gray-700 dark:text-gray-200">
            Cargando usuarios...
          </div>
        ) : error ? (
          <div className="p-5 text-center font-semibold text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : (
          <UsersTable users={users} />
        )}
      </div>
    </>
  );
};

export default UsersPage;

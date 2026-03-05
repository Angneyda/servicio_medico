"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import api from '@/services/api';
import type { AxiosError } from 'axios';

interface FormState {
  username: string;
  email: string;
  password: string;
  cedula: string;
  nombre: string;
  apellido: string;
  sexo: string;
  fecha_nacimiento: string;
  telefono: string;
  tipo_persona: string;
  estatus: string;
}

const initialFormState: FormState = {
  username: '',
  email: '',
  password: '',
  cedula: '',
  nombre: '',
  apellido: '',
  sexo: '',
  fecha_nacimiento: '',
  telefono: '',
  tipo_persona: '1',
  estatus: '1',
};

const NewUserPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        cedula: form.cedula,
        nombre: form.nombre,
        apellido: form.apellido,
        sexo: form.sexo,
        fecha_nacimiento: form.fecha_nacimiento,
        telefono: form.telefono,
        tipo_persona: Number(form.tipo_persona),
        estatus: Number(form.estatus),
      };

      await api.post('/usuarios/registro/', payload);
      router.push('/users?created=1');
    } catch (err) {
      const axiosError = err as AxiosError<unknown>;
      const backendDetail = axiosError.response?.data;
      if (backendDetail) {
        setError(`Error al registrar usuario: ${JSON.stringify(backendDetail)}`);
      } else {
        setError('Error al registrar usuario.');
      }
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Nuevo usuario" parentName="Usuarios" parentHref="/users" />
      <div className="rounded-md border border-primary/30 bg-white/80 p-6 shadow-md shadow-primary/5 dark:border-primary/40 dark:bg-boxdark/80">
        <h4 className="mb-4 text-lg font-bold text-primary dark:text-primary">
          Registrar nuevo usuario
        </h4>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-base font-semibold text-red-600 dark:border-red-500 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-black dark:text-white" htmlFor="username">
              Nombre de usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-black dark:text-white" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-black dark:text-white" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-black dark:text-white" htmlFor="cedula">
              Cédula
            </label>
            <input
              id="cedula"
              name="cedula"
              type="text"
              value={form.cedula}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-black dark:text-white" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-black dark:text-white" htmlFor="apellido">
              Apellido
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              value={form.apellido}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-black dark:text-white" htmlFor="sexo">
              Sexo
            </label>
            <select
              id="sexo"
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
            >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="fecha_nacimiento"
            >
              Fecha de Nacimiento
            </label>
            <input
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              type="date"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-black dark:text-white" htmlFor="telefono">
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="text"
              value={form.telefono}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="tipo_persona"
            >
              Tipo de usuario
            </label>
            <select
              id="tipo_persona"
              name="tipo_persona"
              value={form.tipo_persona}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
            >
              <option value="1">Personal</option>
              <option value="2">Jubilado</option>
              <option value="3">Familiar</option>
              <option value="4">Cortesía</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-black dark:text-white" htmlFor="estatus">
              Estatus
            </label>
            <select
              id="estatus"
              name="estatus"
              value={form.estatus}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
            >
              <option value="1">Activo</option>
              <option value="2">Inactivo</option>
            </select>
          </div>

          <div className="mt-4 flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Guardando...' : 'Guardar usuario'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/users')}
              className="inline-flex items-center justify-center rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewUserPage;

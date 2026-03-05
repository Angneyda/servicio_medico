"use client";

// Hooks de React
import { useEffect, useState } from 'react';
// Router de Next para navegar entre páginas
import { useRouter, useParams } from 'next/navigation';
// Breadcrumb ya existente en tu proyecto (para el título arriba)
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
// Cliente axios configurado que ya usas en otras partes
import api from '@/services/api';
// Tipo de error de axios, solo para tipar bien
import type { AxiosError } from 'axios';

// ----------------------
// Definimos la forma de los datos del formulario
// (coincide con lo que devuelve el backend en /usuarios/editar/:id/)
// ----------------------
interface FormState {
  username: string;
  email: string;
  cedula: string;
  nombre: string;
  apellido: string;
  sexo: string;
  fecha_nacimiento: string;
  telefono: string;
  tipo_persona: string;
  estatus: string;
}

// Estado inicial del formulario (valores vacíos o por defecto)
const initialFormState: FormState = {
  username: '',
  email: '',
  cedula: '',
  nombre: '',
  apellido: '',
  sexo: '',
  fecha_nacimiento: '',
  telefono: '',
  tipo_persona: '1',
  estatus: '1',
};


// Componente principal de la página de edición
const EditUserPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  // Estado del formulario con los datos del usuario/persona
  const [form, setForm] = useState<FormState>(initialFormState);
  // Loading mientras traemos los datos del backend
  const [loading, setLoading] = useState(true);
  // Estado mientras se envían cambios
  const [submitting, setSubmitting] = useState(false);
  // Texto de error (para mostrar arriba del formulario)
  const [error, setError] = useState<string | null>(null);

  // ----------------------
  // useEffect: cuando se monta la página o cambia el id,
  // pedimos al backend los datos actuales del usuario/persona
  // ----------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Llamamos al endpoint que ya probaste en Postman
        const response = await api.get(`/usuarios/editar/${id}/`);

        // Tipamos el posible contenido de response.data
        const data = response.data as Partial<
          FormState & { tipo_persona: number; estatus: number }
        >;

        // Llenamos el formulario con lo que envía el backend.
        // Usamos ?? '' para evitar undefined.
        setForm({
          username: data.username ?? '',
          email: data.email ?? '',
          cedula: data.cedula ?? '',
          nombre: data.nombre ?? '',
          apellido: data.apellido ?? '',
          sexo: data.sexo ?? '',
          // fecha_nacimiento ya viene como string "YYYY-MM-DD" desde DRF
          fecha_nacimiento: data.fecha_nacimiento ?? '',
          telefono: data.telefono ?? '',
          // tipo_persona y estatus vienen como números, los convertimos a string
          tipo_persona:
            data.tipo_persona != null ? String(data.tipo_persona) : '1',
          estatus: data.estatus != null ? String(data.estatus) : '1',
        });
        setLoading(false);
      } catch {
        setError('Error al cargar los datos del usuario.');
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // ----------------------
  // handleChange: se llama cada vez que el usuario escribe en un input/select
  // Actualiza el estado 'form' usando el name del campo
  // ----------------------
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ----------------------
  // handleSubmit: se llama al enviar el formulario
  // Hace un PUT a /usuarios/editar/:id/ con los datos del form
  // ----------------------
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Payload que espera el backend (mismo shape que probaste en Postman)
      const payload = {
        username: form.username,
        email: form.email,
        cedula: form.cedula,
        nombre: form.nombre,
        apellido: form.apellido,
        sexo: form.sexo,
        fecha_nacimiento: form.fecha_nacimiento,
        telefono: form.telefono,
        tipo_persona: Number(form.tipo_persona),
        estatus: Number(form.estatus),
      };

      await api.put(`/usuarios/editar/${id}/`, payload);
      // Volvemos al listado con un flag de "actualizado"
      router.push('/users?updated=1');
    } catch (err) {
      const axiosError = err as AxiosError<unknown>;
      const backendDetail = axiosError.response?.data;
      if (backendDetail) {
        setError(`Error al actualizar usuario: ${JSON.stringify(backendDetail)}`);
      } else {
        setError('Error al actualizar usuario.');
      }
      setSubmitting(false);
    }
  };

  // Si todavía estamos cargando los datos iniciales, mostramos solo un mensaje
  if (loading) {
      return (
        <div className="rounded-md border border-primary/30 bg-white/80 p-6 text-center text-base font-semibold text-gray-700 shadow-md shadow-primary/5 dark:border-primary/40 dark:bg-boxdark/80 dark:text-gray-100">
          Cargando datos del usuario...
        </div>
      );
  }

  // ----------------------
  // JSX principal: breadcrumb + formulario de edición
  // ----------------------
  const displayName = `${form.nombre || ''} ${form.apellido || ''}`.trim();
  const pageName = displayName ? `Editar usuario ${displayName}` : `Editar usuario #${id}`;

  return (
    <>
      <Breadcrumb pageName={pageName} parentName="Usuarios" parentHref="/users" />
      <div className="rounded-md border border-primary/30 bg-white/80 p-6 shadow-md shadow-primary/5 dark:border-primary/40 dark:bg-boxdark/80">
        <h4 className="mb-4 text-lg font-bold text-primary dark:text-primary">
          Editar datos de usuario
        </h4>
        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-base font-semibold text-red-600 dark:border-red-500 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="username"
            >
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

          {/* Correo */}
          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="email"
            >
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
            />
          </div>

          {/* Cédula */}
          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="cedula"
            >
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

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="nombre"
            >
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

          {/* Apellido */}
          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="apellido"
            >
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

          {/* Sexo */}
          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="sexo"
            >
              Sexo
            </label>
            <select
              id="sexo"
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
            >
              <option value="">Seleccione</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>

          {/* Fecha de nacimiento */}
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
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="telefono"
            >
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="text"
              value={form.telefono}
              onChange={handleChange}
              className="w-full rounded border border-primary/50 bg-white px-3 py-2 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2 dark:border-primary/60 dark:bg-boxdark dark:text-white"
            />
          </div>

          {/* Tipo de persona */}
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

          {/* Estatus */}
          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-black dark:text-white"
              htmlFor="estatus"
            >
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

          {/* Botones */}
          <div className="mt-4 flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Guardando cambios...' : 'Guardar cambios'}
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

export default EditUserPage;
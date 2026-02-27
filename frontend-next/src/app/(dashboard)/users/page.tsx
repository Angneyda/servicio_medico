// Indica que este componente se renderiza en el cliente
"use client";
// Importa useState de React para manejar estado
import { useState } from 'react';
// Importa el cliente API configurado
import api from '@/services/api';
// Define el componente de pantalla de usuarios
const UsersPage = () => {
  // Estado para el JSON del formulario
  const [payload, setPayload] = useState<string>(
    '{\n  "username": "demo.user",\n  "password": "Demo12345!",\n  "email": "demo.user@sismed.test",\n  "first_name": "Demo",\n  "last_name": "User",\n  "persona": {\n    "cedula": "V12345678",\n    "nombre": "Demo",\n    "apellido": "User",\n    "sexo": "M",\n    "fecha_nacimiento": "1990-01-01",\n    "correo": "demo.user@sismed.test",\n    "telefono": "04141234567",\n    "tipo_persona": "PACIENTE",\n    "estatus": 1\n  }\n}'
  );
  // Estado para loading del envío
  const [loading, setLoading] = useState(false);
  // Estado para mensajes de éxito
  const [success, setSuccess] = useState<string | null>(null);
  // Estado para mensajes de error
  const [error, setError] = useState<string | null>(null);

  // Maneja el submit del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    // Previene el envío por defecto
    event.preventDefault();
    // Limpia mensajes anteriores
    setSuccess(null);
    // Limpia mensajes de error anteriores
    setError(null);
    // Activa loading
    setLoading(true);
    // Intenta ejecutar la petición
    try {
      // Parsea el JSON de entrada
      const data = JSON.parse(payload) as Record<string, unknown>;
      // Ejecuta el POST al endpoint de creación
      const response = await api.post('users/', data);
      // Muestra el resultado
      setSuccess(JSON.stringify(response.data, null, 2));
    } catch (submitError) {
      // Muestra el error en pantalla
      setError(submitError instanceof Error ? submitError.message : 'Error desconocido');
    } finally {
      // Desactiva loading
      setLoading(false);
    }
  };

  // Renderiza la vista
  return (
    <div className="mx-auto w-full max-w-4xl"> {/* Contenedor principal */}
      <h1 className="mb-4 text-2xl font-bold text-black dark:text-white"> {/* Título */}
        {'Crear usuario + persona'} {/* Texto del título */}
      </h1>
      <p className="mb-6 text-sm text-bodydark2"> {/* Descripción */}
        {'Pega el JSON con los datos del usuario y la persona. Debes estar autenticado como admin.'} {/* Texto descriptivo */}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4"> {/* Formulario */}
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark"> {/* Caja */}
          <label className="mb-2 block text-sm font-medium text-black dark:text-white"> {/* Etiqueta */}
            JSON de usuario + persona
          </label>
          <textarea
            className="h-72 w-full rounded border border-stroke bg-transparent p-3 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:text-white" /* Estilos */
            value={payload} /* Valor controlado */
            onChange={(event) => setPayload(event.target.value)} /* Manejador */
          />
        </div>
        <button
          type="submit" /* Tipo de botón */
          className="rounded bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-opacity-90" /* Estilos */
          disabled={loading} /* Estado disabled */
        >
          {loading ? 'Enviando...' : 'Crear usuario'} {/* Texto del botón */}
        </button>
      </form>
      {success && ( /* Bloque de éxito */
        <div className="mt-4 rounded border border-green-500 bg-green-50 p-4 text-xs text-green-700"> {/* Contenedor éxito */}
          <pre className="whitespace-pre-wrap">{success}</pre> {/* Resultado */}
        </div>
      )}
      {error && ( /* Bloque de error */
        <div className="mt-4 rounded border border-red-500 bg-red-50 p-4 text-xs text-red-700"> {/* Contenedor error */}
          {error} {/* Mensaje de error */}
        </div>
      )}
    </div>
  );
};

// Exporta el componente
export default UsersPage;

"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const SignInPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('auth/login/', { username, password });
      login(response.data.access, response.data.refresh);
      router.replace('/dashboard');
    } catch (err: unknown) {
      console.error(err);
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response?.status === 'number' &&
        (err as { response: { status: number } }).response.status === 401
      ) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Visual */}
      <div className="relative w-full md:w-1/2 h-64 md:h-auto flex flex-col justify-end">
        <Image
          src="/images/cover/fondomedicologuin3.jpeg"
          alt="Profesional de la salud"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 20% 50%, rgba(74,134,168,0.18) 0%, rgba(74,134,168,0.45) 60%, rgba(74,134,168,0.85) 100%)',
          }}
        />
        <div className="relative z-10 flex flex-col items-center pb-10">
          <div className="bg-white/80 rounded-full px-6 py-2 mb-3 shadow-md">
            <span className="text-3xl font-bold text-[#4A86A8] tracking-wide">
              SISMED
            </span>
          </div>
          <span className="text-white text-sm md:text-base font-light">
            Sistema de Servicio Medico
          </span>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white py-12 px-6 md:px-16">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 transition-transform hover:scale-105 duration-300">
              <Image
                src="/images/cover/logo-conatel-medico.jpeg"
                alt="Servicio Médico CONATEL"
                width={256}
                height={164}
                className="h-41 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-[#1e3a8a]">
              Iniciar sesión
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50 placeholder-gray-400 outline-none"
                placeholder="jcabrices"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50 placeholder-gray-400 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[#4A86A8] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#4169E1] text-white font-semibold text-base shadow hover:bg-[#41749a] transition disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>

            <div className="flex items-center justify-center">
              <span className="text-gray-400 text-xs">o</span>
            </div>

            <Link
              href="/auth/signup"
              className="block w-full py-3 rounded-lg bg-[#4169E1] text-white font-semibold text-base shadow hover:bg-[#41749a] transition text-center"
            >
              Nuevo Registro
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
